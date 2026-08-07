import torch
from torch.utils.data import DataLoader, random_split
from torchvision import transforms
from medmnist import PneumoniaMNIST


def load_partition(hospital_id: int, num_hospitals: int = 3, batch_size: int = 32):
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5])
    ])

    train_dataset = PneumoniaMNIST(split='train', transform=transform, download=True)
    test_dataset = PneumoniaMNIST(split='test', transform=transform, download=True)

    total_train = len(train_dataset)
    partition_size = total_train // num_hospitals
    lengths = [partition_size] * num_hospitals
    lengths[-1] += total_train % num_hospitals

    generator = torch.Generator().manual_seed(42)
    partitions = random_split(train_dataset, lengths, generator=generator)

    train_loader = DataLoader(partitions[hospital_id], batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

    return train_loader, test_loader
