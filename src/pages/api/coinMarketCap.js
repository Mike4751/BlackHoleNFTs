import { resolve } from "styled-jsx/css";

export default async function handler(req, res) {
  const response = req.query;
  const pay = response.pay;
  console.log(pay);
  let id;
  if (pay == "USDC") {
    id = 3408;
  } else if (pay == "DAI") {
    id = 4943;
  } else if (pay == "USDT") {
    id = 825;
  } else if (pay == "WBTC") {
    id = 3717;
  }
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-CMC_PRO_API_KEY": process.env.COIN_API_KEY,
    },
  };
  try {
    const query = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=1027&convert_id=${encodeURIComponent(
        id
      )}`,
      options
    );
    console.log("query", query.ok);
    if (query.ok) {
      const qJson = await query.json();
      console.log(qJson);
      res.status(200).send(JSON.stringify(qJson));

      return;
    }
    throw new Error(res.status);
  } catch (error) {
    console.log(error);
  }
}
