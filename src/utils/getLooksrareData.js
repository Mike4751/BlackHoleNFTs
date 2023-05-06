import { LooksRareData, LooksRareTrade } from "@uniswap/universal-router-sdk";
import { getLooksrareListing } from "../pages/api/looksrareListing";
import { UNIVERSAL_ROUTER_ADDRESS } from "@uniswap/universal-router-sdk";

export async function getLooksrareData(asset) {
  let makerOrder;
  let looksrareResponse = await getLooksrareListing(
    asset.address,
    asset.tokenId,
    5
  );
  console.log("RESPONSE", looksrareResponse);

  makerOrder = {
    quoteType: looksrareResponse.data[0].quoteType,
    /** User's current bid / ask nonce */
    globalNonce: looksrareResponse.data[0].globalNonce,
    /** Subset nonce used to group an arbitrary number of orders under the same nonce */
    subsetNonce: looksrareResponse.data[0].subsetNonce,
    /** Nonce for this specific order */
    orderNonce: looksrareResponse.data[0].orderNonce,
    /** Strategy ID, 0: Standard, 1: Collection, etc*/
    strategyId: looksrareResponse.data[0].strategyId,
    /** Asset type, 0: ERC-721, 1:ERC-1155, etc */
    collectionType: looksrareResponse.data[0].collectionType,
    /** Collection address */
    collection: looksrareResponse.data[0].collection,
    /** Currency address (zero address for ETH) */
    currency: looksrareResponse.data[0].currency,
    /** Signer address */
    signer: looksrareResponse.data[0].signer,
    /** Timestamp in second of the time when the order starts to be valid */
    startTime: looksrareResponse.data[0].startTime,
    /** Timestamp in second of the time when the order becomes invalid */
    endTime: looksrareResponse.data[0].endTime,
    /** Minimum price to be received after the trade */
    price: looksrareResponse.data[0].price,
    /** List of item IDS */
    itemIds: looksrareResponse.data[0].itemIds,
    /** List of amount for each item ID (1 for ERC721) */
    amounts: looksrareResponse.data[0].amounts,
    /** Additional parameters for complex orders */
    additionalParameters: looksrareResponse.data[0].additionalParameters,
  };
  return {
    maker: makerOrder,
    signature: looksrareResponse.data[0].signature,
  };
}
