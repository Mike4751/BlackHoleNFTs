import { useState, useEffect } from "react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import Link from "next/link";
import Image from "next/image";

export default function SearchBar() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const options = {
    method: "GET",
  };

  const settings = {
    apiKey: process.env.MAIN_API_KEY,
    network: Network.ETH_MAINNET,
  };

  const alchemy = new Alchemy(settings);

  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      let api;
      let response;
      let list = [];
      let object = {};
      if (query.length > 0) {
        api = await fetch(
          `/api/collections?name=${encodeURIComponent(query)}`,
          options
        );
        response = await api.json();
        console.log(response);
        for (let i = 0; i < response.data.length; i++) {
          console.log(response.data[i]);
          let alchemyResponse = await alchemy.nft.getContractMetadata(
            response.data[i].contracts[0]
          );
          let logo =
            alchemyResponse.openSea == undefined
              ? null
              : alchemyResponse.openSea.imageUrl;
          console.log(
            await alchemy.nft.getContractMetadata(response.data[i].contracts[0])
          );
          let floorPrice =
            alchemyResponse.openSea == undefined
              ? null
              : alchemyResponse.openSea.floorPrice;
          let tokens =
            alchemyResponse.openSea == undefined
              ? null
              : alchemyResponse.totalSupply;
          object = {
            address: alchemyResponse.address,
            name: response.data[i].name,
            logo: logo == null ? "/blackhole1.png" : logo,
            floorPrice: floorPrice == null ? "" : floorPrice,
            tokens: tokens == null ? "" : tokens,
            isVerified: response.data[i].verified,
          };
          list.push(object);
        }
        setResults(list);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [query]);

  const autoComplete = results.map((item, i) => {
    return (
      <Link
        href={{
          pathname: "/Collection",
          query: {
            address: item.address,
          },
        }}
      >
        <div class="grid w-96 grid-cols-4 p-2 hover:bg-gray-100">
          <div class="col-span-3 flex flex-row">
            <img
              src={item.logo}
              style={{
                width: "auto",
                maxWidth: "40px",
                height: "auto",
                maxHeight: "40px",
              }}
            ></img>
            <div class="flex flex-col pl-1">
              <div class="flex flex-row">
                <div>{item.name}</div>
                <div class="pl-2 pt-2">
                  {item.isVerified && (
                    <Image src="/checkmark.png" width={10} height={10} />
                  )}
                </div>
              </div>
              <div class="text-xs font-thin">
                {item.tokens != "" && `${item.tokens} items`}
              </div>
            </div>
          </div>

          {item.floorPrice != "" && (
            <div class="flex flex-col items-end justify-center pr-2">
              <div class="">{`${item.floorPrice.toFixed(2)} ETH`}</div>
              <div class="text-xs font-thin">Floor</div>
            </div>
          )}
        </div>
      </Link>
    );
  });

  return (
    <main>
      <div class="flex flex-col bg-white ">
        <div class="flex basis-1/12 justify-center">
          <div class="xl:w-96">
            <input
              autocomplete="off"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              class="
              form-control
              fixed
        top-5
        m-0
        block
        w-96
        rounded
        border
        border-solid
        border-gray-300
        bg-white bg-clip-padding
        px-3 py-1.5 text-base
        font-normal
        text-gray-700
        transition
        ease-in-out
        focus:border-gray-600 focus:bg-white focus:text-gray-700 focus:outline-none
      "
              id="autocomplete"
              placeholder="Search Collections"
            />
          </div>
        </div>
        <div class="fixed top-20 bg-white">{autoComplete}</div>
      </div>
    </main>
  );
}
