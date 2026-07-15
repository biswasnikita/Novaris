import {
  Asset,
  BASE_FEE,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { horizon, networkPassphrase } from "./stellar-sdk";
import { signTransaction } from "./wallet";

/**
 * The distinct failure kinds the XLM payment flow surfaces, so the UI can react
 * to each (see Level 1/2 "error handling" requirement). Kept as a string-literal
 * union rather than an enum for easy exhaustive switch handling in components.
 */
export type WalletErrorKind =
  | "invalid-address"
  | "account-unfunded"
  | "insufficient-balance"
  | "declined"
  | "submit-failed"
  | "network";

/** A typed error carrying a `kind` so callers can branch on the failure type. */
export class WalletError extends Error {
  kind: WalletErrorKind;
  constructor(kind: WalletErrorKind, message: string) {
    super(message);
    this.name = "WalletError";
    this.kind = kind;
  }
}

/**
 * Fetches the connected account's native XLM balance from Horizon.
 * Returns a decimal string (e.g. "9998.4999900"). An account that does not yet
 * exist on the network (never funded) resolves to "0" rather than throwing, so
 * the UI can prompt the user to fund it via Friendbot.
 */
export async function fetchXlmBalance(publicKey: string): Promise<string> {
  try {
    const account = await horizon.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? native.balance : "0";
  } catch (e) {
    // Horizon returns 404 for an account that has never been funded.
    if (isNotFound(e)) return "0";
    throw new WalletError("network", "Could not reach Horizon to load your balance.");
  }
}

export interface SendXlmParams {
  from: string;
  to: string;
  /** Human-entered decimal amount in XLM, e.g. "10.5". */
  amount: string;
  /** Optional memo text. */
  memo?: string;
}

/**
 * Builds, signs (via Freighter), and submits a native XLM payment on the
 * configured network. Resolves with the transaction hash on success. Throws a
 * {@link WalletError} tagged with the specific failure kind otherwise.
 */
export async function sendXlmPayment({ from, to, amount }: SendXlmParams): Promise<string> {
  // --- Error type 1: invalid recipient address ---
  if (!StrKey.isValidEd25519PublicKey(to)) {
    throw new WalletError("invalid-address", "Recipient is not a valid Stellar address (G...).");
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new WalletError("invalid-address", "Enter an amount greater than zero.");
  }

  // Load the source account (also gives us the sequence number + balance).
  let account: Awaited<ReturnType<typeof horizon.loadAccount>>;
  try {
    account = await horizon.loadAccount(from);
  } catch (e) {
    // --- Error type 2: source account not funded / not found ---
    if (isNotFound(e)) {
      throw new WalletError(
        "account-unfunded",
        "Your account isn't funded on testnet yet. Fund it with Friendbot first.",
      );
    }
    throw new WalletError("network", "Could not reach Horizon to load your account.");
  }

  // --- Error type 3: insufficient balance (leave ~1 XLM for reserve + fee) ---
  const native = account.balances.find((b) => b.asset_type === "native");
  const available = native ? Number(native.balance) : 0;
  if (numericAmount > available - 1) {
    throw new WalletError(
      "insufficient-balance",
      `Insufficient balance. You can send at most ~${Math.max(0, available - 1).toFixed(4)} XLM (1 XLM kept for reserve/fee).`,
    );
  }

  // Build the payment transaction.
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: to,
        asset: Asset.native(),
        amount: amount,
      }),
    )
    .setTimeout(180)
    .build();

  // --- Error type 4: user declines signing in Freighter ---
  let signedXdr: string;
  try {
    const res = await signTransaction(tx.toXDR(), {
      networkPassphrase,
      address: from,
    });
    signedXdr = res.signedTxXdr;
  } catch (e) {
    throw new WalletError("declined", (e as Error).message || "Signing was declined.");
  }

  // --- Error type 5: submission rejected by the network ---
  try {
    const signedTx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const result = await horizon.submitTransaction(signedTx);
    return result.hash;
  } catch (e) {
    throw new WalletError("submit-failed", extractSubmitError(e));
  }
}

/** Horizon 404 detection across the shapes the SDK/axios may surface. */
function isNotFound(e: unknown): boolean {
  const err = e as { response?: { status?: number }; status?: number };
  return err?.response?.status === 404 || err?.status === 404;
}

/** Pulls a human-readable reason out of a Horizon submission failure. */
function extractSubmitError(e: unknown): string {
  const err = e as {
    response?: { data?: { extras?: { result_codes?: { operations?: string[]; transaction?: string } } } };
    message?: string;
  };
  const codes = err?.response?.data?.extras?.result_codes;
  if (codes?.operations?.length) return `Transaction failed: ${codes.operations.join(", ")}`;
  if (codes?.transaction) return `Transaction failed: ${codes.transaction}`;
  return err?.message ?? "Transaction submission failed.";
}
