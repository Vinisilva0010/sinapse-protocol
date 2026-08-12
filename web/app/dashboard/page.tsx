"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AnchorProvider, Program, type Idl, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
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

  const loadProfile = useCallback(async () => {
    if (!publicKey) return;

    const program = getProgram();
    if (!program) return;

    setState("loading");
    setErrorMessage("");

    try {
      const hospitalPda = getHospitalPda(publicKey);
      const account = await (program.account as any).hospitalProfile.fetch(
        hospitalPda
      );
      setProfile(account as unknown as HospitalProfileAccount);
      setState("registered");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const lower = message.toLowerCase();

      if (lower.includes("account does not exist")) {
        setState("not-registered");
      } else {
        setErrorMessage(message);
        setState("error");
      }
    }
  }, [publicKey, getProgram, getHospitalPda]);

  useEffect(() => {
    if (connected && publicKey && anchorWallet) {
      loadProfile();
    } else {
      setState("idle");
      setProfile(null);
    }
  }, [connected, publicKey, anchorWallet, loadProfile]);

  const handleRegister = useCallback(async () => {
    if (!publicKey) return;
    const program = getProgram();
    if (!program) {
      setErrorMessage("Provedor Anchor nao inicializado.");
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
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      setState("error");
    } finally {
      setRegistering(false);
    }
  }, [publicKey, getProgram, getHospitalPda, loadProfile]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px 80px",
        maxWidth: "880px",
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
            color: "var(--color-support)",
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
          color: "var(--color-support)",
        }}
      >
        Hospital dashboard
      </h1>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "16px",
          marginBottom: "40px",
          maxWidth: "56ch",
          color: "var(--color-support)",
        }}
      >
        Your on-chain contribution record, read directly from the
        contribution-registry program on Solana devnet.
      </p>

      {!connected && (
        <EmptyCard
          title="Wallet not connected"
          body="Connect a Solana devnet wallet above to view your hospital profile."
        />
      )}

      {connected && state === "loading" && (
        <EmptyCard title="Loading" body="Reading your hospital profile from devnet…" />
      )}

      {connected && state === "not-registered" && (
        <EmptyCard
          title="You're not registered yet"
          body="This wallet has no hospital profile on-chain. Register to start recording verified contributions."
        >
          <BrutalButton onClick={handleRegister} disabled={registering}>
            {registering ? "Registering…" : "Register as hospital"}
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
                color: "var(--color-support)",
              }}
            >
              Flagged as saboteur — contributions and rewards are blocked
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <StatCard
              label="Contributions"
              value={profile.contributionsCount.toString()}
            />
            <StatCard label="Rewarded" value={profile.rewardedCount.toString()} />
            <StatCard
              label="Pending reward"
              value={profile.contributionsCount
                .sub(profile.rewardedCount)
                .toString()}
            />
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              marginTop: "32px",
              wordBreak: "break-all",
              color: "var(--color-support)",
            }}
          >
            Authority: {profile.authority.toBase58()}
          </p>
        </>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
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
        }}
      >
        {value}
      </p>
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
