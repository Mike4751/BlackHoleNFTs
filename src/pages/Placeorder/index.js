import Head from "next/head";
import Link from "next/link";
import Cookies from "js-cookie";
import { Router, useRouter } from "next/router";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { Store } from "../../utils/Store";
import Header from "../../components/Header";
import { BigNumber, Contract, ethers, FixedNumber, Signer } from "ethers";
import { Interface } from "@ethersproject/abi";
import { useProvider, useAccount, useSigner } from "wagmi";
import { getSeaportData } from "../../utils/getSeaportData";
import { getLooksrareData } from "../../utils/getLooksrareData";
import { ChainId, LooksRare } from "@looksrare/sdk-v2";
import { Seaport } from "@opensea/seaport-js";
import { SeaportABIv14 } from "/home/mikey/au/final-project/nft-aggregator/src/utils/seaportABI.js";

function Placeorder() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { cartItems } = cart;
  const [gatewayList, setGatewayList] = useState([]);
  const [cart1, setCart] = useState(cartItems);
  const [loading, setLoading] = useState(true);
  const [summaryList, setSummaryList] = useState([]);

  const provider = useProvider();
  const tenderlyProvider = new ethers.providers.JsonRpcProvider(
    "https://mainnet.gateway.tenderly.co/2vL4AcOWUVNO7h71nLZ29Q"
  );
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const itemsPrice = round2(
    cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  const placeOrderHandler = async () => {
    try {
      await buyNFTs();
    } catch (e) {
      alert(e);
    }
  };

  const clearClickHandler = () => {
    Cookies.remove("cart");
    dispatch({ type: "CART_RESET" });
  };

  const buyNFTs = async () => {
    try {
      // await goBack();
      console.log("STARTING");
      const tenderlySigner = await tenderlyProvider.getSigner(address);
      console.log("TENDERLY SIGNER", tenderlySigner);
      console.log("FILLING ACCOUNT");
      // await fillEther(address, itemsPrice);
      console.log("ACCOUNT FILLED");

      const looksrareSDK = new LooksRare(ChainId.MAINNET, provider, signer);
      console.log("LOOKSRARE INSTANCE", looksrareSDK);

      const seaport = new Seaport(tenderlySigner);
      let transactions = [];

      const openseaItems = cartItems.filter((item) => item.opensea == true);
      const iface = new Interface(SeaportABIv14);
      if (openseaItems.length !== 0) {
        const seaContract = new ethers.Contract(
          "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
          iface,
          signer
        );
        let seaportListings = await getSeaportData(openseaItems, address);
        let value = 0;
        let orders = [];
        let considerationComponents = [];
        let offerComponents = [];
        let fulfillerConduitKey =
          seaportListings[0].fulfillment_data.transaction.input_data.parameters
            .fulfillerConduitKey;

        for (let i = 0; i < seaportListings.length; i++) {
          value += seaportListings[i].fulfillment_data.transaction.value;
          let order = seaportListings[i].fulfillment_data.orders[0];
          order["numerator"] = "1";
          order["denominator"] = "1";
          order["extraData"] = "0x";
          console.log("we done it", transactions);
          orders.push(order);
          let list = [];
          for (
            let j = 0;
            j <
            seaportListings[i].fulfillment_data.orders[0].parameters
              .consideration.length;
            j++
          ) {
            considerationComponents.push([
              {
                orderIndex: `${i}`,
                itemIndex: `${j}`,
              },
            ]);
          }
          // considerationComponents.push(list);
          offerComponents.push([{ orderIndex: `${i}`, itemIndex: "0" }]);
        }
        console.log("CONSIDERATION", considerationComponents);
        console.log("address", address);
        console.log("signer", signer);
        console.log("SEACON", seaContract);
        const error = iface.getError("0x7fda7279");
        console.log("ERROR", error);
        const fulfill = await seaContract
          .connect(signer)
          .fulfillAvailableAdvancedOrders(
            orders,
            [],
            offerComponents,
            considerationComponents,
            fulfillerConduitKey,
            "0x0000000000000000000000000000000000000000",
            seaportListings.length,
            {
              value: ethers.utils.parseEther((value / 10 ** 18).toString()),
              gasLimit: 500000,
            }
          );
        console.log("RECEIPT", await fulfill.wait());
      }

      const looksrareItems = cartItems.filter((item) => item.opensea == false);
      if (looksrareItems.length !== 0) {
        let looksrareOrders = [];
        for (let i = 0; i < looksrareItems.length; i++) {
          let { maker, signature } = await getLooksrareData(looksrareItems[i]);
          console.log("MAKER", maker);
          console.log("SIGNATURE", signature);
          let taker = looksrareSDK.createTaker(maker);
          console.log("TAKER", taker);

          looksrareOrders.push({
            maker: maker,
            taker: taker,
            signature: signature,
          });
        }
        const { call } = looksrareSDK.executeMultipleOrders(
          looksrareOrders,
          true,
          undefined,
          { gasLimit: "500000" }
        );
        const tx = await call();

        const receipt = await tx.wait();
        console.log("RECEIPT", receipt);

        console.log("SUMMARY", summaryList);
      }
      router.push({
        pathname: "/Summary",
        query: {
          nft: summaryList,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    async function gateway() {
      const settings = {
        apiKey: process.env.MAIN_API_KEY,
        network: Network.ETH_MAINNET,
      };
      const alchemy = new Alchemy(settings);
      let list = [];
      for (let i = 0; i < cartItems.length; i++) {
        const alchemyResponse = await alchemy.nft.getNftMetadata(
          cartItems[i].address,
          cartItems[i].tokenId
        );
        const gate = alchemyResponse.media[0].gateway;
        const name = alchemyResponse.contract.name;
        const type = alchemyResponse.tokenType;

        list.push({ gateway: gate, name: name, type: type });
      }

      setGatewayList(list);

      setLoading(false);

      let sumList = [];
      for (let i = 0; i < cartItems.length; i++) {
        sumList.push(
          JSON.stringify({
            address: cartItems[i].address,
            tokenId: cartItems[i].tokenId,
          })
        );
      }
      setSummaryList(sumList);
    }
    gateway();
  }, [cart1]);

  return (
    <>
      <Head>
        <title>Cart</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/blackhole1.ico" />
      </Head>
      <div class="fixed top-0 right-0 left-0 z-[100]">
        <Header />
      </div>

      <main class="mt-32">
        <h1 class="mb-4 pl-10 text-xl">Place Order</h1>
        {cartItems.length === 0 ? (
          <div class="px-10">
            Cart is empty. <Link href="/">Go shopping</Link>
          </div>
        ) : (
          <div class="grid px-10 md:grid-cols-4 md:gap-5">
            <div class="overflow-x-auto md:col-span-4">
              <div class="card overflow-x-auto p-5">
                <h2 class="mb-2 text-lg">Order Items</h2>
                <table class="min-w-full">
                  <thead class="border-b">
                    <tr>
                      <th class="px-5 text-left">Item</th>
                      <th class="p-5 text-right">Quantity</th>
                      <th class="p-5 text-right">Price</th>
                      <th class="p-5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading == false &&
                      cartItems.map((item, i) => {
                        return (
                          <tr key={item.tokenId} class="border-b">
                            <td>
                              <Link
                                href={{
                                  pathname: "/NFT",
                                  query: {
                                    nft: JSON.stringify({
                                      address: item.address,
                                      tokenId: item.tokenId,
                                    }),
                                  },
                                }}
                                class="flex items-center"
                              >
                                <img
                                  src={gatewayList[i].gateway}
                                  alt={item.tokenId}
                                  width={50}
                                  height={50}
                                ></img>
                                &nbsp;
                                {gatewayList[i].name} {item.tokenId}
                              </Link>
                            </td>
                            <td class="p-5 text-right">{item.quantity}</td>
                            <td class="p-5 text-right">{item.price} ETH</td>
                            <td class="p-5 text-right">
                              {item.quantity * item.price} ETH
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                <div>
                  <Link href="/Cart">Edit</Link>
                </div>
              </div>
            </div>
            <div>
              <div class="card p-5">
                <h2 class="mb-2 text-lg">Order Summary</h2>
                <ul>
                  <li>
                    <div class="mb-2 flex justify-between">
                      <div>Total</div>
                      <div>{itemsPrice} ETH </div>
                    </div>
                  </li>
                  <li>
                    <button
                      disabled={loading}
                      onClick={() => placeOrderHandler()}
                      class="primary-button w-full"
                    >
                      {loading ? "Loading..." : "Pay"}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default dynamic(() => Promise.resolve(Placeorder), { ssr: false });
