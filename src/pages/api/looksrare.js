export async function getLooksrare(address) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-Looks-Api-Key": process.env.LOOKSRARE_API_KEY,
    },
  };

  const query = await fetch(
    `https://api.looksrare.org/api/v1/collections?address=${encodeURIComponent(
      address
    )}`,
    options
  );
  const response = await query.json();

  // Combine the data with the id
  return response;
}
