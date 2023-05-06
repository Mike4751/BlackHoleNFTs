import Head from "next/head";
import Link from "next/link";

import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";

import { Alchemy, Network, Utils } from "alchemy-sdk";

import { useState, useEffect } from "react";

import Header from "../../components/Header";

export default function MyNFT() {
  const { address, isConnected, isConnecting } = useAccount();
  const { chains, error, isLoading, status } = useSwitchNetwork();
  const { chain } = useNetwork();
  const [nfts, setNFTs] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [tokenUri, setTokenUri] = useState("");
  const [nftList, setNftList] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  // const network = useSwitchNetwork({
  //   onSuccess(data) {
  //     console.log("Success", data);
  //   },
  // });

  useEffect(() => {
    setHydrated(true);
  }, []);

  console.log("Beginning", isConnected);

  useEffect(() => {
    async function getNFTs() {
      console.log("useEffect", isConnected);
      if (!isConnected) {
        console.log("FALSE");
        return false;
      } else {
        console.log(chain, address);
        const chainId = chain.id;
        console.log(chainId);
        const settings = {
          apiKey:
            chainId == 1 || chainId == 31337
              ? process.env.MAIN_API_KEY
              : chainId == 137
              ? process.env.POLY_API_KEY
              : process.env.GOERLI_API_KEY,
          network:
            chainId == 1
              ? Network.ETH_MAINNET
              : chainId == 137
              ? Network.MATIC_MAINNET
              : Network.ETH_GOERLI,
        };
        const alchemy = new Alchemy(settings);
        console.log("HEY");
        const NFT = await alchemy.nft.getNftsForOwner(address);
        console.log(NFT);
        const NFTs = NFT.ownedNfts;
        const itemList = [];
        for (let i = 0; i < NFTs.length; i++) {
          let item = {
            key: i,
            address: NFT.ownedNfts[i].contract.address,
            tokenId: NFT.ownedNfts[i].tokenId,
            gateway:
              // NFTs[i].metadataError == "Failed to get token uri" ||
              NFTs[i].media.length === 0
                ? "/blackhole.png"
                : NFTs[i].media[0].gateway === undefined
                ? "/blackhole.png"
                : NFTs[i].media[0].gateway,
            format:
              NFTs[i].media.length === 0 ? "png" : NFTs[i].media[0].format,
            contractName: NFTs[i].contract.name,
            title: NFTs[i].title,
            description: NFTs[i].description,
            attributes: NFTs[i].rawMetadata.attributes,
            standard: NFT.ownedNfts[i].contract.tokenType,
            creator: NFT.ownedNfts[i].contract.contractDeployer,
            network: chain.name,
          };
          itemList.push(item);
        }
        setNftList(itemList);
        setTokenUri(NFTs[0].media[0].gateway);
        setMediaType(NFTs[0].media[0].format);
        setNFTs(NFTs);
        console.log("async NFTs", NFT);
      }
    }
    getNFTs();
  }, [isConnecting, chain]);

  console.log(nfts);
  console.log(mediaType);
  const yourNfts = nftList.map((item) => {
    return item.format == "mp4" ? (
      <div
        key={item.key}
        class="mx-w-[277.2px] flex grow-0 flex-col rounded-xl border-2 border-black"
      >
        <video
          class="mx-3 mt-3 justify-center"
          src={item.gateway}
          autoPlay
          loop
          style={{ width: "auto", height: "auto" }}
          alt={item.description}
        />
        <div class="mx-w-[277.2px] flex grow-0 flex-row justify-between">
          <div class="mt-3 flex grow-0 basis-3/4 flex-col truncate">
            <div class="flex-grow-0 flex-nowrap truncate pl-3">
              {item.title.slice(0, 25)}
            </div>
            <div class="pl-3 pb-2">{item.tokenId}</div>
          </div>
          <Link
            class="mx-3 my-4 inline-block max-w-[50%] basis-1/4 rounded-md border border-gray-800 bg-gray-800 bg-gradient-to-b from-gray-700 to-gray-900 py-1 px-1 pb-1 text-center leading-normal text-gray-100 hover:border-gray-900 hover:bg-gray-800 hover:bg-gray-900 hover:from-gray-900 hover:to-gray-700 hover:text-white hover:ring-0 focus:border-gray-900 focus:bg-gray-900 focus:from-gray-900 focus:to-gray-700 focus:outline-none focus:ring-0"
            href={{
              pathname: `/NFT`,
              query: {
                nft: JSON.stringify({
                  address: item.address,
                  tokenId: item.tokenId,
                }),
              },
            }}
            // as={item.tokenId}
          >
            Details
          </Link>
        </div>
      </div>
    ) : (
      <div
        key={item.key}
        class="mx-w-[277.2px] flex grow-0 flex-col rounded-xl border-2 border-black"
      >
        <img
          class="mx-3 mt-3 justify-center"
          src={item.gateway}
          style={{ maxWidth: "100", maxHeight: "100" }}
        />
        <div class="mx-w-[277.2px] flex grow-0 flex-row justify-between">
          <div class="mt-3 flex grow-0 basis-3/4 flex-col truncate">
            <div class="flex-grow-0 flex-nowrap truncate pl-3">
              {item.title.slice(0, 25)}
            </div>
            <div class="pl-3 pb-2">{item.tokenId}</div>
          </div>
          <Link
            class="mx-3 my-4 inline-block max-w-[50%] basis-1/4 rounded-md border border-gray-800 bg-gray-800 bg-gradient-to-b from-gray-700 to-gray-900 py-1 px-1 pb-1 text-center leading-normal text-gray-100 hover:border-gray-900 hover:bg-gray-800 hover:bg-gray-900 hover:from-gray-900 hover:to-gray-700 hover:text-white hover:ring-0 focus:border-gray-900 focus:bg-gray-900 focus:from-gray-900 focus:to-gray-700 focus:outline-none focus:ring-0"
            href={{
              pathname: `/NFT`,
              query: {
                nft: JSON.stringify({
                  address: item.address,
                  tokenId: item.tokenId,
                }),
              },
            }}
          >
            Details
          </Link>
        </div>
      </div>
    );
  });
  if (!hydrated) {
    return null;
  } else {
    return (
      <>
        <Head>
          <title>My NFTs</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/blackhole1.ico" />
        </Head>
        <div class="fixed top-0 right-0 left-0 z-[100]">
          <Header />
        </div>

        {isConnected ? (
          <main>
            <div class="flex flex-col rounded-xl border-stone-400 p-10">
              Your NFTs
            </div>
            <div class="grid grid-cols-5 gap-4 pr-10 pb-10 pl-10">
              {yourNfts}
            </div>
          </main>
        ) : (
          <main>
            <div class="flex rounded-xl border-stone-400 p-10">
              Please connect a wallet to see your NFTs
            </div>
          </main>
        )}
      </>
    );
  }
}
