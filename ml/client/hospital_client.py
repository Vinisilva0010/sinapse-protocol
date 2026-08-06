"""
FASE 3 — cliente Flower que representa 1 hospital simulado.
Cada instancia treina so com a particao de dado dela (dataset_loader.py).

TODO (a fazer NA FASE 3, nao antes):
- Definir uma rede neural pequena (o dataset e imagem 28x28 em cinza,
  nao precisa de nada pesado)
- Implementar fit() para treinar localmente e devolver os pesos
- Implementar evaluate() para medir a acuracia local
"""
import flwr as fl


class HospitalClient(fl.client.NumPyClient):
    def __init__(self, partition_id: int, num_partitions: int):
        self.partition_id = partition_id
        self.num_partitions = num_partitions

    def get_parameters(self, config):
        raise NotImplementedError("Fase 3")

    def fit(self, parameters, config):
        raise NotImplementedError("Fase 3")

    def evaluate(self, parameters, config):
        raise NotImplementedError("Fase 3")
