import { BigNumber } from "ethers";
import {
  SwapRouter,
  PERMIT2_ADDRESS,
  ROUTER_AS_RECIPIENT,
  WETH_ADDRESS,
  LooksRareData,
  LooksRareTrade,
  UnwrapWETH,
  SeaportTrade,
  TokenType,
  UniswapTrade,
} from "@uniswap/universal-router-sdk";
import { utils, Wallet } from "ethers";
import { Trade as V2Trade, Route as RouteV2, Pair } from "@uniswap/v2-sdk";
import { Trade as V3Trade, Route as RouteV3, Pool } from "@uniswap/v3-sdk";

import { CurrencyAmount, TradeType } from "@uniswap/sdk-core";
// import {
//   buildTrade,
//   getUniswapPools,
//   swapOptions,
//   DAI,
//   ETHER,
//   WETH,
//   USDC,
// } from "@uniswap/universal-router-sdk/dist/test/utils/uniswapData";

import { useContext } from "react";
import { useProvider } from "wagmi";
import { Store } from "./Store";

export async function buyNFTs() {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { cartItems, paymentMethod } = cart;
  const provider = useProvider();
  console.log(provider);
}
