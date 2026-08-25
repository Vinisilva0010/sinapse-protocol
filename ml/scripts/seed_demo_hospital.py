import asyncio
import json
import time
from pathlib import Path
import numpy as np

from anchorpy import Program, Provider, Wallet, Idl, Context
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer, ID as SYSTEM_PROGRAM_ID
from solders.message import MessageV0
from solders.transaction import VersionedTransaction

from ml.bridge.solana_bridge import (
    PROGRAM_ID,
    DEFAULT_KEYPAIR_PATH,
    IDL_PATH,
    fix_idl_for_anchorpy,
    hash_weights,
)

RPC_URL = "https://devnet.helius-rpc.com/?api-key=99a74efc-f197-45d6-a462-1ef1672319aa"

ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

def to_base58(raw_bytes: bytes) -> str:
    n = int.from_bytes(raw_bytes, "big")
    res = []
    while n > 0:
        n, r = divmod(n, 58)
        res.append(ALPHABET[r])
    res = "".join(reversed(res))
    pad = 0
    for byte in raw_bytes:
        if byte == 0:
            pad += 1
        else:
            break
    return "1" * pad + res

async def seed_hospital():
    with open(DEFAULT_KEYPAIR_PATH, "r") as f:
        admin_keypair = Keypair.from_bytes(bytes(json.load(f)))

    hospital_keypair = Keypair()
    hospital_pubkey = hospital_keypair.pubkey()
    hospital_b58_secret = to_base58(bytes(hospital_keypair))

    print(f"Hospital Wallet: {hospital_pubkey}")
    print(f"Private Key (Base58 para Phantom): {hospital_b58_secret}")
    print("---")

    connection = AsyncClient(RPC_URL)

    print("1. Financiando carteira do hospital com 0.05 SOL...")
    latest_blockhash = (await connection.get_latest_blockhash()).value.blockhash
    transfer_ix = transfer(
        TransferParams(
            from_pubkey=admin_keypair.pubkey(),
            to_pubkey=hospital_pubkey,
            lamports=50_000_000,
        )
    )
    msg = MessageV0.try_compile(
        payer=admin_keypair.pubkey(),
        instructions=[transfer_ix],
        address_lookup_table_accounts=[],
        recent_blockhash=latest_blockhash,
    )
    tx = VersionedTransaction(msg, [admin_keypair])
    await connection.send_raw_transaction(bytes(tx))
    await asyncio.sleep(2)

    with open(IDL_PATH, "r") as f:
        raw_idl = json.load(f)
    idl = Idl.from_json(json.dumps(fix_idl_for_anchorpy(raw_idl)))

    print("2. Registrando hospital on-chain (register_hospital)...")
    hospital_provider = Provider(connection, Wallet(hospital_keypair))
    hospital_program = Program(idl, PROGRAM_ID, hospital_provider)

    hospital_pda, _ = Pubkey.find_program_address([b"hospital", bytes(hospital_pubkey)], PROGRAM_ID)
    registry_config, _ = Pubkey.find_program_address([b"config"], PROGRAM_ID)

    reg_ctx = Context(
        accounts={
            "hospital_profile": hospital_pda,
            "authority": hospital_pubkey,
            "system_program": SYSTEM_PROGRAM_ID,
        }
    )
    reg_sig = await hospital_program.rpc["register_hospital"](ctx=reg_ctx)
    print(f"Registro confirmado: https://explorer.solana.com/tx/{reg_sig}?cluster=devnet")
    await asyncio.sleep(2)

    print("3. Gravando 2 rodadas de contribuicao...")
    admin_provider = Provider(connection, Wallet(admin_keypair))
    admin_program = Program(idl, PROGRAM_ID, admin_provider)

    for i in range(1, 3):
        weights = [np.random.randn(8, 8).astype(np.float32)]
        h = list(hash_weights(weights))
        rec_ctx = Context(
            accounts={
                "registry_config": registry_config,
                "hospital_profile": hospital_pda,
                "admin": admin_keypair.pubkey(),
            }
        )
        rec_sig = await admin_program.rpc["record_contribution"](h, ctx=rec_ctx)
        print(f"Contribuicao #{i} confirmada: https://explorer.solana.com/tx/{rec_sig}?cluster=devnet")
        await asyncio.sleep(1)

    print("4. Distribuindo recompensa das 2 rodadas (distribute_reward)...")
    dist_ctx = Context(
        accounts={
            "registry_config": registry_config,
            "hospital_profile": hospital_pda,
            "authority": hospital_pubkey,
            "admin": admin_keypair.pubkey(),
            "system_program": SYSTEM_PROGRAM_ID,
        }
    )
    dist_sig = await admin_program.rpc["distribute_reward"](ctx=dist_ctx)
    print(f"Recompensa paga: https://explorer.solana.com/tx/{dist_sig}?cluster=devnet")
    await asyncio.sleep(1)

    print("5. Gravando rodada 3 (para deixar 1 pendente de recompensa)...")
    weights = [np.random.randn(8, 8).astype(np.float32)]
    h = list(hash_weights(weights))
    rec_ctx = Context(
        accounts={
            "registry_config": registry_config,
            "hospital_profile": hospital_pda,
            "admin": admin_keypair.pubkey(),
        }
    )
    rec_sig3 = await admin_program.rpc["record_contribution"](h, ctx=rec_ctx)
    print(f"Contribuicao #3 confirmada: https://explorer.solana.com/tx/{rec_sig3}?cluster=devnet")

    await connection.close()
    print("\nProcesso finalizado com sucesso.")
    print(f"Importe a chave privada no Phantom: {hospital_b58_secret}")

if __name__ == "__main__":
    asyncio.run(seed_hospital())
