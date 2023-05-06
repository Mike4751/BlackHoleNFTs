export async function getLooksrareStats(address) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  };

  const query = await fetch(
    `https://api.looksrare.org/api/v1/collections/stats?address=${encodeURIComponent(
      address
    )}`,
    options
  );
  const response = await query.json();

  // Combine the data with the id
  return response;
}
