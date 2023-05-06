export async function getLooksrareListing(address, tokenId, retries) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-Looks-Api-Key": process.env.LOOKSRARE_API_KEY,
    },
  };
  try {
    const query = await fetch(
      `https://api.looksrare.org/api/v2/orders?quoteType=1&collection=${encodeURIComponent(
        address
      )}&itemId=${encodeURIComponent(tokenId)}&status=VALID`,
      options
    );

    if (query.ok) {
      return await query.json();
    }
    if (retries > 0) {
      return await getTokenInformation(address, tokenId, retries - 1);
    }
    throw new Error(res.status);
  } catch (error) {
    console.log(error);
  }
}
