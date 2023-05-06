import Head from "next/head";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useState } from "react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import Cookies from "js-cookie";

import Header from "../../components/Header";
import { Store } from "../../utils/Store";
import { XCircleIcon } from "@heroicons/react/outline";

function Cart() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const [gatewayList, setGatewayList] = useState([]);
  const [cart, setCart] = useState(cartItems);
  const [loading, setLoading] = useState(true);

  console.log(cartItems);

  const removeItemHandler = (item) => {
    dispatch({ type: "CART_REMOVE_ITEM", payload: item });
  };

  const clearClickHandler = () => {
    Cookies.remove("cart");
    dispatch({ type: "CART_RESET" });
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

        list.push({ gateway: gate, name: name });
      }
      setGatewayList(list);
      setLoading(false);
    }
    gateway();
  }, [cart]);

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

      <main>
        <div class="flex rounded-xl border-stone-400 p-10 text-xl">Cart</div>
        {cartItems.length === 0 ? (
          <div class="pl-10">
            Cart is empty. <Link href="/">Go shopping</Link>
          </div>
        ) : (
          <div class="grid grid-cols-4 gap-5 pl-10">
            <div class="col-span-3 overflow-x-auto">
              <table class="min-w-full">
                <thead class="border-b">
                  <tr>
                    <th class="px-5 text-left">Item</th>
                    <th class="px-5 text-right">Quantity</th>
                    <th class="px-5 text-right">Price</th>
                    <th class="p-5">Action</th>
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
                          <td class="p-5 text-center">
                            <button onClick={() => removeItemHandler(item)}>
                              <XCircleIcon class="h-5 w-5"></XCircleIcon>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div class="flex items-center justify-center">
              <div class="block max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-700">
                <h5 class="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
                  Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}) :{" "}
                  {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)} ETH
                </h5>
                <button
                  type="button"
                  class="bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 ml-10 inline-block rounded px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                  onClick={() => router.push("/Placeorder")}
                >
                  Check Out
                </button>
              </div>
            </div>
            <button
              type="button"
              class="bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 ml-10 inline-block rounded px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
              data-te-ripple-init
              data-te-ripple-color="light"
              onClick={clearClickHandler}
            >
              Clear Cart
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default dynamic(() => Promise.resolve(Cart), { ssr: false });