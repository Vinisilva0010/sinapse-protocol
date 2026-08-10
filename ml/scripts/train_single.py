import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms
from medmnist import INFO, PneumoniaMNIST


class SimpleCNN(nn.Module):
    def __init__(self, in_channels=1, num_classes=2):
        super(SimpleCNN, self).__init__()
        self.feature_extractor = nn.Sequential(
            nn.Conv2d(in_channels, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2)
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(32 * 7 * 7, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        return self.classifier(self.feature_extractor(x))


def train(model, train_loader, criterion, optimizer, device):
    model.train()
    total_loss = 0.0
    for images, targets in train_loader:
        images = images.to(device)
        targets = targets.view(-1).long().to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * images.size(0)
    return total_loss / len(train_loader.dataset)


def evaluate(model, test_loader, device):
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for images, targets in test_loader:
            images = images.to(device)
            targets = targets.view(-1).long().to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs.data, 1)
            total += targets.size(0)
            correct += (predicted == targets).sum().item()
    return 100.0 * correct / total


def main():
    info = INFO['pneumoniamnist']
    n_channels = info['n_channels']
    n_classes = len(info['label'])
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    data_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5])
    ])

    train_dataset = PneumoniaMNIST(split='train', transform=data_transform, download=True)
    test_dataset = PneumoniaMNIST(split='test', transform=data_transform, download=True)
    train_loader = DataLoader(dataset=train_dataset, batch_size=64, shuffle=True)
    test_loader = DataLoader(dataset=test_dataset, batch_size=64, shuffle=False)

    model = SimpleCNN(in_channels=n_channels, num_classes=n_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    epochs = 5
    print(f"Starting training ({epochs} epochs)...")
    for epoch in range(1, epochs + 1):
        loss = train(model, train_loader, criterion, optimizer, device)
        acc = evaluate(model, test_loader, device)
        print(f"Epoch [{epoch}/{epochs}] - Loss: {loss:.4f} - Test accuracy: {acc:.2f}%")

    final_acc = evaluate(model, test_loader, device)
    print("=" * 40)
    print(f"Training complete. Final test accuracy: {final_acc:.2f}%")
    print("=" * 40)


if __name__ == "__main__":
    main()
