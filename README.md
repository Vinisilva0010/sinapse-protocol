# Sinapse Protocol

**Trustless coordination for federated medical AI on Solana.**

Hospitals train a shared diagnostic model together — without ever sharing raw patient data, without a central party controlling the process, and without trusting each other on faith. Every contribution is verified and rewarded on-chain. Bad actors are detected and blocked automatically. Aggregate contribution scores are combined confidentially, so no participant sees another's individual number.

Built for **Colosseum Eternal**.

---

## Table of contents

- [The problem](#the-problem)
- [The solution](#the-solution)
- [How it works](#how-it-works)
- [What's real vs. what's simulated](#whats-real-vs-whats-simulated)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Testing](#testing)
- [Security](#security)
- [Design system](#design-system)
- [Roadmap](#roadmap)
- [Team](#team)
- [Disclaimers](#disclaimers)
- [License](#license)

---

## The problem

Federated learning lets hospitals train a shared model without moving raw patient data — that part is well understood. What it doesn't solve is **trust**:

- Who verifies a hospital actually trained on real data, instead of just claiming a contribution?
- What stops one hospital from submitting a poisoned update to sabotage the shared model?
- Who aggregates results without seeing every other hospital's individual numbers?

These aren't machine learning problems. They're coordination and verification problems — the kind blockchain is actually good at.

## The solution

Sinapse Protocol adds a trust layer on top of federated learning:

1. **Verified contribution.** Every training round a hospital completes gets hashed and recorded on-chain via a Solana program. No self-reporting.
2. **Automatic reward.** Verified contributions are paid out on-chain, with duplicate-payment protection built in.
3. **Saboteur detection.** A hospital flagged as malicious is rejected by the on-chain program itself — enforced by code, not policy.
4. **Confidential aggregation.** Contribution scores are combined via [Arcium](https://arcium.com)'s MPC network, so the protocol (and other hospitals) can see the aggregate without seeing anyone's individual score.
5. **Public transparency.** Anyone — a hospital considering joining, an auditor, a judge — can inspect the network's state without a wallet.

## How it works

```
 Hospital A     Hospital B     Hospital C
(local data)   (local data)   (local data)
      \              |              /
       \             |             /
        v            v            v
         Federated aggregation (Flower)
                     |
                     v
        Solana contribution registry (Anchor)
          - RegisterHospital
          - RecordContribution   <- hash of model update, verified
          - FlagSaboteur         <- admin-only, blocks future contributions
          - DistributeReward     <- admin-only, pays verified contributions once
                     |
        +------------+-------------+
        |                          |
        v                          v
  Confidential aggregation    Saboteur check
  (Arcium MPC — scores only,  (enforced on-chain,
   not the model itself)       proven by automated test)
        |                          |
        +------------+-------------+
                     |
        +------------+-------------+
        |                          |
        v                          v
  Hospital dashboard          Public explorer
  (private, per-hospital      (public, no wallet —
   view of your own data)      network-wide stats)
```

Each hospital trains locally, submits a hash of its model update (never the raw data or the full model) to the on-chain registry, and gets paid automatically once the admin verifies and processes the round. A hospital flagged as a saboteur is rejected at the program level — not by convention, by the Anchor instruction itself.

## What's real vs. what's simulated

This section exists because we'd rather tell you the honest state of the project than let you find out the hard way.

| Component | Status |
|---|---|
| Federated learning across 3 simulated hospitals (Flower + PyTorch, MedMNIST) | **Real.** 85.42% accuracy after federated rounds vs. 83.65% single-model baseline. |
| On-chain contribution registry (Anchor program) | **Real.** Deployed and tested on Solana devnet, RBAC-enforced (admin-only actions). |
| Python → Solana bridge | **Real.** Hashes real model weights and writes real transactions to devnet. |
| Saboteur detection | **Real.** Enforced on-chain, proven by an automated test (`test_saboteur_blocked`), not just claimed. |
| Confidential aggregation (Arcium) | **Real, but scoped.** Tested end-to-end on a local Arcium MPC cluster. It aggregates **contribution scores**, not the model weights themselves — full confidential model aggregation is future work, not something this build claims to do today. |
| Hospital dashboard / public explorer | **Real.** Every number is read live from devnet, nothing is mocked or cached. |
| Medical validity | **Not claimed.** MedMNIST is a benchmark dataset, not a clinically validated diagnostic tool. This project demonstrates a coordination protocol, not a medical device. |

If a claim isn't in this table as "real," assume it's a limitation, not a feature.

## Tech stack

**Federated learning**
- Python, [Flower](https://flower.ai/) (federated orchestration), PyTorch
- Dataset: MedMNIST (chest X-ray classification)

**Blockchain**
- Solana (devnet)
- Anchor framework (Rust), `anchor-lang = 0.30.1`
- Program ID: `B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ`

**Confidential compute**
- [Arcium](https://arcium.com) (MPC) for confidential score aggregation

**Bridge**
- AnchorPy — connects the Python ML pipeline to the on-chain program

**Frontend**
- Next.js + TypeScript
- Solana Wallet Adapter
- Recharts for on-chain data visualization

**Infra**
- Helius RPC (devnet)
- Docker (local Arcium MPC cluster)
- pnpm

## Repository structure

```
sinapse-protocol/
├── programs/contribution-registry/   # Anchor program (Rust)
│   └── src/
│       ├── state.rs                  # HospitalProfile, RegistryConfig
│       ├── error.rs
│       └── instructions/             # register_hospital, record_contribution,
│                                      # flag_saboteur, distribute_reward
├── tests/                            # Anchor test suite (incl. saboteur block test)
├── ml/
│   ├── client/                       # dataset loading, hospital client
│   ├── server/                       # federated server
│   └── bridge/                       # solana_bridge.py — Python↔Solana bridge
└── web/                              # Next.js frontend
    └── app/
        ├── page.tsx                  # landing page
        ├── dashboard/                # per-hospital private dashboard
        └── explorer/                 # public network explorer

confidential_aggregation/             # separate Arcium project (MPC circuit)
```

## Getting started

### Prerequisites

- Rust + Anchor CLI
- Node.js + pnpm
- Python 3.10+
- Docker (running, not just installed — required for the Arcium MPC cluster)
- A Solana devnet RPC endpoint ([Helius](https://helius.dev) free tier works)

### On-chain program

```bash
git clone <this-repo>
cd sinapse-protocol

# set your own RPC in Anchor.toml, e.g.:
# [provider]
# cluster = "https://devnet.helius-rpc.com/?api-key=<YOUR_HELIUS_API_KEY>"

anchor build
anchor test
```

### ML pipeline

```bash
python3 -m venv ml-venv
source ml-venv/bin/activate
pip install -r ml/requirements.txt

python3 -m ml.scripts.test_dataset      # sanity check on MedMNIST
python3 -m ml.scripts.train_single      # solo baseline
python3 -m ml.server.run_server         # federated server (run alongside clients)
```

> Scripts under `ml/` that import from elsewhere in the project must be run as
> `python3 -m ml.path.to.script` (no `.py`), not as a direct file path.

### Frontend

```bash
cd web
pnpm install

# web/.env.local
# NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=<YOUR_HELIUS_API_KEY>
# NEXT_PUBLIC_CONTRIBUTION_REGISTRY_PROGRAM_ID=B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ

pnpm dev
```

## Testing

```bash
anchor test          # full on-chain suite, including test_saboteur_blocked
```

The saboteur test isn't a mocked assertion — it deploys the actual program logic and confirms a flagged hospital's `RecordContribution` call is rejected on-chain.

## Security

- **Strict RBAC.** Only the registry admin can call `RecordContribution`, `FlagSaboteur`, or `DistributeReward`. Hospitals cannot self-report or self-pay.
- **No raw data or full model on-chain — ever.** Only a hash of each contribution is recorded.
- **Duplicate-payment protection.** `rewardedCount` is tracked per hospital to prevent paying the same contribution twice.
- **Confidential scores.** Individual contribution scores are never exposed in plaintext during aggregation — only the combined result is.
- **Known limitation:** the current build's admin key has broad authority (verify, flag, reward). Decentralizing that authority — multisig or a DAO-style process — is explicitly future work, not solved by this build.

If you're auditing this for the hackathon: the RBAC checks live in `programs/contribution-registry/src/instructions/`, and are exercised directly by the test suite.

## Design system

Neo-brutalist: bold borders, offset solid shadows (no blur), flat color fields.

```css
--color-base: #f7dfec;      /* background */
--color-identity: #9286fa;  /* structural elements */
--color-shock: #62c0fb;     /* accents, buttons, alerts */
--color-support: #0e0d0d;   /* text, borders, shadows — never background */
```

Fonts: `Space Grotesk` (display/UI), `JetBrains Mono` (on-chain numbers/data).

## Roadmap

- [ ] End-to-end test of the full pipeline, start to finish, no manual steps skipped
- [ ] UI polish pass across dashboard, explorer, and landing page
- [ ] Frontend deploy to Vercel
- [ ] Full confidential aggregation of model weights (not just contribution scores)
- [ ] Decentralized admin authority (multisig / DAO) instead of a single admin key

## Team

**Vinicius Pontual** — Founder & Lead Developer. Systems engineer specializing in Rust, Go, and the Solana ecosystem. Responsible for the protocol architecture and the majority of the technical build: the federated learning pipeline, the on-chain Anchor program, the Python-Solana bridge, the Arcium integration, and the frontend. This project is also his entry point into a Bioinformatics postgraduate track.

## Disclaimers

- **Not a medical device.** MedMNIST is a benchmark dataset used to demonstrate the protocol's coordination mechanism. Nothing here has been clinically validated and none of it should inform real diagnostic decisions.
- **Confidential aggregation is scoped to contribution scores today**, not full model weights. The landing page and this README both say so on purpose — we'd rather undersell it accurately than oversell it.
- **Devnet only.** All on-chain activity referenced here runs on Solana devnet, not mainnet.

## License

MIT — see [LICENSE](./LICENSE).
