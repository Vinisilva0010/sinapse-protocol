from flwr.app import Context
import flwr as fl
from ml.client.hospital_client import HospitalClient


def client_fn(context: Context) -> fl.client.Client:
    hospital_id = int(context.node_config["partition-id"])
    return HospitalClient(hospital_id=hospital_id).to_client()


def weighted_average(metrics):
    accuracies = [num_examples * m["accuracy"] for num_examples, m in metrics]
    examples = [num_examples for num_examples, _ in metrics]
    if sum(examples) == 0:
        return {"accuracy": 0.0}
    return {"accuracy": sum(accuracies) / sum(examples)}


def main():
    num_hospitals = 3
    num_rounds = 3

    strategy = fl.server.strategy.FedAvg(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=num_hospitals,
        min_evaluate_clients=num_hospitals,
        min_available_clients=num_hospitals,
        evaluate_metrics_aggregation_fn=weighted_average,
    )

    print(f"Starting federated simulation with {num_hospitals} hospitals over {num_rounds} rounds...")

    history = fl.simulation.start_simulation(
        client_fn=client_fn,
        num_clients=num_hospitals,
        config=fl.server.ServerConfig(num_rounds=num_rounds),
        strategy=strategy,
    )

    print("=" * 50)
    print("Federated training complete.")
    if history.metrics_distributed and "accuracy" in history.metrics_distributed:
        final_acc = history.metrics_distributed["accuracy"][-1][1]
        print(f"Final aggregated accuracy on server: {final_acc * 100:.2f}%")
    print("=" * 50)


if __name__ == "__main__":
    main()
