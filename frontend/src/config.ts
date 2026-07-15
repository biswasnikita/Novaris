function requireEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing ${name} — copy frontend/.env.example to .env and fill it in.`);
  }
  return value;
}

export const config = {
  networkPassphrase: requireEnv("VITE_NETWORK_PASSPHRASE"),
  rpcUrl: requireEnv("VITE_RPC_URL"),
  tokenAId: requireEnv("VITE_TOKEN_A_ID"),
  tokenBId: requireEnv("VITE_TOKEN_B_ID"),
  stakePoolId: requireEnv("VITE_STAKE_POOL_ID"),
  /** Horizon endpoint for classic operations (XLM balance + payments). */
  horizonUrl: import.meta.env.VITE_HORIZON_URL ?? "https://horizon-testnet.stellar.org",
  /** stellar.expert network segment used to build explorer links. */
  explorerNetwork: import.meta.env.VITE_EXPLORER_NETWORK ?? "testnet",
};

/** Builds a stellar.expert explorer URL for a transaction hash. */
export function explorerTxUrl(hash: string): string {
  return `https://stellar.expert/explorer/${config.explorerNetwork}/tx/${hash}`;
}

/** How often (ms) to re-poll `earned` / pool state for the live-ticking display. */
export const POLL_INTERVAL_MS = 12_000;

/** The marketing/landing page (Lumorahometemplate), proxied at the root of this same domain. */
export const LANDING_PAGE_URL = "/";

export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
