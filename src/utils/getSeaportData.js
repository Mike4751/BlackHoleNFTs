export async function getSeaportData(assets, address) {
  let items = [];
  for (let i = 0; i < assets.length; i++) {
    let openseaResponse = await fetch(
      "http://localhost:3000/api/openseaOrders?" +
        new URLSearchParams({
          address: assets[i].address,
          tokenId: assets[i].tokenId,
        }),
      {
        method: "GET",
      }
    );

    const response = await openseaResponse.json();
    console.log("V2 SEAPORT RESPONSE", response);

    let fulfillListing = await fetch(
      "http://localhost:3000/api/fulfillListing?" +
        new URLSearchParams({
          hash: response.orders[0].order_hash,
          pro: response.orders[0].protocol_address,
          address: address,
        }),
      {
        method: "GET",
      }
    );
    const listingResponse = await fulfillListing.json();
    console.log("FULFILL LISTING RESPONSE", listingResponse);
    items.push(listingResponse);
  }
  return items;
}
