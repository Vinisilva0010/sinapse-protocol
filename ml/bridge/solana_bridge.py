"""
FASE 5 — ponte entre o treino em Python e o registro on-chain em Solana.
Depois de cada rodada de treino, pega o hash da contribuicao de cada
hospital e manda pro programa Anchor "contribution-registry" registrar.

TODO (a fazer NA FASE 5, nao antes):
- Usar AnchorPy pra carregar o programa a partir do IDL (gerado por
  "anchor build", fica em target/idl/contribution_registry.json)
- Chamar a instrucao que registra a contribuicao em devnet
"""
import hashlib


def hash_model_update(update_bytes: bytes) -> bytes:
    return hashlib.sha256(update_bytes).digest()


async def submit_contribution(update_bytes: bytes, hospital_wallet: str, round_number: int):
    raise NotImplementedError("Fase 5: implementar chamada ao programa Anchor via AnchorPy")
