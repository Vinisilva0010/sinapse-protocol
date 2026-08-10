"""
PHASE 1 - tests that the MedMNIST dataset downloads and loads correctly.
"""
import medmnist
from medmnist import INFO, PneumoniaMNIST


def main():
    print(f"MedMNIST version installed: {medmnist.__version__}")
    info = INFO["pneumoniamnist"]
    print(f"Dataset: {info['description']}")
    print(f"Classes: {info['label']}")

    train_dataset = PneumoniaMNIST(split="train", download=True)
    print(f"Training set size: {len(train_dataset)}")


if __name__ == "__main__":
    main()
