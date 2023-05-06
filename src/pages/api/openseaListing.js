export async function getOpenseaAsset(address, tokenId, retries) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  };
  try {
    const query = await fetch(
      `https://api.opensea.io/api/v1/asset/${encodeURIComponent(
        address
      )}/${encodeURIComponent(tokenId)}/?include_orders=true`,
      options
    );
    if (query.ok) {
      return await query.json();
    }
    if (retries > 0) {
      return await getOpenseaAsset(address, tokenId, retries - 1);
    }
    throw new Error(res.status);
  } catch (error) {
    console.log(error);
  }
}
