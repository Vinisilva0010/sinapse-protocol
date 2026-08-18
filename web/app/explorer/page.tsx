"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_CONTRIBUTION_REGISTRY_PROGRAM_ID ??
    "B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ"
);

type HospitalRow = {
  pubkey: string;
  authority: string;
  contributions: number;
  rewarded: number;
  pending: number;
  flagged: boolean;
};

type NetworkActivityEntry = {
  signature: string;
  blockTime: number | null;
  instructionName: string;
};

type LoadState = "loading" | "loaded" | "error";

const STAT_EXPLAINERS: Record<string, string> = {
  "Total hospitals":
    "Every registered hospital PDA currently tracked on Solana devnet.",
  "Total contributions":
    "Sum of all verified training rounds recorded across the network.",
  "Total rewarded":
    "Total contribution rewards settled on-chain.",
  "Network integrity":
    "Percentage of participating hospitals operating without saboteur flags.",
};

export default function ExplorerPage() {
  const { connection } = useConnection();
  const [state, setState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [activity, setActivity] = useState<NetworkActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadHospitals = useCallback(async () => {
    setState("loading");
    setErrorMessage("");
    try {
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [{ dataSize: 58 }],
      });

      const rows: HospitalRow[] = accounts.map((entry) => {
        const data = entry.account.data;
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

        // Layout de 58 bytes:
        // [0..8]   Discriminator
        // [8..40]  Authority Pubkey (32 bytes)
        // [40..48] contributionsCount (u64 LE)
        // [48..56] rewardedCount (u64 LE)
        // [56]     isFlaggedSaboteur (bool)
        // [57]     bump (u8)
        const authority = new PublicKey(data.subarray(8, 40)).toBase58();
        const contributions = Number(view.getBigUint64(40, true));
        const rewarded = Number(view.getBigUint64(48, true));
        const flagged = data[56] === 1;

        return {
          pubkey: entry.pubkey.toBase58(),
          authority,
          contributions,
          rewarded,
          pending: Math.max(0, contributions - rewarded),
          flagged,
        };
      });

      rows.sort((a, b) => b.contributions - a.contributions);
      setHospitals(rows);
      setState("loaded");
    } catch (err) {
      console.error("loadHospitals failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      setState("error");
    }
  }, [connection]);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, {
        limit: 25,
      });
      const entries: NetworkActivityEntry[] = [];
      for (const sigInfo of signatures) {
        let instructionName = "Unknown";
        try {
          const tx = await connection.getParsedTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });
          const logs = tx?.meta?.logMessages ?? [];
          const logLine = logs.find((l) => l.includes("Instruction:"));
          if (logLine) {
            instructionName =
              logLine.split("Instruction:")[1]?.trim() ?? "Unknown";
          }
        } catch (innerErr) {
          console.error("Failed to parse transaction:", innerErr);
        }
        entries.push({
          signature: sigInfo.signature,
          blockTime: sigInfo.blockTime ?? null,
          instructionName,
        });
      }
      setActivity(entries);
    } catch (err) {
      console.error("loadActivity failed:", err);
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    loadHospitals();
    loadActivity();
  }, [loadHospitals, loadActivity]);

  const filteredHospitals = useMemo(() => {
    if (!searchQuery.trim()) return hospitals;
    const q = searchQuery.toLowerCase();
    return hospitals.filter(
      (h) =>
        h.pubkey.toLowerCase().includes(q) ||
        h.authority.toLowerCase().includes(q)
    );
  }, [hospitals, searchQuery]);

  const networkStats = useMemo(() => {
    const totalHospitals = hospitals.length;
    const totalContributions = hospitals.reduce(
      (sum, h) => sum + h.contributions,
      0
    );
    const totalRewarded = hospitals.reduce((sum, h) => sum + h.rewarded, 0);
    const activeCount = hospitals.filter((h) => !h.flagged).length;
    const integrity =
      totalHospitals > 0 ? (activeCount / totalHospitals) * 100 : 100;
    return { totalHospitals, totalContributions, totalRewarded, integrity };
  }, [hospitals]);

  const chartData = useMemo(
    () =>
      hospitals.slice(0, 10).map((h, idx) => ({
        label: `#${idx + 1}`,
        contributions: h.contributions,
      })),
    [hospitals]
  );

  return (
    <div
      style={{
        backgroundColor: "var(--color-base, #f9f1f5)",
        color: "var(--color-support, #0e0d0d)",
        minHeight: "100vh",
        fontFamily: "var(--font-display), sans-serif",
      }}
    >
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
          flexWrap: "wrap",
          gap: "16px",
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
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              fontWeight: 700,
              fontSize: "14px",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--color-support, #0e0d0d)",
            }}
          >
            Home
          </Link>
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
            Dashboard
          </Link>
        </div>
      </nav>

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 24px 100px",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Network Explorer
        </h1>
        <p style={{ fontSize: "16px", marginBottom: "40px", maxWidth: "70ch" }}>
          Public, read-only telemetry of the Sinapse Protocol state on
          Solana Devnet. Aggregated verified parameters only.
        </p>

        {state === "error" && (
          <div
            style={{
              border: "3px solid var(--color-support, #0e0d0d)",
              background: "#ffffff",
              boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
              padding: "24px",
              marginBottom: "32px",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
            }}
          >
            Could not load network data: {errorMessage}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <ExplorerStatCard
            label="Total hospitals"
            value={
              state === "loading" ? "..." : String(networkStats.totalHospitals)
            }
            explainer={STAT_EXPLAINERS["Total hospitals"]}
            color="var(--color-identity, #51c3fc)"
          />
          <ExplorerStatCard
            label="Total contributions"
            value={
              state === "loading"
                ? "..."
                : String(networkStats.totalContributions)
            }
            explainer={STAT_EXPLAINERS["Total contributions"]}
            color="#ffffff"
          />
          <ExplorerStatCard
            label="Total rewarded"
            value={
              state === "loading" ? "..." : String(networkStats.totalRewarded)
            }
            explainer={STAT_EXPLAINERS["Total rewarded"]}
            color="var(--color-identity, #51c3fc)"
          />
          <ExplorerStatCard
            label="Network integrity"
            value={
              state === "loading"
                ? "..."
                : `${networkStats.integrity.toFixed(0)}%`
            }
            explainer={STAT_EXPLAINERS["Network integrity"]}
            color="#ffffff"
          />
        </div>

        {chartData.length > 0 && (
          <div
            style={{
              border: "3px solid var(--color-support, #0e0d0d)",
              background: "#ffffff",
              boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
              padding: "24px",
              marginBottom: "40px",
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Top Contributors Distribution
            </p>
            <p style={{ fontSize: "13px", marginBottom: "16px" }}>
              Verified contribution batches per hospital node.
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid
                  stroke="var(--color-support, #0e0d0d)"
                  strokeOpacity={0.15}
                />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar
                  dataKey="contributions"
                  fill="var(--color-shock, #381af8)"
                  stroke="var(--color-support, #0e0d0d)"
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div
          style={{
            border: "3px solid var(--color-support, #0e0d0d)",
            background: "#ffffff",
            boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
            padding: "24px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Hospital Registry Directory
            </p>
            <input
              type="text"
              placeholder="Search by PDA or Authority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "2px solid var(--color-support, #0e0d0d)",
                padding: "8px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                outline: "none",
                minWidth: "260px",
              }}
            />
          </div>

          {state === "loading" && (
            <p style={{ fontSize: "14px" }}>Loading registry state...</p>
          )}
          {state === "loaded" && filteredHospitals.length === 0 && (
            <p style={{ fontSize: "14px" }}>
              {hospitals.length === 0
                ? "No hospitals registered yet."
                : "No matching records found."}
            </p>
          )}
          {state === "loaded" && filteredHospitals.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "2px solid var(--color-support, #0e0d0d)",
                    }}
                  >
                    <th style={{ padding: "8px 8px 8px 0" }}>Rank</th>
                    <th style={{ padding: "8px" }}>Hospital PDA</th>
                    <th style={{ padding: "8px" }}>Authority</th>
                    <th style={{ padding: "8px" }}>Contributions</th>
                    <th style={{ padding: "8px" }}>Rewarded</th>
                    <th style={{ padding: "8px" }}>Pending</th>
                    <th style={{ padding: "8px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHospitals.map((h, idx) => (
                    <tr
                      key={h.pubkey}
                      style={{
                        borderBottom: "1px solid var(--color-support, #0e0d0d)",
                      }}
                    >
                      <td style={{ padding: "8px 8px 8px 0" }}>#{idx + 1}</td>
                      <td style={{ padding: "8px" }}>
                        <a
                          href={`https://explorer.solana.com/address/${h.pubkey}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "var(--color-shock, #381af8)",
                            textDecoration: "underline",
                          }}
                        >
                          {h.pubkey.slice(0, 6)}...{h.pubkey.slice(-6)}
                        </a>
                      </td>
                      <td style={{ padding: "8px" }}>
                        {h.authority.slice(0, 6)}...{h.authority.slice(-6)}
                      </td>
                      <td style={{ padding: "8px" }}>{h.contributions}</td>
                      <td style={{ padding: "8px" }}>{h.rewarded}</td>
                      <td style={{ padding: "8px" }}>{h.pending}</td>
                      <td style={{ padding: "8px" }}>
                        {h.flagged ? (
                          <span
                            style={{
                              backgroundColor: "var(--color-shock, #381af8)",
                              color: "#ffffff",
                              padding: "2px 8px",
                              fontWeight: 700,
                              border: "1px solid var(--color-support, #0e0d0d)",
                            }}
                          >
                            FLAGGED
                          </span>
                        ) : (
                          <span style={{ color: "green", fontWeight: 700 }}>
                            ACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          style={{
            border: "3px solid var(--color-support, #0e0d0d)",
            background: "#ffffff",
            boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
            padding: "24px",
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: "13px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Live Program Transactions
          </p>
          {activityLoading && (
            <p style={{ fontSize: "14px" }}>Loading instruction activity...</p>
          )}
          {!activityLoading && activity.length === 0 && (
            <p style={{ fontSize: "14px" }}>
              No transactions recorded for this program yet.
            </p>
          )}
          {!activityLoading && activity.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "2px solid var(--color-support, #0e0d0d)",
                    }}
                  >
                    <th style={{ padding: "8px 8px 8px 0" }}>Date</th>
                    <th style={{ padding: "8px" }}>Instruction</th>
                    <th style={{ padding: "8px" }}>Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((entry) => (
                    <tr
                      key={entry.signature}
                      style={{
                        borderBottom: "1px solid var(--color-support, #0e0d0d)",
                      }}
                    >
                      <td style={{ padding: "8px 8px 8px 0" }}>
                        {entry.blockTime
                          ? new Date(entry.blockTime * 1000).toLocaleString()
                          : "-"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {entry.instructionName}
                      </td>
                      <td style={{ padding: "8px" }}>
                        <a
                          href={`https://explorer.solana.com/tx/${entry.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "var(--color-shock, #381af8)",
                            textDecoration: "underline",
                          }}
                        >
                          {entry.signature.slice(0, 8)}...
                          {entry.signature.slice(-8)}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          style={{
            border: "3px solid var(--color-support, #0e0d0d)",
            background: "var(--color-identity, #51c3fc)",
            boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
            padding: "24px",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: "13px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Program Deployment Reference
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              wordBreak: "break-all",
              marginBottom: "8px",
            }}
          >
            Program ID: {PROGRAM_ID.toBase58()}
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              marginBottom: "8px",
            }}
          >
            Cluster: Solana Devnet
          </p>
          <a
            href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              marginTop: "8px",
              fontWeight: 700,
              fontSize: "13px",
              textTransform: "uppercase",
              textDecoration: "underline",
              color: "var(--color-support, #0e0d0d)",
            }}
          >
            Inspect Program on Solana Explorer
          </a>
        </div>
      </main>
    </div>
  );
}

function ExplorerStatCard({
  label,
  value,
  explainer,
  color,
}: {
  label: string;
  value: string;
  explainer: string;
  color: string;
}) {
  return (
    <div
      style={{
        backgroundColor: color,
        border: "3px solid var(--color-support, #0e0d0d)",
        boxShadow: "6px 6px 0 var(--color-support, #0e0d0d)",
        padding: "20px",
      }}
    >
      <p
        style={{
          fontWeight: 700,
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "30px",
          marginBottom: "8px",
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: "12px", lineHeight: 1.4 }}>{explainer}</p>
    </div>
  );
}