"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AnchorProvider, Program, type Idl, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import idl from "@/lib/idl/contribution_registry.json";

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_CONTRIBUTION_REGISTRY_PROGRAM_ID ??
    "B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ"
);

type HospitalProfileAccount = {
  authority: PublicKey;
  contributionsCount: BN;
  rewardedCount: BN;
  isFlaggedSaboteur: boolean;
  bump: number;
};

type LoadState = "idle" | "loading" | "not-registered" | "registered" | "error";

type ActivityEntry = {
  signature: string;
  blockTime: number | null;
  instructionName: string;
};

type NetworkStats = {
  totalHospitals: number;
  averageContributions: number;
  rank: number | null;
};

const EXPLAINERS: Record<string, string> = {
  Contributions:
    "Total training rounds this hospital submitted a verified hash for, recorded on-chain.",
  Rewarded:
    "Contributions the admin has already paid out. Payment only happens once per contribution.",
  "Pending reward":
    "Verified contributions not yet paid - contributionsCount minus rewardedCount, read live from devnet.",
};

export default function DashboardPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { publicKey, connected } = wallet;

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<LoadState>("idle");
  const [profile, setProfile] = useState<HospitalProfileAccount | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [registering, setRegistering] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [networkStatsError, setNetworkStatsError] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const getProgram = useCallback(() => {
    if (!anchorWallet) return null;
    const provider = new AnchorProvider(connection, anchorWallet, {
      commitment: "confirmed",
    });
    return new Program(idl as Idl, provider);
  }, [connection, anchorWallet]);

  const getHospitalPda = useCallback((authority: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("hospital"), authority.toBuffer()],
      PROGRAM_ID
    )[0];
  }, []);

  const loadActivity = useCallback(
    async (hospitalPda: PublicKey) => {
      setActivityLoading(true);
      try {
        const signatures = await connection.getSignaturesForAddress(
          hospitalPda,
          { limit: 20 }
        );
        const entries: ActivityEntry[] = [];
        for (const sigInfo of signatures) {
          let instructionName = "Unknown";
          try {
            const tx = await connection.getParsedTransaction(
              sigInfo.signature,
              { maxSupportedTransactionVersion: 0 }
            );
            const logs = tx?.meta?.logMessages ?? [];
            const logLine = logs.find((l: string) => l.includes("Instruction:"));
            if (logLine) {
              instructionName = logLine.split("Instruction:")[1]?.trim() ?? "Unknown";
            }
          } catch (innerErr) {
            console.error("Failed to parse one transaction:", innerErr);
          }
          entries.push({
            signature: sigInfo.signature,
            blockTime: sigInfo.blockTime ?? null,
            instructionName,
          });
        }
        setActivity(entries.reverse());
      } catch (err) {
        console.error("loadActivity failed:", err);
        setActivity([]);
      } finally {
        setActivityLoading(false);
      }
    },
    [connection]
  );

  const loadNetworkStats = useCallback(
    async (program: Program, myPda: PublicKey) => {
      setNetworkStatsError("");
      try {
        const all = await (program.account as any).hospitalProfile.all([
          { dataSize: 58 },
        ]);
        const totalHospitals = all.length;
        const counts = all.map((a: any) =>
          (a.account as unknown as HospitalProfileAccount).contributionsCount.toNumber()
        );
        const totalContributions = counts.reduce((sum: number, c: number) => sum + c, 0);
        const averageContributions =
          totalHospitals > 0 ? totalContributions / totalHospitals : 0;
        const sorted = [...all].sort(
          (a: any, b: any) =>
            (b.account as unknown as HospitalProfileAccount).contributionsCount.toNumber() -
            (a.account as unknown as HospitalProfileAccount).contributionsCount.toNumber()
        );
        const rankIndex = sorted.findIndex((a: any) => a.publicKey.equals(myPda));
        setNetworkStats({
          totalHospitals,
          averageContributions,
          rank: rankIndex >= 0 ? rankIndex + 1 : null,
        });
      } catch (err) {
        console.error("loadNetworkStats failed:", err);
        const message = err instanceof Error ? err.message : String(err);
        setNetworkStatsError(message);
        setNetworkStats(null);
      }
    },
    []
  );

  const loadProfile = useCallback(async () => {
    if (!publicKey) return;

    const program = getProgram();
    if (!program) return;

    setState("loading");
    setErrorMessage("");
    try {
      const hospitalPda = getHospitalPda(publicKey);
      const account = await (program.account as any).hospitalProfile.fetch(hospitalPda);
      setProfile(account as unknown as HospitalProfileAccount);
      setState("registered");
      loadActivity(hospitalPda);
      loadNetworkStats(program, hospitalPda);
    } catch (err) {
      console.error("loadProfile failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("account does not exist")) {
        setState("not-registered");
      } else {
        setErrorMessage(message);
        setState("error");
      }
    }
  }, [publicKey, getProgram, getHospitalPda, loadActivity, loadNetworkStats]);

  useEffect(() => {
    if (connected && publicKey && anchorWallet) {
      loadProfile();
    } else {
      setState("idle");
      setProfile(null);
      setActivity([]);
      setNetworkStats(null);
    }
  }, [connected, publicKey, anchorWallet, loadProfile]);

  const handleRegister = useCallback(async () => {
    if (!publicKey) return;
    const program = getProgram();
    if (!program) {
      setErrorMessage("Carteira nao conectada ao provedor Anchor.");
      return;
    }

    setRegistering(true);
    setErrorMessage("");
    try {
      const hospitalPda = getHospitalPda(publicKey);
      await program.methods
        .registerHospital()
        .accounts({
          hospitalProfile: hospitalPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await loadProfile();
    } catch (err) {
      console.error("handleRegister failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      setState("error");
    } finally {
      setRegistering(false);
    }
  }, [publicKey, getProgram, getHospitalPda, loadProfile]);

  const chartData = useMemo(() => {
    let cumulative = 0;
    return activity.map((entry: ActivityEntry, idx: number) => {
      if (entry.instructionName === "RecordContribution") cumulative += 1;
      return {
        label: entry.blockTime
          ? new Date(entry.blockTime * 1000).toLocaleDateString()
          : `#${idx + 1}`,
        contributions: cumulative,
      };
    });
  }, [activity]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px 80px",
        maxWidth: "920px",
        margin: "0 auto",
        color: "var(--color-support)",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "48px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "22px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Sinapse Protocol
        </span>
        <div style={{ minWidth: "160px", minHeight: "48px" }}>
          {mounted && (
            <WalletMultiButton
              style={{
                backgroundColor: "var(--color-shock)",
                color: "var(--color-support)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                textTransform: "uppercase",
                border: "3px solid var(--color-support)",
                borderRadius: "0px",
                boxShadow: "4px 4px 0 var(--color-support)",
              }}
            />
          )}
        </div>
      </header>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "32px",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        Hospital dashboard
      </h1>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "16px",
          marginBottom: "40px",
          maxWidth: "60ch",
        }}
      >
        Your on-chain contribution record, read directly from the
        contribution-registry program on Solana devnet. Every number below is
        live - nothing is cached or simulated.
      </p>

      {!connected && (
        <EmptyCard
          title="Wallet not connected"
          body="Connect a Solana devnet wallet above to view your hospital profile."
        />
      )}

      {connected && state === "loading" && (
        <EmptyCard title="Loading" body="Reading your hospital profile from devnet..." />
      )}

      {connected && state === "not-registered" && (
        <EmptyCard
          title="You're not registered yet"
          body="This wallet has no hospital profile on-chain. Register to start recording verified contributions."
        >
          <BrutalButton onClick={handleRegister} disabled={registering}>
            {registering ? "Registering..." : "Register as hospital"}
          </BrutalButton>
        </EmptyCard>
      )}

      {connected && state === "error" && (
        <EmptyCard title="Something went wrong" body={errorMessage || "Unknown error reading devnet."}>
          <BrutalButton onClick={loadProfile}>Try again</BrutalButton>
        </EmptyCard>
      )}

      {connected && state === "registered" && profile && (
        <>
          {profile.isFlaggedSaboteur && (
            <div
              style={{
                border: "3px solid var(--color-support)",
                background: "var(--color-shock)",
                padding: "16px 20px",
                marginBottom: "24px",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                textTransform: "uppercase",
                boxShadow: "6px 6px 0 var(--color-support)",
              }}
            >
              Flagged as saboteur - contributions and rewards are blocked
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "16px",
            }}
          >
            <StatCard
              label="Contributions"
              value={profile.contributionsCount.toString()}
              explainer={EXPLAINERS["Contributions"]}
            />
            <StatCard
              label="Rewarded"
              value={profile.rewardedCount.toString()}
              explainer={EXPLAINERS["Rewarded"]}
            />
            <StatCard
              label="Pending reward"
              value={profile.contributionsCount.sub(profile.rewardedCount).toString()}
              explainer={EXPLAINERS["Pending reward"]}
            />
          </div>

          {networkStatsError && (
            <div
              style={{
                border: "3px solid var(--color-support)",
                background: "#ffffff",
                boxShadow: "6px 6px 0 var(--color-support)",
                padding: "16px 20px",
                marginBottom: "32px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
              }}
            >
              Network stats unavailable: {networkStatsError}
            </div>
          )}

          {networkStats && (
            <div
              style={{
                border: "3px solid var(--color-support)",
                background: "#ffffff",
                boxShadow: "6px 6px 0 var(--color-support)",
                padding: "20px 24px",
                marginBottom: "32px",
                display: "flex",
                gap: "32px",
                flexWrap: "wrap",
                fontFamily: "var(--font-display)",
              }}
            >
              <div>
                <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700 }}>
                  Network hospitals
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 700 }}>
                  {networkStats.totalHospitals}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700 }}>
                  Network average contributions
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 700 }}>
                  {networkStats.averageContributions.toFixed(1)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700 }}>
                  Your rank
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 700 }}>
                  {networkStats.rank ? `#${networkStats.rank}` : "-"}
                </p>
              </div>
            </div>
          )}

          {chartData.length > 1 && (
            <div
              style={{
                border: "3px solid var(--color-support)",
                background: "#ffffff",
                boxShadow: "6px 6px 0 var(--color-support)",
                padding: "20px 24px",
                marginBottom: "32px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Cumulative verified contributions
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--color-support)" strokeOpacity={0.15} />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={11} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="contributions"
                    stroke="var(--color-identity)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-support)", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div
            style={{
              border: "3px solid var(--color-support)",
              background: "#ffffff",
              boxShadow: "6px 6px 0 var(--color-support)",
              padding: "20px 24px",
              marginBottom: "32px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              On-chain activity
            </p>
            {activityLoading && (
              <p style={{ fontFamily: "var(--font-display)", fontSize: "14px" }}>
                Loading transaction history...
              </p>
            )}
            {!activityLoading && activity.length === 0 && (
              <p style={{ fontFamily: "var(--font-display)", fontSize: "14px" }}>
                No transactions found for this account yet.
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
                    <tr style={{ textAlign: "left", borderBottom: "2px solid var(--color-support)" }}>
                      <th style={{ padding: "8px 8px 8px 0" }}>Date</th>
                      <th style={{ padding: "8px" }}>Action</th>
                      <th style={{ padding: "8px" }}>Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((entry: ActivityEntry) => (
                      <tr key={entry.signature} style={{ borderBottom: "1px solid var(--color-support)" }}>
                        <td style={{ padding: "8px 8px 8px 0" }}>
                          {entry.blockTime
                            ? new Date(entry.blockTime * 1000).toLocaleString()
                            : "-"}
                        </td>
                        <td style={{ padding: "8px" }}>{entry.instructionName}</td>
                        <td style={{ padding: "8px" }}>
                          <a
                            href={`https://explorer.solana.com/tx/${entry.signature}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "var(--color-identity)", textDecoration: "underline" }}
                          >
                            {`${entry.signature.slice(0, 8)}...${entry.signature.slice(-8)}`}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              wordBreak: "break-all",
            }}
          >
            Authority: {profile.authority.toBase58()}
          </p>
        </>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  explainer,
}: {
  label: string;
  value: string;
  explainer?: string;
}) {
  return (
    <div
      style={{
        background: "var(--color-identity)",
        border: "3px solid var(--color-support)",
        boxShadow: "6px 6px 0 var(--color-support)",
        padding: "20px",
        color: "var(--color-support)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "13px",
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
          fontSize: "32px",
          marginBottom: explainer ? "8px" : 0,
        }}
      >
        {value}
      </p>
      {explainer && (
        <p style={{ fontFamily: "var(--font-display)", fontSize: "12px", lineHeight: 1.4 }}>
          {explainer}
        </p>
      )}
    </div>
  );
}

function EmptyCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "3px solid var(--color-support)",
        background: "#ffffff",
        boxShadow: "6px 6px 0 var(--color-support)",
        padding: "32px",
        maxWidth: "480px",
        color: "var(--color-support)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "18px",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {title}
      </p>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", marginBottom: children ? "20px" : 0 }}>
        {body}
      </p>
      {children}
    </div>
  );
}

function BrutalButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "var(--color-shock)",
        color: "var(--color-support)",
        border: "3px solid var(--color-support)",
        boxShadow: disabled ? "none" : "4px 4px 0 var(--color-support)",
        padding: "12px 24px",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}