import json
import hashlib
import asyncio
from pathlib import Path
from typing import List, Union
import numpy as np

from anchorpy import Program, Provider, Wallet, Idl, Context
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.message import MessageV0
from solders.transaction import VersionedTransaction

PROGRAM_ID = Pubkey.from_string("B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ")
DEFAULT_KEYPAIR_PATH = Path.home() / ".config" / "solana" / "id.json"
IDL_PATH = Path("target/idl/contribution_registry.json")
from solders.system_program import ID as SYSTEM_PROGRAM_ID


def hash_weights(weights: List[np.ndarray]) -> bytes:
    hasher = hashlib.sha256()
    for arr in weights:
        hasher.update(arr.tobytes())
    return hasher.digest()


def fix_idl_for_anchorpy(idl_dict: dict) -> dict:
    idl = json.loads(json.dumps(idl_dict))

    if "metadata" in idl:
        if "name" not in idl and "name" in idl["metadata"]:
            idl["name"] = idl["metadata"]["name"]
        if "version" not in idl and "version" in idl["metadata"]:
            idl["version"] = idl["metadata"]["version"]

    if "instructions" in idl:
        for ix in idl["instructions"]:
            if "accounts" in ix:
                clean_accounts = []
                for acc in ix["accounts"]:
                    clean_accounts.append({
                        "name": acc["name"],
                        "isMut": acc.get("writable", False) or acc.get("isMut", False),
                        "isSigner": acc.get("signer", False) or acc.get("isSigner", False)
                    })
                ix["accounts"] = clean_accounts

    types_map = {}
    if "types" in idl:
        for t in idl["types"]:
            types_map[t["name"]] = t.get("type", {})

    if "accounts" in idl:
        fixed_accounts = []
        for acc in idl["accounts"]:
            acc_copy = dict(acc)
            if "type" not in acc_copy and acc_copy["name"] in types_map:
                acc_copy["type"] = types_map[acc_copy["name"]]
            fixed_accounts.append(acc_copy)
        idl["accounts"] = fixed_accounts

    def convert_pubkey_variant(obj):
        if isinstance(obj, dict):
            return {k: convert_pubkey_variant(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_pubkey_variant(elem) for elem in obj]
        elif isinstance(obj, str) and obj == "pubkey":
            return "publicKey"
        return obj

    return convert_pubkey_variant(idl)


async def record_contribution_async(
    contribution_hash: bytes,
    hospital_authority_pubkey: Union[Pubkey, None] = None,
    keypair_path: Union[str, Path] = DEFAULT_KEYPAIR_PATH
) -> str:
    keypair_path = Path(keypair_path)
    if not keypair_path.exists():
        raise FileNotFoundError(f"Arquivo de chaveiro não encontrado em {keypair_path}")

    with open(keypair_path, "r") as f:
        secret_key = json.load(f)
    admin_keypair = Keypair.from_bytes(bytes(secret_key))
    wallet = Wallet(admin_keypair)

    if hospital_authority_pubkey is None:
        hospital_authority_pubkey = admin_keypair.pubkey()

    connection = AsyncClient("https://api.devnet.solana.com")
    provider = Provider(connection, wallet)

    if not IDL_PATH.exists():
        raise FileNotFoundError(
            f"Arquivo IDL não encontrado em {IDL_PATH}. Execute 'anchor build' primeiro."
        )

    with open(IDL_PATH, "r") as f:
        raw_idl = json.load(f)

    fixed_idl = fix_idl_for_anchorpy(raw_idl)
    idl = Idl.from_json(json.dumps(fixed_idl))

    program = Program(idl, PROGRAM_ID, provider)

    registry_config, _ = Pubkey.find_program_address([b"config"], PROGRAM_ID)
    hospital_profile, _ = Pubkey.find_program_address(
        [b"hospital", bytes(hospital_authority_pubkey)], PROGRAM_ID
    )

    hash_as_list = [int(b) for b in contribution_hash]

    ctx = Context(
        accounts={
            "registry_config": registry_config,
            "hospital_profile": hospital_profile,
            "admin": admin_keypair.pubkey(),
        }
    )

    tx_sig = await program.rpc["record_contribution"](
        hash_as_list,
        ctx=ctx,
    )

    await connection.close()
    return str(tx_sig)


def record_contribution(
    weights: List[np.ndarray],
    hospital_authority_pubkey: Union[Pubkey, None] = None,
    keypair_path: Union[str, Path] = DEFAULT_KEYPAIR_PATH
) -> str:
    h = hash_weights(weights)
    return asyncio.run(record_contribution_async(h, hospital_authority_pubkey, keypair_path))


async def main_test():
    admin_keypair_path = DEFAULT_KEYPAIR_PATH
    with open(admin_keypair_path, "r") as f:
        admin_keypair = Keypair.from_bytes(bytes(json.load(f)))

    hospital_keypair_path = Path("ml/bridge/hospital_test.json")
    if not hospital_keypair_path.exists():
        hospital_kp = Keypair()
        with open(hospital_keypair_path, "w") as f:
            json.dump(list(bytes(hospital_kp)), f)
    else:
        with open(hospital_keypair_path, "r") as f:
            hospital_kp = Keypair.from_bytes(bytes(json.load(f)))

    connection = AsyncClient("https://api.devnet.solana.com")

    bal = (await connection.get_balance(hospital_kp.pubkey())).value
    if bal < 10_000_000:
        blockhash = (await connection.get_latest_blockhash()).value.blockhash
        transfer_ix = transfer(
            TransferParams(
                from_pubkey=admin_keypair.pubkey(),
                to_pubkey=hospital_kp.pubkey(),
                lamports=20_000_000
            )
        )
        msg = MessageV0.try_compile(
            payer=admin_keypair.pubkey(),
            instructions=[transfer_ix],
            address_lookup_table_accounts=[],
            recent_blockhash=blockhash
        )
        tx = VersionedTransaction(msg, [admin_keypair])
        await connection.send_transaction(tx)
        await asyncio.sleep(2)

    hospital_profile, _ = Pubkey.find_program_address(
        [b"hospital", bytes(hospital_kp.pubkey())], PROGRAM_ID
    )
    acc_info = await connection.get_account_info(hospital_profile)
    if acc_info.value is None:
        wallet = Wallet(hospital_kp)
        provider = Provider(connection, wallet)
        with open(IDL_PATH, "r") as f:
            raw_idl = json.load(f)
        idl = Idl.from_json(json.dumps(fix_idl_for_anchorpy(raw_idl)))
        program = Program(idl, PROGRAM_ID, provider)

        ctx = Context(
            accounts={
                "hospital_profile": hospital_profile,
                "authority": hospital_kp.pubkey(),
                "system_program": SYSTEM_PROGRAM_ID,
            }
        )
        await program.rpc["register_hospital"](ctx=ctx)
        await asyncio.sleep(2)

    await connection.close()

    dummy_weights = [np.ones((10, 10), dtype=np.float32)]
    h = hash_weights(dummy_weights)
    print("Testando ponte com a Solana Devnet...")
    sig = await record_contribution_async(h, hospital_kp.pubkey(), admin_keypair_path)
    print(f"Contribuição gravada! TX: https://explorer.solana.com/tx/{sig}?cluster=devnet")


if __name__ == "__main__":
    asyncio.run(main_test())
