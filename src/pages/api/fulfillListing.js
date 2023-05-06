export default async function handler(req, res) {
  const url = "https://api.opensea.io/v2/listings/fulfillment_data";
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-API-KEY": process.env.NEXT_PUBLIC_OPENSEA_API_KEY,
    },
    body: JSON.stringify({
      listing: {
        hash: `${req.query.hash}`,
        chain: "ethereum",
        protocol_address: `${req.query.pro}`,
      },
      fulfiller: {
        address: `${req.query.address}`,
      },
    }),
  };
  try {
    const query = await fetch(url, options);
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
