export async function getMarketplaceData(time) {
  const options = {
    method: "GET",
    headers: {
      "X-API-Key": process.env.MNEMONIC_API_KEY,
    },
  };
  const url = `https://ethereum-rest.api.mnemonichq.com/collections/v1beta2/top/METRIC_SALES_VOLUME/${encodeURIComponent(
    time
  )}?limit=25`;
  const query = await fetch(url, options);
  const response = await query.json();
  // Combine the data with the id
  return response;
}
