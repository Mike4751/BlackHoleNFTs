import { BigNumber, Contract, ethers } from "ethers";
import { utils, Wallet } from "ethers";
import {
  Trade as V3Trade,
  Route as RouteV3,
  Pool,
  FeeAmount,
  nearestUsableTick,
  TickMath,
  TICK_SPACINGS,
} from "@uniswap/v3-sdk";
import {
  CurrencyAmount,
  TradeType,
  Ether,
  Token,
  Percent,
  Currency,
} from "@uniswap/sdk-core";
import IUniswapV3Pool from "/home/mikey/au/final-project/nft-aggregator/node_modules/@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import JSBI from "jsbi";

export default async function getPool(pay, blockNumber) {
  const provider = getProvider();
  const WETH = new Token(
    1,
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    18,
    "WETH",
    "Wrapped Ether"
  );
  const DAI = new Token(
    1,
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    18,
    "DAI",
    "dai"
  );
  const USDC = new Token(
    1,
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    6,
    "USDC",
    "USD Coin"
  );
  const WBTC = new Token(
    1,
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    8,
    "WBTC",
    "Wrapped Bitcoin"
  );
  const USDT = new Token(
    1,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    6,
    "USDT",
    "Tether"
  );
  let poolToken;
  if (pay == "USDC") {
    poolToken = USDC;
  } else if (pay == "DAI") {
    poolToken = DAI;
  } else if (pay == "USDT") {
    poolToken = USDT;
  } else if (pay == "WBTC") {
    poolToken = WBTC;
  }

  const poolAddress = Pool.getAddress(poolToken, WETH, FeeAmount.LOW);

  const contract = new ethers.Contract(
    poolAddress,
    IUniswapV3Pool.abi,
    provider
  );
  let liquidity = await contract.liquidity({ blockTag: blockNumber });
  let { sqrtPriceX96, tick } = await contract.slot0({ blockTag: blockNumber });
  console.log(sqrtPriceX96, tick);
  liquidity = JSBI.BigInt(liquidity.toString());
  sqrtPriceX96 = JSBI.BigInt(sqrtPriceX96.toString());

  return new Pool(
    poolToken,
    WETH,
    FeeAmount.LOW,
    sqrtPriceX96,
    liquidity,
    tick,
    [
      {
        index: nearestUsableTick(
          TickMath.MIN_TICK,
          TICK_SPACINGS[FeeAmount.LOW]
        ),
        liquidityNet: liquidity,
        liquidityGross: liquidity,
      },
      {
        index: nearestUsableTick(
          TickMath.MAX_TICK,
          TICK_SPACINGS[FeeAmount.LOW]
        ),
        liquidityNet: JSBI.multiply(liquidity, JSBI.BigInt("-1")),
        liquidityGross: liquidity,
      },
    ]
  );
}

function getProvider() {
  return new ethers.providers.JsonRpcProvider(process.env.FORK_URL);
}
