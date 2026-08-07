import torch
import torch.nn as nn
import torch.optim as optim
import flwr as fl
from collections import OrderedDict
from ml.client.dataset_loader import load_partition


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


class HospitalClient(fl.client.NumPyClient):
    def __init__(self, hospital_id: int):
        self.hospital_id = hospital_id
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = SimpleCNN().to(self.device)
        self.train_loader, self.test_loader = load_partition(hospital_id=hospital_id)

    def get_parameters(self, config):
        return [val.cpu().numpy() for val in self.model.state_dict().values()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.model.parameters(), lr=0.001)

        self.model.train()
        for epoch in range(1):
            for images, targets in self.train_loader:
                images = images.to(self.device)
                targets = targets.view(-1).long().to(self.device)

                optimizer.zero_grad()
                outputs = self.model(images)
                loss = criterion(outputs, targets)
                loss.backward()
                optimizer.step()

        return self.get_parameters(config={}), len(self.train_loader.dataset), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        criterion = nn.CrossEntropyLoss()

        self.model.eval()
        loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for images, targets in self.test_loader:
                images = images.to(self.device)
                targets = targets.view(-1).long().to(self.device)

                outputs = self.model(images)
                loss += criterion(outputs, targets).item() * images.size(0)
                _, predicted = torch.max(outputs.data, 1)
                total += targets.size(0)
                correct += (predicted == targets).sum().item()

        loss = loss / total if total > 0 else 0.0
        accuracy = correct / total if total > 0 else 0.0

        return float(loss), len(self.test_loader.dataset), {"accuracy": float(accuracy)}
