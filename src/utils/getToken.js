import { Token } from "@uniswap/sdk-core";

export default async function getToken(pay) {
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
  if (pay == "USDC") {
    return USDC;
  } else if (pay == "DAI") {
    return DAI;
  } else if (pay == "USDT") {
    return USDT;
  } else if (pay == "WBTC") {
    return WBTC;
  }
}
