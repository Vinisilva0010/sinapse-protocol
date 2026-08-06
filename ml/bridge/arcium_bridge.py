"""
FASE 7 — chama o circuito Arcium (Arcis/MXE) que agrega, de forma
confidencial, o placar de contribuicao de cada hospital.

Escopo desta fase: so o PLACAR de contribuicao (um numero por hospital),
nao o modelo inteiro.

TODO (a fazer NA FASE 7, nao antes):
- Enviar o placar de cada hospital criptografado pro circuito Arcis
- Receber de volta so o resultado agregado, sem ver os valores
  individuais em nenhum momento
"""


async def submit_confidential_score(hospital_wallet: str, score: int):
    raise NotImplementedError("Fase 7: implementar chamada ao circuito Arcium")
