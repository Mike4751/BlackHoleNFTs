import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { Alchemy, Network, Utils } from "alchemy-sdk";

import { useState, useEffect } from "react";
import useSWR from "swr";

import Header from "../components/Header";
import { getMarketplaceData } from "./api/nfts";
import { fetchCollectionDetails } from "./api/fetchCollectionDetails";
import { getLooksrare } from "./api/looksrare";
import { getLooksrareStats } from "./api/fetchLooksrareStats";
import { getCollection } from "./api/collections";

export default function Home({
  collection1,
  collection7,
  collection30,
  collection365,
}) {
  const [mainNfts, setMainNfts] = useState(collection1);
  const [dataList, setDataList] = useState([]);
  const [collection, setCollection] = useState();

  const settings = {
    apiKey: process.env.MAIN_API_KEY,
    network: Network.ETH_MAINNET,
  };

  const alchemy = new Alchemy(settings);

  useEffect(() => {
    async function getData() {
      let detailList = [];
      let detail = [];

      for (let i = 0; i < mainNfts.collections.length; i++) {
        let collectionDetails = await getLooksrare(
          mainNfts.collections[i].collection.contractAddress
        );
        console.log("collection details", collectionDetails);
        let collectionStats = await getLooksrareStats(
          mainNfts.collections[i].collection.contractAddress
        );
        let alchemyResponse = await alchemy.nft.getContractMetadata(
          mainNfts.collections[i].collection.contractAddress
        );
        let bannerImage =
          collectionDetails.data.logoURI == null
            ? alchemyResponse.openSea == undefined
              ? null
              : alchemyResponse.openSea.imageUrl
            : collectionDetails.data.logoURI;
        console.log("banner image", bannerImage);
        let name =
          alchemyResponse.openSea == undefined
            ? null
            : alchemyResponse.openSea.collectionName;
        let tokenCount =
          alchemyResponse == "" ? null : alchemyResponse.totalSupply;
        let object = {
          name: name == null ? collectionDetails.data.name : name,
          bannerImage: bannerImage == null ? "/blackhole1.png" : bannerImage,
          openseaFloorPrice: (
            await alchemy.nft.getFloorPrice(
              mainNfts.collections[i].collection.contractAddress
            )
          ).openSea.floorPrice,
          looksrareFloorPrice: (
            await alchemy.nft.getFloorPrice(
              mainNfts.collections[i].collection.contractAddress
            )
          ).looksRare.floorPrice,
          salesVolume: mainNfts.collections[i].metricValue,
          tokenCount: tokenCount == null ? "" : tokenCount,
          ownersCount: collectionStats.data.countOwners,
          isVerified:
            collectionDetails.data.isVerified == true
              ? true
              : alchemyResponse.openSea != undefined
              ? alchemyResponse.openSea.safelistRequestStatus == "verified"
                ? true
                : false
              : false
              ? true
              : false,
        };
        detailList.push(object);
      }
      setDataList(detailList);
    }
    getData();
  }, [mainNfts]);
  const trendingList = mainNfts.collections.map((item, i) => {
    return dataList.length == 0 ? (
      <div class="flex items-center justify-center">
        <div
          class="spinner-border text-black-500 inline-block h-8 w-8 animate-spin rounded-full border-4"
          role="status"
        >
          <span class="visually-hidden"></span>
        </div>
      </div>
    ) : (
      <Link
        href={{
          pathname: "/Collection",
          query: {
            address: item.collection.contractAddress,
          },
        }}
      >
        <div class="m-3 grid grid-cols-7 rounded-xl p-3 text-stone-600 hover:bg-gray-100">
          <div class="col-span-3 flex flex-row items-center justify-center justify-self-start">
            <img
              src={dataList[i].bannerImage}
              style={{
                width: "auto",
                maxWidth: "40px",
                height: "auto",
                maxHeight: "40px",
              }}
            ></img>
            <div class="justify-self-center pl-3">{dataList[i].name}</div>
            <div class="ml-3 fill-current">
              {dataList[i].isVerified && (
                <img
                  src="./checkmark.png"
                  style={{
                    width: "auto",
                    maxWidth: "15px",
                    height: "auto",
                    maxHeight: "15px",
                  }}
                />
              )}
            </div>
          </div>
          {dataList[i].openseaFloorPrice == undefined ? (
            <div class="justify-self-center pt-1">N/A</div>
          ) : dataList[i].openseaFloorPrice >
            dataList[i].looksrareFloorPrice ? (
            dataList[i].looksrareFloorPrice.toString().length > 6 ? (
              <div class="justify-self-center pt-1">
                {dataList[i].looksrareFloorPrice.toFixed(4)} ETH
              </div>
            ) : (
              <div class="justify-self-center pt-1">
                {dataList[i].looksrareFloorPrice} ETH
              </div>
            )
          ) : dataList[i].openseaFloorPrice.toString().length > 6 ? (
            <div class="justify-self-center pt-1">
              {dataList[i].openseaFloorPrice.toFixed(4)} ETH
            </div>
          ) : (
            <div class="justify-self-center pt-1">
              {dataList[i].openseaFloorPrice} ETH
            </div>
          )}
          <div class="justify-self-center pt-1">
            {Math.round(dataList[i].salesVolume)}
          </div>
          <div class="justify-self-center pt-1 pl-5">
            {dataList[i].tokenCount}
          </div>
          <div class="justify-self-center pt-1 pl-5">
            {dataList[i].ownersCount}
          </div>
        </div>
      </Link>
    );
  });

  return (
    <>
      <Head>
        <title>NFT Aggregator</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/blackhole1.ico" />
      </Head>
      <div class="fixed top-0 right-0 left-0 z-[100]">
        <Header />
      </div>

      <main>
        <div class="mt-32 flex flex-col justify-center space-y-5 pt-10">
          <div class="self-center text-4xl font-bold">
            In a black hole nothing escapes.
          </div>
          <div class="self-center text-4xl font-bold">Not even NFTs.</div>
          <div class="self-center text-4xl font-bold">
            Bend time, save money.
          </div>
          <div class="m-10 flex items-center justify-start">
            <div
              class="mt-10 inline-flex shadow-md hover:shadow-lg focus:shadow-lg"
              role="toolbar"
            >
              <button
                type="button"
                class="inline-block rounded-l px-6 py-2.5 text-xs font-medium uppercase leading-tight text-stone-600 transition duration-150 ease-in-out hover:bg-stone-400 focus:bg-stone-400 focus:outline-none focus:ring-0"
                onClick={() => {
                  setMainNfts(collection1);
                }}
              >
                1D
              </button>
              <button
                type="button"
                class=" inline-block px-6 py-2.5 text-xs font-medium uppercase leading-tight text-stone-600 transition duration-150 ease-in-out hover:bg-stone-400 focus:bg-stone-400 focus:outline-none focus:ring-0"
                onClick={() => {
                  setMainNfts(collection7);
                }}
              >
                1W
              </button>
              <button
                type="button"
                class=" inline-block px-6 py-2.5 text-xs font-medium uppercase leading-tight text-stone-600 transition duration-150 ease-in-out hover:bg-stone-400 focus:bg-stone-400 focus:outline-none focus:ring-0"
                onClick={() => {
                  setMainNfts(collection30);
                }}
              >
                1M
              </button>
              <button
                type="button"
                class="inline-block rounded-r px-6 py-2.5 text-xs font-medium uppercase leading-tight text-stone-600 transition duration-150 ease-in-out hover:bg-stone-400 focus:bg-stone-400 focus:outline-none focus:ring-0"
                onClick={() => {
                  setMainNfts(collection365);
                }}
              >
                1Y
              </button>
            </div>
          </div>

          <div class="m-10 flex flex-col rounded-xl border border-stone-400 ">
            <div class="m-3 grid grid-cols-7 rounded-xl p-3 font-thin text-stone-600">
              <div class="col-span-3">Collection Name</div>
              <div class="justify-self-center">Floor</div>
              <div class="justify-self-center">Volume</div>
              <div class="justify-self-center">Items</div>
              <div class="justify-self-center">Owners</div>
            </div>
            <div class="gap-4 space-y-3 p-3">{trendingList}</div>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const collection1 = await getMarketplaceData("DURATION_1_DAY");
  const collection7 = await getMarketplaceData("DURATION_7_DAYS");
  const collection30 = await getMarketplaceData("DURATION_30_DAYS");
  const collection365 = await getMarketplaceData("DURATION_365_DAYS");
  console.log("I'm still here");
  return {
    props: {
      collection1,
      collection7,
      collection30,
      collection365,
    },
  };
}
