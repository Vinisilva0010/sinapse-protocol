import asyncio
import os
from pathlib import Path
import numpy as np
from solders.pubkey import Pubkey
from solders.keypair import Keypair
from anchorpy import Program, Provider, Wallet, Idl, Context
from solana.rpc.async_api import AsyncClient
import json

from ml.bridge.solana_bridge import PROGRAM_ID, DEFAULT_KEYPAIR_PATH, IDL_PATH, fix_idl_for_anchorpy, hash_weights

RPC_URL = "https://devnet.helius-rpc.com/?api-key=99a74efc-f197-45d6-a462-1ef1672319aa"
TARGET_WALLET = Pubkey.from_string("FD5eqHNEVAn1SvoqPqjoXPLcaYmZjuARNzKDfke8Aj6x")

async def record_for_target(rounds: int = 2):
    with open(DEFAULT_KEYPAIR_PATH, "r") as f:
        admin_keypair = Keypair.from_bytes(bytes(json.load(f)))
    
    connection = AsyncClient(RPC_URL)
    provider = Provider(connection, Wallet(admin_keypair))
    
    with open(IDL_PATH, "r") as f:
        raw_idl = json.load(f)
    idl = Idl.from_json(json.dumps(fix_idl_for_anchorpy(raw_idl)))
    program = Program(idl, PROGRAM_ID, provider)
    
    registry_config, _ = Pubkey.find_program_address([b"config"], PROGRAM_ID)
    hospital_profile, _ = Pubkey.find_program_address([b"hospital", bytes(TARGET_WALLET)], PROGRAM_ID)
    
    for r in range(1, rounds + 1):
        print(f"Gravando rodada {r} on-chain...")
        dummy_weights = [np.random.randn(10, 10).astype(np.float32)]
        h = hash_weights(dummy_weights)
        hash_as_list = [int(b) for b in h]
        
        ctx = Context(
            accounts={
                "registry_config": registry_config,
                "hospital_profile": hospital_profile,
                "admin": admin_keypair.pubkey(),
            }
        )
        sig = await program.rpc["record_contribution"](hash_as_list, ctx=ctx)
        print(f"Rodada {r} confirmada: https://explorer.solana.com/tx/{sig}?cluster=devnet")
        await asyncio.sleep(1)
        
    await connection.close()

if __name__ == "__main__":
    asyncio.run(record_for_target(2))
