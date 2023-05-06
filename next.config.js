/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // trailingSlash: true,
  env: {
    MAIN_API_KEY: "DjGQuqJOKig0MlnGxwZW1wSm75Y0rGwc",
    POLY_API_KEY: "uBTNnSx0ENqa2KLvoEkHukst8ShVYs6u",
    GOERLI_API_KEY: "17X5k7BYNmXxS6Fh3BgPqWgm_rICIAUZ",
  },
  images: {
    domains: ["nft-cdn.alchemy.com", "ipfs.io"],
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/api/fetchCollectionDetails",
  //       headers: [
  //         {
  //           key: "Access-Control-Allow-Origin",
  //           value: "*",
  //         },
  //         {
  //           key: "Access-Control-Request-Method",
  //           value: "GET, POST, OPTIONS",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
