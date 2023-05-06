import "@/styles/globals.css";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import { mainnet, polygon, goerli, hardhat, localhost } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import { ConnectKitProvider } from "connectkit";
import { StoreProvider } from "../utils/Store";

const { provider, chains } = configureChains(
  [mainnet, polygon, goerli, hardhat],
  [
    alchemyProvider({
      apiKey: process.env.MAIN_API_KEY,
    }),
    alchemyProvider({
      apiKey: process.env.POLY_API_KEY,
    }),
    alchemyProvider({
      apiKey: process.env.GOERLI_API_KEY,
    }),
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `http://127.0.0.1:8545/`,
      }),
    }),
  ]
);

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        shimChainChangedDisconnect: false,
      },
    }),
    new WalletConnectConnector({
      chains: chains,
      options: {
        qrcode: false,
      },
    }),
  ],
  provider,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="auto">
        <StoreProvider>
          <Component {...pageProps} />
        </StoreProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
