import { useRouter } from "next/router";
import Router from "next/router";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { useAccount, useNetwork } from "wagmi";

import { Alchemy, Network, Utils } from "alchemy-sdk";

import { useState, useEffect, useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import Header from "/home/mikey/au/final-project/nft-aggregator/src/components/Header.js";
import { getLooksrare } from "../api/looksrare";
import { getLooksrareStats } from "../api/fetchLooksrareStats";
import { fetchCollectionDetails } from "../api/fetchCollectionDetails";
import { getOpenseaAsset } from "../api/openseaListing";
import { getTokenInformation } from "../api/tokenInformation";
import { Store } from "../../utils/Store";
import { getLooksrareListing } from "../api/looksrareListing";

export default function Collection({ address, details, next }) {
  const { state, dispatch } = useContext(Store);

  const [collectionAddress, setCollectionAddress] = useState(address);
  const [looksrareDetails, setLooksrareDetails] = useState("");
  const [looksRareStats, setLooksrareStats] = useState("");
  const [alchemyResponse, setAlchemyResponse] = useState("");
  const [alchemyDetails, setAlchemyDetails] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [banner, setBanner] = useState("");
  const [tokens, setTokens] = useState([]);
  const [nextPage, setNextPage] = useState(next);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(false);
  const [openseaPriceList, setOpenseaPriceList] = useState([]);
  const [looksrarePriceList, setLooksrarePriceList] = useState([]);
  const [network, setNetwork] = useState("Ethereum");
  const [loading, setLoading] = useState(true);

  const settings = {
    apiKey: process.env.MAIN_API_KEY,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(settings);

  const addToCartHandler = (address, tokenId, price, opensea) => {
    const existItem = state.cart.cartItems.find(
      (x) => x.address === address && x.tokenId === tokenId && x.quantity === 1
    );
    if (existItem) {
      alert("This is already in your cart!");
    } else {
      dispatch({
        type: "CART_ADD_ITEM",
        payload: {
          address: address,
          tokenId: tokenId,
          price: price,
          opensea: opensea,
          quantity: 1,
        },
      });
    }
  };

  const getMoreTokens = async () => {
    try {
      console.log("Loading...");
      const newTokens = await alchemy.nft.getNftsForContract(address, {
        pageSize: 25,
        pageKey: nextPage,
      });
      let openseaList = [];
      let looksrareList = [];
      for (let i = 0; i < newTokens.nfts.length; i++) {
        const opensea = await getOpenseaAsset(
          newTokens.nfts[i].contract.address,
          newTokens.nfts[i].tokenId,
          5
        );
        if (opensea.seaport_sell_orders == null) {
          openseaList.push("Unlisted");
        } else if (opensea.seaport_sell_orders[0].side == "ask") {
          openseaList.push(
            (opensea.seaport_sell_orders[0].current_price / 10 ** 18).toFixed(4)
          );
        } else {
          openseaList.push("Unlisted");
        }
        let looksrareToken = await getLooksrareListing(
          newTokens.nfts[i].contract.address,
          newTokens.nfts[i].tokenId,
          5
        );
        console.log("LOOKSRARE LISTING", looksrareToken);

        if (looksrareToken.data.length == 0) {
          looksrareList.push("Unlisted");
        } else {
          let smallPrice = looksrareToken.data[0].price;
          for (let i = 0; i < looksrareToken.data.length; i++) {
            if (looksrareToken.data[i].price < smallPrice) {
              smallPrice = looksrareToken.data[i].price;
            }
          }
          console.log("SMALLPRICE", smallPrice);
          looksrareList.push((smallPrice / 10 ** 18).toFixed(4));
        }
      }
      setNextPage(newTokens.pageKey);
      setTokens((token) => [...token, ...newTokens.nfts]);
      setOpenseaPriceList((price) => [...price, ...openseaList]);
      setLooksrarePriceList((price) => [...price, ...looksrareList]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  async function reset() {
    console.log("RESETTING");
    let lrDetails = await getLooksrare(address);
    let lrStats = await getLooksrareStats(address);
    console.log("LRSTATS", lrStats);
    let aDetails = await alchemy.nft.getContractMetadata(address);
    console.log("aDetails", aDetails);
    const alchemyTokens = await alchemy.nft.getNftsForContract(address, {
      pageSize: 25,
    });
    setTokens(alchemyTokens.nfts);
    setLooksrareStats(lrStats.data);
    setLooksrareDetails(lrDetails.data);
    setAlchemyResponse(aDetails);
    setAlchemyDetails(aDetails.openSea);
    setNextPage(next);
    for (let x in details.metadata) {
      console.log("x", x);
      if (details.metadata[x].type == "TYPE_BANNER_IMAGE_URL") {
        console.log("Banner", details.metadata[x].value);
        setBanner(details.metadata[x].value);
      }
    }
    let openseaList = [];
    let looksrareList = [];
    for (let i = 0; i < alchemyTokens.nfts.length; i++) {
      const opensea = await getOpenseaAsset(
        alchemyTokens.nfts[i].contract.address,
        alchemyTokens.nfts[i].tokenId,
        5
      );
      console.log("OPENSEA LISTING", opensea);
      if (opensea.seaport_sell_orders == null) {
        openseaList.push("Unlisted");
      } else if (opensea.seaport_sell_orders[0].side == "ask") {
        openseaList.push(
          (opensea.seaport_sell_orders[0].current_price / 10 ** 18).toFixed(4)
        );
      } else {
        openseaList.push("Unlisted");
      }
      let looksrareToken = await getLooksrareListing(
        alchemyTokens.nfts[i].contract.address,
        alchemyTokens.nfts[i].tokenId,
        5
      );
      console.log("LOOKSRARE LISTING", looksrareToken);

      if (looksrareToken.data.length == 0) {
        looksrareList.push("Unlisted");
      } else {
        let smallPrice = looksrareToken.data[0].price;
        for (let i = 0; i < looksrareToken.data.length; i++) {
          if (looksrareToken.data[i].price < smallPrice) {
            smallPrice = looksrareToken.data[i].price;
          }
        }
        console.log("SMALLPRICE", smallPrice);
        looksrareList.push((smallPrice / 10 ** 18).toFixed(4));
      }
    }
    setOpenseaPriceList(openseaList);
    setLooksrarePriceList(looksrareList);
    if (next == "") {
      setHasMore(false);
    }
    setLoading(false);
  }
  useEffect(() => {
    async function start() {
      await reset();
    }
    start();
  }, [collectionAddress, address]);

  function handleChange(event) {
    event.preventDefault();
    const timeOutId = setTimeout(async () => {
      let list = [];
      let openseaList = [];
      let looksrareList = [];
      if (event.target.value.length > 0) {
        let alchemyResponse = await alchemy.nft.getNftMetadata(
          address,
          event.target.value
        );
        list.push(alchemyResponse);
        setTokens(list);

        const opensea = await getOpenseaAsset(address, event.target.value, 5);
        if (opensea.seaport_sell_orders == null) {
          openseaList.push("Unlisted");
        } else if (opensea.seaport_sell_orders[0].side == "ask") {
          openseaList.push(
            (opensea.seaport_sell_orders[0].current_price / 10 ** 18).toFixed(4)
          );
        } else {
          openseaList.push("Unlisted");
        }

        let looksrareToken = await getLooksrareListing(
          address,
          event.target.value,
          5
        );
        console.log("LOOKSRARE LISTING", looksrareToken);

        if (looksrareToken.data.length == 0) {
          looksrareList.push("Unlisted");
        } else {
          let smallPrice = looksrareToken.data[0].price;
          for (let i = 0; i < looksrareToken.data.length; i++) {
            if (looksrareToken.data[i].price < smallPrice) {
              smallPrice = looksrareToken.data[i].price;
            }
          }
          console.log("SMALLPRICE", smallPrice);
          looksrareList.push((smallPrice / 10 ** 18).toFixed(4));
        }
        setSearch(true);
        setHasMore(false);
        setOpenseaPriceList(openseaList);
        setLooksrarePriceList(looksrareList);
        setLoading(false);
      } else {
        await reset();
        setSearch(false);
        setHasMore(true);
      }
    }, 1500);

    return () => clearTimeout(timeOutId);
  }

  console.log("looksrare", looksrareDetails);
  console.log("looksrare stats", looksRareStats);
  console.log("details", details);
  console.log("alchemy", alchemyResponse);
  console.log("alchemyDetails", alchemyDetails);
  console.log("NFTs", tokens);
  console.log("Query", query);

  const sortedNftScroll = tokens.map((item, i) => {
    console.log("ITEM DETAILS", item);
    // console.log("OPENSEA PRICE", openseaPriceList[i]);
    // console.log("LOOKSRARE PRICE", looksrarePriceList[i]);
    return (
      <div
        key={item.tokenId}
        class="mx-w-[277.2px] flex grow-0 flex-col rounded-xl border-2 border-black"
      >
        {openseaPriceList[i] != "Unlisted" ||
        looksrarePriceList[i] != "Unlisted" ? (
          <button
            onClick={() =>
              addToCartHandler(
                item.contract.address,
                item.tokenId,
                openseaPriceList[i] > looksrarePriceList[i]
                  ? looksrarePriceList[i]
                  : openseaPriceList[i],
                openseaPriceList[i] > looksrarePriceList[i] ? false : true
              )
            }
            class="mx-3 mt-3 justify-center"
            disabled={loading}
          >
            {item.media.length > 0 ? (
              <img
                src={item.media[0].gateway}
                style={{ width: "auto", height: "auto" }}
              />
            ) : (
              <Image src="/blackhole1.png" width={241} height={241} />
            )}
          </button>
        ) : item.media.length > 0 ? (
          <img
            class="mx-3 mt-3 justify-center"
            src={item.media[0].gateway}
            style={{ width: "auto", height: "auto" }}
          />
        ) : (
          <Image
            class="mx-3 mt-3 justify-center"
            src="/blackhole1.png"
            width={241}
            height={241}
          />
        )}
        <div class="mt-3 flex flex-col">
          <div class="pl-3">{item.tokenId}</div>
          <div class="ml-3 flex flex-row items-center pb-2">
            <div class="grow-0 basis-1/2">
              {loading ? (
                <div
                  class="spinner-border text-black-500 inline-block h-4 w-4 animate-spin rounded-full border-4"
                  role="status"
                >
                  <span class="visually-hidden"></span>
                </div>
              ) : openseaPriceList[i] == "Unlisted" ? (
                looksrarePriceList[i] == "Unlisted" ? (
                  "Unlisted"
                ) : openseaPriceList[i] > looksrarePriceList[i] ? (
                  `${looksrarePriceList[i]} ETH`
                ) : (
                  `${openseaPriceList[i]} ETH`
                )
              ) : openseaPriceList[i] > looksrarePriceList[i] ? (
                `${looksrarePriceList[i]} ETH`
              ) : (
                `${openseaPriceList[i]} ETH`
              )}
            </div>
            <Link
              class="ml-14 inline-block max-w-[50%] basis-1/4 rounded-md border border-gray-800 bg-gray-800 bg-gradient-to-b from-gray-700 to-gray-900 py-1 px-1 pb-1 text-center leading-normal text-gray-100 hover:border-gray-900 hover:bg-gray-800 hover:bg-gray-900 hover:from-gray-900 hover:to-gray-700 hover:text-white hover:ring-0 focus:border-gray-900 focus:bg-gray-900 focus:from-gray-900 focus:to-gray-700 focus:outline-none focus:ring-0"
              href={{
                pathname: "/NFT",
                query: {
                  nft: JSON.stringify({
                    address: item.contract.address,
                    tokenId: item.tokenId,
                    gateway:
                      item.media.length > 0
                        ? item.media[0].gateway
                        : "./blackhole1.png",
                    format:
                      item.media.length > 0 ? item.media[0].format : ".png",
                    contractName: item.contract.name,
                    name:
                      item.rawMetadata.name == undefined
                        ? item.contract.name
                        : item.rawMetadata.name,
                    description: item.contract.openSea.description,
                    attributes: item.rawMetadata.attributes,
                    standard: item.tokenType,
                    creator: item.contract.contractDeployer,
                    network: network,
                  }),
                },
              }}
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    );
  });

  return (
    <>
      <Head>
        <title>Collection</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/blackhole1.ico" />
      </Head>
      <div class="fixed top-0 right-0 left-0 z-[100]">
        <Header />
      </div>
      <div class="mt-32" />
      <div class="z-0 ml-5 mr-5 mb-5 -space-y-36">
        <img
          src={
            looksrareDetails.bannerURI == null
              ? banner
              : looksrareDetails.bannerURI
          }
          class="static z-0 aspect-[4/1] w-full rounded-xl"
        />
        <div class="relative z-[99] m-10 flex h-[180px] w-[180px] items-center justify-center -space-y-4 -space-x-4 rounded-full bg-white">
          <img
            class="m-10 h-[90%] w-[90%] rounded-full"
            src={
              looksrareDetails.logoURI == null
                ? alchemyDetails == undefined
                  ? "./blackhole1.png"
                  : alchemyDetails.imageUrl == undefined
                  ? "./blackhole1.png"
                  : alchemyDetails.imageUrl
                : looksrareDetails.logoURI
            }
          />
        </div>
      </div>
      <div class="flex flex-row items-center">
        <div class="ml-14 text-2xl font-bold">{looksrareDetails.name}</div>
        <div class="ml-3 mr-10">
          {looksrareDetails.isVerified && (
            <Image src="/checkmark.png" width={15} height={15} />
          )}
        </div>{" "}
        {looksrareDetails.discordLink == null ? (
          alchemyDetails.discordUrl == undefined ? (
            ""
          ) : (
            <Link
              href={
                looksrareDetails.discordLink == null
                  ? alchemyDetails.discordUrl == undefined
                    ? ""
                    : alchemyDetails.discordUrl
                  : looksrareDetails.discordLink
              }
              class="grow-0 hover:bg-gray-100"
            >
              <Image src="/discord.png" width={25} height={25} />
            </Link>
          )
        ) : (
          <Link
            href={
              looksrareDetails.discordLink == null
                ? alchemyDetails.discordUrl == undefined
                  ? ""
                  : alchemyDetails.discordUrl
                : looksrareDetails.discordLink
            }
            class="grow-0 hover:bg-gray-100"
          >
            <Image src="/discord.png" width={25} height={25} />
          </Link>
        )}
        {looksrareDetails.twitterLink != null && (
          <Link
            href={looksrareDetails.twitterLink}
            class="ml-3 grow-0 hover:bg-gray-100"
          >
            <Image src="/twitter.png" width={20} height={20} />
          </Link>
        )}
        {looksrareDetails.instagramLink != null && (
          <Link
            href={looksrareDetails.instagramLink}
            class="ml-3 grow-0 hover:bg-gray-100"
          >
            <Image src="/instagram.png" width={20} height={20} />
          </Link>
        )}
        {looksrareDetails.websiteLink == null ? (
          alchemyDetails.externalUrl == undefined ? (
            ""
          ) : (
            <Link
              href={
                looksrareDetails.websiteLink == null
                  ? alchemyDetails.externalUrl == undefined
                    ? ""
                    : alchemyDetails.externalUrl
                  : looksrareDetails.websiteLink
              }
              class="ml-3 grow-0 hover:bg-gray-100"
            >
              <Image src="/website.png" width={20} height={20} />
            </Link>
          )
        ) : (
          <Link
            href={
              looksrareDetails.websiteLink == null
                ? alchemyDetails.externalUrl == undefined
                  ? ""
                  : alchemyDetails.externalUrl
                : looksrareDetails.websiteLink
            }
            class="ml-3 grow-0 hover:bg-gray-100"
          >
            <Image src="/website.png" width={20} height={20} />
          </Link>
        )}
      </div>
      <div class="ml-14 flex flex-row">
        {showDescription == false ? (
          <div class="mt-3">
            {looksrareDetails.description != null
              ? `${looksrareDetails.description.substr(0, 70)}...`
              : alchemyDetails.description != undefined
              ? `${alchemyDetails.description.substr(0, 70)}...`
              : ""}
            {looksrareDetails.description != null ? (
              looksrareDetails.description.length >= 70 ? (
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  class="ml-1 text-stone-500"
                >
                  show more
                </button>
              ) : (
                ""
              )
            ) : alchemyDetails.description != undefined ? (
              alchemyDetails.description.length >= 70 ? (
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  class="ml-1 text-stone-500"
                >
                  show more
                </button>
              ) : (
                ""
              )
            ) : (
              ""
            )}
          </div>
        ) : (
          <div class="mt-3 w-[50%]">
            {looksrareDetails.description != undefined
              ? looksrareDetails.description
              : alchemyDetails.description != undefined
              ? alchemyDetails.description
              : ""}
            <button
              onClick={() => setShowDescription(!showDescription)}
              class="ml-1 text-stone-500"
            >
              show less
            </button>
          </div>
        )}
      </div>
      <div class="ml-14 mt-3 flex flex-row">
        <div class="mr-10 flex flex-col">
          <div class="font-bold">
            {looksRareStats.floorPrice == null
              ? alchemyDetails.floorPrice == null
                ? "N/A"
                : `${alchemyDetails.floorPrice.toFixed(4)} ETH`
              : looksRareStats.floorPrice / 10 ** 18 > alchemyDetails.floorPrice
              ? `${alchemyDetails.floorPrice.toFixed(4)} ETH`
              : `${(looksRareStats.floorPrice / 10 ** 18).toFixed(4)} ETH`}
          </div>
          <div class="text-xs text-stone-500">Floor</div>
        </div>
        <div class="mr-10 flex flex-col">
          <div class="font-bold">
            {looksRareStats.floorChange24h != null
              ? `${looksRareStats.floorChange24h}%`
              : "-"}
          </div>
          <div class="text-xs text-stone-500">Floor 24H</div>
        </div>
        <div class="mr-10 flex flex-col">
          <div class="font-bold">{Number(details.salesVolume).toFixed()}</div>
          <div class="text-xs text-stone-500">Total Volume</div>
        </div>
        <div class="mr-10 flex flex-col">
          <div class="font-bold">{details.tokensCount}</div>
          <div class="text-xs text-stone-500">Items</div>
        </div>
        <div class="mr-10 flex flex-col">
          <div class="font-bold">{details.ownersCount}</div>
          <div class="text-xs text-stone-500">Owners</div>
        </div>
      </div>
      <div class="ml-14 mr-14 mt-5">
        <div class="border-b border-stone-200 pb-2 font-bold text-stone-500">
          Items
        </div>
        <div class="flex flex-col bg-white ">
          <div class="flex basis-1/12 justify-center">
            <div class="xl:w-96">
              <input
                type="search"
                onChange={(event) => handleChange(event)}
                class="
              form-control
        m-3
        block
        w-96
        rounded
        border
        border-solid
        border-gray-300
        bg-white bg-clip-padding
        px-3 py-1.5 text-base
        font-normal
        text-gray-700
        transition
        ease-in-out
        focus:border-gray-600 focus:bg-white focus:text-gray-700 focus:outline-none
      "
                id="autocomplete"
                placeholder="Search by Token Id"
              />
            </div>
          </div>
        </div>
        {query.length > 0 ? (
          <div class="mt-3 mb-3 grid grid-cols-5 gap-4">{sortedNftScroll}</div>
        ) : (
          <div>
            <div class="mt-3 mb-3 grid grid-cols-5 gap-4">
              {sortedNftScroll}
            </div>
            {hasMore && (
              <button
                class="mb-5 inline-block max-w-[50%] basis-1/4 rounded-md border border-gray-800 bg-gray-800 bg-gradient-to-b from-gray-700 to-gray-900 py-1 px-1 pb-1 text-center leading-normal text-gray-100 hover:border-gray-900 hover:bg-gray-800 hover:bg-gray-900 hover:from-gray-900 hover:to-gray-700 hover:text-white hover:ring-0 focus:border-gray-900 focus:bg-gray-900 focus:from-gray-900 focus:to-gray-700 focus:outline-none focus:ring-0"
                onClick={getMoreTokens}
                type="button"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  console.log(context.query);

  const Mnemonic = await fetchCollectionDetails(context.query.address);

  const settings = {
    apiKey: process.env.MAIN_API_KEY,
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(settings);

  const alchemyResponse = await alchemy.nft.getNftsForContract(
    context.query.address,
    {
      pageSize: 25,
    }
  );
  console.log("ARESPONSE", alchemyResponse);
  const nextPage =
    alchemyResponse.pageKey == undefined ? "" : alchemyResponse.pageKey;

  return {
    props: {
      address: context.query.address,
      details: Mnemonic,
      next: nextPage,
    }, // will be passed to the page component as props
  };
}
