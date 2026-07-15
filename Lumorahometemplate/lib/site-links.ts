/**
 * The StakePool dApp (../frontend), served under /app on this same origin — via
 * vercel.json rewrites in production, and via next.config.mjs rewrites (proxying
 * the Vite dev server) in local dev. Same-origin in both, so this stays "/app".
 */
export const DAPP_URL = "/app";

/** The live, deployed StakePool contract on Stellar Testnet. */
export const CONTRACT_EXPLORER_URL =
  "https://stellar.expert/explorer/testnet/contract/CDUU2DFCM2ZA3AC5KAIL5CTNJ5IFZBE5DKC3DKLN3NMPAMOBIIPOWOEO";
