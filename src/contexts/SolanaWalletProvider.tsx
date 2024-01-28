import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode } from "react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { SOLANA_RPC } from "@/config";

require("@solana/wallet-adapter-react-ui/styles.css");

export const SolanaWalletProvider = ({ children }: { children: ReactNode }) => {

  const endpoint = SOLANA_RPC;

  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  console.log("connecting wallet", wallets);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};