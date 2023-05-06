import CoinGecko from "coingecko-api";

export async function getConversion(pay) {
  const coingecko = new CoinGecko();
  try {
    if (pay == "ETH") {
      return 1;
    } else if (pay == "USDC") {
      const ethPrice = await coingecko.simple.price({
        ids: "usd-coin",
        vs_currencies: "eth",
      });
      console.log(ethPrice);
      return ethPrice.data["usd-coin"].eth;
    } else if (pay == "DAI") {
      const ethPrice = await coingecko.simple.price({
        ids: "dai",
        vs_currencies: "eth",
      });
      console.log(ethPrice);
      return ethPrice.data["dai"].eth;
    } else if (pay == "USDT") {
      const ethPrice = await coingecko.simple.price({
        ids: "tether",
        vs_currencies: "eth",
      });
      console.log(ethPrice);
      return ethPrice.data["tether"].eth;
    } else if (pay == "WBTC") {
      const ethPrice = await coingecko.simple.price({
        ids: "wrapped-bitcoin",
        vs_currencies: "eth",
      });
      console.log(ethPrice);
      return ethPrice.data["wrapped-bitcoin"].eth;
    } else if (pay == "WETH") {
      return 1;
    }
  } catch (e) {
    console.log(e);
  }
}
