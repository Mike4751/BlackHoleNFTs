export async function fetchCollectionDetails(address) {
  try {
    const options = {
      method: "GET",
      headers: {
        "X-API-Key": process.env.MNEMONIC_API_KEY,
      },
    };
    const response = await fetch(
      `https://ethereum-rest.api.mnemonichq.com/collections/v1beta2/${address}/metadata?includeStats=true`,
      options
    );
    const resss = await response.json();

    return resss;
  } catch (error) {
    console.log(error);
  }
}
