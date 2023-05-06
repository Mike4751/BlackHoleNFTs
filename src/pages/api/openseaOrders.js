export default async function handler(req, res) {
  console.log(process.env.NEXT_PUBLIC_OPENSEA_API_KEY);
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-API-KEY": process.env.NEXT_PUBLIC_OPENSEA_API_KEY,
    },
  };
  try {
    const query = await fetch(
      `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${req.query.address}&token_ids=${req.query.tokenId}&order_by=created_date&order_direction=desc`,
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
