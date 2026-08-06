"""
FASE 3 — divide o dataset pneumoniamnist em N partes (uma por "hospital"),
sem sobreposicao entre elas, simulando dado que nunca sai de cada hospital.

TODO (a fazer NA FASE 3, nao antes):
- Carregar o dataset completo de treino do pneumoniamnist
- Dividir os indices em N partes iguais, sem repetir indice entre partes
- Devolver um DataLoader do PyTorch por parte
"""


def load_partition(partition_id: int, num_partitions: int):
    """Retorna o DataLoader de treino e validacao da particao pedida."""
    raise NotImplementedError("Fase 3: implementar divisao do dataset")
