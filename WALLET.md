# Stellar Wallet Integration (Freighter)

The Novaris dApp integrates the Stellar wallet **[`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api)**
for wallet permissions, address retrieval, and transaction signing. This file is
a top-level index of that integration; the full, runnable code lives in the
`frontend/` React app.

| Concern | Where | Freighter API |
|---|---|---|
| Dependency | [`frontend/package.json`](frontend/package.json) | `@stellar/freighter-api@^6.0.1` |
| Wallet adapter | [`frontend/src/lib/wallet.ts`](frontend/src/lib/wallet.ts) | `isConnected`, `requestAccess`, `getAddress`, `signTransaction` |
| Connect Wallet button + handler | [`frontend/src/App.tsx`](frontend/src/App.tsx) | `connectWallet()` on click |
| Signing wired into Soroban calls | [`frontend/src/lib/contract.ts`](frontend/src/lib/contract.ts) | `signTransaction` → `ContractClient.from({ signTransaction })` |

## 1. Detect the wallet library

The app depends on `@stellar/freighter-api` and imports it directly in the
wallet adapter ([`frontend/src/lib/wallet.ts`](frontend/src/lib/wallet.ts)):

```ts
import {
  getAddress,
  isConnected,
  requestAccess,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import type { SignTransaction } from "@stellar/stellar-sdk/contract";
```

## 2. Connect Wallet button + handler

The header renders a **Connect Freighter** button when a wallet is available,
a truncated address pill + **Disconnect** when connected, and an **Install
Freighter** link when the extension is absent
([`frontend/src/App.tsx`](frontend/src/App.tsx)):

```tsx
{address ? (
  <div className="wallet-connected">
    <span className="wallet-pill">{address.slice(0, 4)}…{address.slice(-4)}</span>
    <button className="secondary disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
  </div>
) : freighterAvailable ? (
  <button className="connect-btn" onClick={handleConnect}>Connect Freighter</button>
) : (
  <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer">Install Freighter</a>
)}
```

```tsx
async function handleConnect() {
  setError(null);
  try {
    const addr = await connectWallet();   // <- from lib/wallet.ts
    setAddress(addr);
  } catch (e) {
    setError((e as Error).message);
  }
}
```

## 3. Wallet permissions + address retrieval

`requestAccess()` is Freighter v6's permission grant — the equivalent of the
older `setAllowed` flow — prompting the user to authorize the app and returning
their public key. `getAddress()` is the fallback / already-authorized path, and
`isConnected()` detects whether the extension is installed
([`frontend/src/lib/wallet.ts`](frontend/src/lib/wallet.ts)):

```ts
export async function isFreighterAvailable(): Promise<boolean> {
  const { isConnected: available } = await isConnected();
  return available;
}

/** Prompts the user to connect Freighter (if not already) and returns their address. */
export async function connectWallet(): Promise<string> {
  const { address, error } = await requestAccess();       // permission + address
  if (address) return address;
  const fallback = await getAddress();                    // already-authorized path
  if (fallback.address) return fallback.address;
  throw new Error(
    error?.message ?? fallback.error?.message ?? "Freighter returned no address",
  );
}

/** Returns the currently connected address, if the app is already authorized. */
export async function getConnectedAddress(): Promise<string | null> {
  const { address, error } = await getAddress();
  if (error || !address) return null;
  return address;
}
```

## 4. Transaction signing

Freighter's `signTransaction` is adapted to the shape the Soroban
`contract.Client` expects ([`frontend/src/lib/wallet.ts`](frontend/src/lib/wallet.ts)):

```ts
/** Adapts Freighter's signTransaction to the shape stellar-sdk's contract.Client expects. */
export const signTransaction: SignTransaction = async (xdr, opts) => {
  const result = await freighterSignTransaction(xdr, {
    networkPassphrase: opts?.networkPassphrase,
    address: opts?.address,
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return { signedTxXdr: result.signedTxXdr, signerAddress: result.signerAddress };
};
```

That adapter is passed into the Soroban contract client, so every write call
(`stake`, `unstake`, `claim_reward`) is signed by the user's wallet and
submitted via `signAndSend()` ([`frontend/src/lib/contract.ts`](frontend/src/lib/contract.ts)):

```ts
import { Client as ContractClient } from "@stellar/stellar-sdk/contract";
import { signTransaction } from "./wallet";

const client = await ContractClient.from({
  contractId,
  networkPassphrase,
  rpcUrl: config.rpcUrl,
  publicKey,
  signTransaction,          // <- Freighter signing
  allowHttp: config.rpcUrl.startsWith("http://"),
});

// ...for a write call:
const sent = await tx.signAndSend();
```

## Manual test walkthrough

See [`frontend/README.md`](frontend/README.md) for the full feature list. In short:

1. Install [Freighter](https://www.freighter.app/), create/import an account, set network to **Testnet**.
2. Fund it: <https://friendbot.stellar.org/?addr=YOUR_G_ADDRESS>.
3. Run the dApp (`cd frontend && npm install && npm run dev`), click **Connect Freighter**, approve.
4. Your **XLM balance** and address pill appear in the header.
5. Stake / unstake / claim, or send XLM — each transaction is signed in Freighter before submission.
