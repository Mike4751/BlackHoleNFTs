import JSBI from "jsbi";
import { ethers } from "ethers";
import {
  MixedRouteTrade,
  MixedRouteSDK,
  Trade as RouterTrade,
} from "@uniswap/router-sdk";
import {
  Trade as V2Trade,
  Pair,
  Route as RouteV2,
  computePairAddress,
} from "@uniswap/v2-sdk";
import {
  Trade as V3Trade,
  Pool,
  Route as RouteV3,
  nearestUsableTick,
  TickMath,
  TICK_SPACINGS,
  FeeAmount,
} from "@uniswap/v3-sdk";
import {
  CurrencyAmount,
  TradeType,
  Ether,
  Token,
  Percent,
  Currency,
} from "@uniswap/sdk-core";

export function buildTrade(trades) {
  return new RouterTrade({
    v2Routes: "",
    v3Routes: trades.map((trade) => ({
      routev3: trade.route,
      inputAmount: trade.inputAmount,
      outputAmount: trade.outputAmount,
    })),
    mixedRoutes: "",
    tradeType: TradeType.EXACT_OUTPUT,
  });
}

export function swapOptions(options) {
  return Object.assign(
    {
      slippageTolerance: new Percent(5, 100),
      recipient: "",
    },
    options
  );
}
