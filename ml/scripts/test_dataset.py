"""
FASE 1 — testa se o dataset MedMNIST baixa e carrega certo.
Roda isso primeiro pra confirmar que o ambiente Python está pronto.
Esse arquivo já está pronto, não precisa pedir pro Gemini mexer nele.
"""
import medmnist
from medmnist import INFO, PneumoniaMNIST


def main():
    print(f"MedMNIST versao instalada: {medmnist.__version__}")
    info = INFO["pneumoniamnist"]
    print(f"Dataset: {info['description']}")
    print(f"Classes: {info['label']}")

    train_dataset = PneumoniaMNIST(split="train", download=True)
    print(f"Tamanho do dataset de treino: {len(train_dataset)}")


if __name__ == "__main__":
    main()
