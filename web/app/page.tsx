"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const PROGRAM_ID =
  process.env.NEXT_PUBLIC_CONTRIBUTION_REGISTRY_PROGRAM_ID ??
  "B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-base, #f9f1f5)",
        color: "var(--color-support, #0e0d0d)",
        minHeight: "100vh",
        fontFamily: "var(--font-display), sans-serif",
      }}
    >
      {/* Top Navigation */}
      <nav
        style={{
          borderBottom: "3px solid var(--color-support, #0e0d0d)",
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              backgroundColor: "var(--color-shock, #381af8)",
              border: "2px solid var(--color-support, #0e0d0d)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Sinapse Protocol
          </span>
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <a
            href="#architecture"
            style={{
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--color-support, #0e0d0d)",
            }}
          >
            Architecture
          </a>
          <a
            href="#crypto-primitives"
            style={{
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--color-support, #0e0d0d)",
            }}
          >
            Crypto Engine
          </a>
          <a
            href="#faq"
            style={{
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--color-support, #0e0d0d)",
            }}
          >
            FAQ
          </a>
          <Link
            href="/dashboard"
            style={{
              backgroundColor: "var(--color-shock, #381af8)",
              color: "#ffffff",
              padding: "10px 20px",
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "uppercase",
              textDecoration: "none",
              border: "3px solid var(--color-support, #0e0d0d)",
              boxShadow: "4px 4px 0 var(--color-support, #0e0d0d)",
            }}
          >
            Launch Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 24px 60px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "var(--color-identity, #51c3fc)",
              border: "2px solid var(--color-support, #0e0d0d)",
              padding: "6px 12px",
              fontWeight: 700,
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "20px",
              boxShadow: "3px 3px 0 var(--color-support, #0e0d0d)",
            }}
          >
            Solana Devnet Infrastructure
          </div>

          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              lineHeight: 1.1,
              textTransform: "uppercase",
              marginBottom: "24px",
              letterSpacing: "-0.02em",
            }}
          >
            Confidential Federated AI Coordination Protocol
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.6,
              marginBottom: "32px",
              maxWidth: "54ch",
            }}
          >
            A decentralized framework enabling healthcare institutions to collaboratively
            train medical diagnostic models without transferring raw patient datasets.
            Powered by Solana Anchor state verification, automated escrow rewards, and
            Arcium MPC confidential aggregation.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link
              href="/dashboard"
              style={{
                backgroundColor: "var(--color-shock, #381af8)",
                color: "#ffffff",
                padding: "16px 32px",
                fontWeight: 700,
                fontSize: "16px",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "3px solid var(--color-support, #0e0d0d)",
                boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
              }}
            >
              Open Hospital Dashboard
            </Link>
            <a
              href="#architecture"
              style={{
                backgroundColor: "#ffffff",
                color: "var(--color-support, #0e0d0d)",
                padding: "16px 32px",
                fontWeight: 700,
                fontSize: "16px",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "3px solid var(--color-support, #0e0d0d)",
                boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
              }}
            >
              Protocol Documentation
            </a>
          </div>
        </div>

        {/* Robot Image Showcase with Brutalist Effects */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "-16px",
              left: "-16px",
              width: "100%",
              height: "100%",
              backgroundColor: "var(--color-identity, #51c3fc)",
              border: "3px solid var(--color-support, #0e0d0d)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "relative",
              backgroundColor: "#ffffff",
              border: "3px solid var(--color-support, #0e0d0d)",
              padding: "24px",
              boxShadow: "10px 10px 0 var(--color-support, #0e0d0d)",
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "380px",
                backgroundColor: "var(--color-base, #f9f1f5)",
                border: "2px solid var(--color-support, #0e0d0d)",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src="/rob.png"
                alt="Medical Diagnostic Autonomous Node"
                width={320}
                height={320}
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(6px 6px 0px #0e0d0d)",
                }}
                priority
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  backgroundColor: "var(--color-shock, #381af8)",
                  color: "#ffffff",
                  padding: "4px 10px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  border: "2px solid var(--color-support, #0e0d0d)",
                }}
              >
                NODE_TYPE: CLINICAL_MODEL_AGENT
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700 }}>
                STATUS: ACTIVE_VERIFICATION
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-shock, #381af8)", fontWeight: 700 }}>
                CONFIDENTIAL_COMPUTE: OK
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Telemetry Metrics */}
      <section
        style={{
          borderTop: "3px solid var(--color-support, #0e0d0d)",
          borderBottom: "3px solid var(--color-support, #0e0d0d)",
          backgroundColor: "#ffffff",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          <div style={{ borderLeft: "4px solid var(--color-shock, #381af8)", paddingLeft: "16px" }}>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700 }}>Settlement Layer</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: 700 }}>Solana Devnet</p>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>Sub-second state finalized receipts</p>
          </div>
          <div style={{ borderLeft: "4px solid var(--color-identity, #51c3fc)", paddingLeft: "16px" }}>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700 }}>Privacy Engine</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: 700 }}>Arcium MPC</p>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>Homomorphic encrypted aggregation</p>
          </div>
          <div style={{ borderLeft: "4px solid var(--color-shock, #381af8)", paddingLeft: "16px" }}>
            <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700 }}>Program ID</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, wordBreak: "break-all" }}>
              {PROGRAM_ID.slice(0, 16)}...
            </p>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>Anchor v0.30 verified PDA registry</p>
          </div>
        </div>
      </section>

      {/* Core Crypto Primitives Section */}
      <section
        id="crypto-primitives"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Core Crypto Primitives
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "48px", maxWidth: "68ch" }}>
          Federated Learning exists outside Web3. Sinapse Protocol integrates Web3 infrastructure
          to replace trust in centralized orchestrators with deterministic cryptoeconomic proofs.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
          {/* Box 1 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "3px solid var(--color-support, #0e0d0d)",
              padding: "32px",
              boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "var(--color-identity, #51c3fc)",
                border: "2px solid var(--color-support, #0e0d0d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              01
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              On-Chain Proof of Contribution
            </h3>
            <p style={{ fontSize: "15px", lineHeight: 1.6 }}>
              Every model update generated by a hospital node produces a unique cryptographic hash
              recorded immutably in a Solana Program Derived Address (PDA). This prevents retroactively
              falsifying contribution logs or altering model version histories.
            </p>
          </div>

          {/* Box 2 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "3px solid var(--color-support, #0e0d0d)",
              padding: "32px",
              boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "var(--color-shock, #381af8)",
                color: "#ffffff",
                border: "2px solid var(--color-support, #0e0d0d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              02
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              Automated Escrow Payouts
            </h3>
            <p style={{ fontSize: "15px", lineHeight: 1.6 }}>
              Rewards are disbursed programmatically via smart contracts upon verification of submitted weights.
              Eliminates central administrative intermediaries, guaranteeing exact 1-to-1 payout execution
              for verified training rounds.
            </p>
          </div>

          {/* Box 3 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "3px solid var(--color-support, #0e0d0d)",
              padding: "32px",
              boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "var(--color-base, #f9f1f5)",
                border: "2px solid var(--color-support, #0e0d0d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              03
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              Arcium Multiparty Aggregation
            </h3>
            <p style={{ fontSize: "15px", lineHeight: 1.6 }}>
              Utilizes Arcium confidential computing nodes to aggregate weight updates across participating
              hospitals. Neither central servers nor peer institutions can inspect individual node weights
              prior to global aggregation.
            </p>
          </div>
        </div>
      </section>

      {/* Process Architecture Flow */}
      <section
        id="architecture"
        style={{
          backgroundColor: "#ffffff",
          borderTop: "3px solid var(--color-support, #0e0d0d)",
          borderBottom: "3px solid var(--color-support, #0e0d0d)",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 700, textTransform: "uppercase", marginBottom: "16px" }}>
            Federated Training Execution Flow
          </h2>
          <p style={{ fontSize: "16px", marginBottom: "48px", maxWidth: "60ch" }}>
            The operational lifecycle of a distributed diagnostic model update across node networks.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            <div style={{ border: "3px solid var(--color-support, #0e0d0d)", padding: "24px", backgroundColor: "var(--color-base, #f9f1f5)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "13px" }}>STAGE 01</span>
              <h4 style={{ fontSize: "18px", fontWeight: 700, textTransform: "uppercase", margin: "8px 0 12px" }}>Local Model Fit</h4>
              <p style={{ fontSize: "14px", lineHeight: 1.5 }}>
                Hospital nodes train diagnostic models locally against isolated clinical datasets (e.g., MedMNIST benchmarks).
              </p>
            </div>

            <div style={{ border: "3px solid var(--color-support, #0e0d0d)", padding: "24px", backgroundColor: "var(--color-base, #f9f1f5)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "13px" }}>STAGE 02</span>
              <h4 style={{ fontSize: "18px", fontWeight: 700, textTransform: "uppercase", margin: "8px 0 12px" }}>Weight Hash Commit</h4>
              <p style={{ fontSize: "14px", lineHeight: 1.5 }}>
                Local weight update hashes are committed directly to the hospital&apos;s PDA on Solana Devnet via Anchor RPC calls.
              </p>
            </div>

            <div style={{ border: "3px solid var(--color-support, #0e0d0d)", padding: "24px", backgroundColor: "var(--color-base, #f9f1f5)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "13px" }}>STAGE 03</span>
              <h4 style={{ fontSize: "18px", fontWeight: 700, textTransform: "uppercase", margin: "8px 0 12px" }}>Confidential MPC</h4>
              <p style={{ fontSize: "14px", lineHeight: 1.5 }}>
                Encrypted weights pass through Arcium confidential computation network to perform federated averaging without exposure.
              </p>
            </div>

            <div style={{ border: "3px solid var(--color-support, #0e0d0d)", padding: "24px", backgroundColor: "var(--color-base, #f9f1f5)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "13px" }}>STAGE 04</span>
              <h4 style={{ fontSize: "18px", fontWeight: 700, textTransform: "uppercase", margin: "8px 0 12px" }}>On-Chain Settlement</h4>
              <p style={{ fontSize: "14px", lineHeight: 1.5 }}>
                Global state model increments on-chain, triggering token reward issuance to verified hospital wallet addresses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset & Regulatory Disclaimer */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px" }}>
        <div
          style={{
            border: "3px solid var(--color-support, #0e0d0d)",
            backgroundColor: "var(--color-identity, #51c3fc)",
            padding: "32px",
            boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
          }}
        >
          <h3 style={{ fontSize: "20px", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
            Protocol Scope and Dataset Disclaimer
          </h3>
          <p style={{ fontSize: "15px", lineHeight: 1.6, maxWidth: "90ch" }}>
            The datasets evaluated during simulation testing (including MedMNIST) are standardized research benchmarks.
            Per dataset publisher terms, these materials are intended exclusively for algorithmic research and infrastructure validation,
            not for direct clinical diagnosis or medical decision-making. Sinapse Protocol delivers the decentralized coordination,
            verification, and cryptoeconomic infrastructure; it does not replace medical diagnostic devices or software.
          </p>
        </div>
      </section>

      {/* Extended Technical FAQ Section */}
      <section
        id="faq"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px 100px",
        }}
      >
        <h2 style={{ fontSize: "36px", fontWeight: 700, textTransform: "uppercase", marginBottom: "16px" }}>
          Deep Technical FAQ
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "40px" }}>
          Comprehensive architecture specifications, state machine guarantees, and cryptoeconomic design details.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            {
              q: "How does Sinapse Protocol guarantee data privacy between competing hospital nodes?",
              a: "Raw patient records never leave the local boundary of the hospital node. Local training occurs on-premise using isolated Python runtime workers. Only mathematical gradient matrices and model weight updates are processed. Furthermore, during weight transmission, Arcium Confidential Nodes execute Multi-Party Computation (MPC) protocols, ensuring that gradient matrices are encrypted before aggregation. Neither central coordinators nor peer institutions can reverse-engineer patient data from aggregated weights.",
            },
            {
              q: "What role does Solana play if model training happens off-chain?",
              a: "Solana functions as the immutable state machine and cryptoeconomic settlement layer. Off-chain model training cannot enforce trust or financial accountability by itself. The Anchor smart contract maintains Program Derived Addresses (PDAs) for each registered hospital, tracking verified contribution counts, payout states, and saboteur flagging. Every training round generates a verifiable hash receipt written to the Solana Devnet blockchain.",
            },
            {
              q: "How does the protocol prevent malicious actors from uploading garbage weights (Poisoning Attacks)?",
              a: "The smart contract architecture includes an administration and validation governance interface capable of marking non-conforming or malicious nodes as saboteurs (isFlaggedSaboteur = true). When a node is flagged on-chain, all subsequent contribution submissions and reward disincentive mechanics are enforced directly at the smart contract level, preventing poisoned updates from corrupting global model state.",
            },
            {
              q: "How are hospital accounts structured on-chain?",
              a: "Each participating hospital authority wallet generates a Program Derived Address (PDA) using the seeds [b'hospital', authority_pubkey]. The account layout stores the authority PublicKey (32 bytes), contributionsCount (u64, 8 bytes), rewardedCount (u64, 8 bytes), isFlaggedSaboteur (bool, 1 byte), and canonical bump (1 byte), prefixed by the Anchor 8-byte discriminator.",
            },
            {
              q: "Why is MedMNIST used in initial deployments?",
              a: "MedMNIST provides a lightweight, standardized benchmark for clinical image classification (e.g., PathMNIST, ChestMNIST). It serves as an ideal baseline for evaluating federated learning convergence speeds, network bandwidth utilization, and RPC state synchronization without incurring massive GPU cluster costs during Devnet protocol testing.",
            },
            {
              q: "How do token payouts and rewards execute?",
              a: "When an administrator executes a reward disbursement instruction, the Anchor program verifies that contributionsCount exceeds rewardedCount for the target hospital PDA. Upon verification, the program updates the on-chain rewardedCount state and releases funds directly to the hospital's authority wallet address in a single atomic transaction.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                border: "3px solid var(--color-support, #0e0d0d)",
                backgroundColor: "#ffffff",
                boxShadow: openFaq === idx ? "none" : "4px 4px 0 var(--color-support, #0e0d0d)",
                transform: openFaq === idx ? "translate(2px, 2px)" : "none",
                transition: "all 0.1s ease-in-out",
              }}
            >
              <button
                onClick={() => toggleFaq(idx)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "20px 24px",
                  background: "none",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "18px",
                  textTransform: "uppercase",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "var(--color-support, #0e0d0d)",
                  fontFamily: "var(--font-display)",
                }}
              >
                <span>{item.q}</span>
                <span style={{ fontSize: "22px", fontFamily: "var(--font-mono)" }}>
                  {openFaq === idx ? "[-]" : "[+]"}
                </span>
              </button>
              {openFaq === idx && (
                <div
                  style={{
                    padding: "0 24px 24px",
                    fontSize: "15px",
                    lineHeight: 1.6,
                    borderTop: "2px solid var(--color-support, #0e0d0d)",
                    paddingTop: "16px",
                  }}
                >
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "3px solid var(--color-support, #0e0d0d)",
          backgroundColor: "#ffffff",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <p style={{ fontWeight: 700, fontSize: "16px", textTransform: "uppercase" }}>Sinapse Protocol</p>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>
              Decentralized Healthcare AI Infrastructure on Solana Devnet
            </p>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link
              href="/dashboard"
              style={{
                color: "var(--color-support, #0e0d0d)",
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "uppercase",
                textDecoration: "underline",
              }}
            >
              Dashboard
            </Link>
            <a
              href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--color-support, #0e0d0d)",
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "uppercase",
                textDecoration: "underline",
              }}
            >
              Solana Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}