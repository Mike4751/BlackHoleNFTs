export async function getTokenInformation(address, tokenId, retries) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-Looks-Api-Key": process.env.LOOKSRARE_API_KEY,
    },
  };
  try {
    const query = await fetch(
      `https://api.looksrare.org/api/v1/tokens?collection=${encodeURIComponent(
        address
      )}&tokenId=${encodeURIComponent(tokenId)}`,
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
