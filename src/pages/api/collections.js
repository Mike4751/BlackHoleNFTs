export default async function handler(req, res) {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-Key": process.env.UBIQUITY_API_KEY,
      },
    };

    const query = await fetch(
      `https://svc.blockdaemon.com/nft/v1/ethereum/mainnet/collections/search?name=${req.query.name}&page_size=5`,
      options
    );
    const response = await query.json();
    res.status(200).json(response);
    // Combine the data with the id
  } catch (error) {
    res.status(405).json(error);
  }
}
