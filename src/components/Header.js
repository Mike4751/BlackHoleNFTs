import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { Store } from "../utils/Store";

import SearchBar from "./SearchBar";

export default function Header() {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [cartItemsCount, setCartItemsCount] = useState(0);
  useEffect(() => {
    setCartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);
  return (
    <>
      <div class="mx-auto flex h-20 max-w-full flex-row items-center justify-between rounded-xl bg-white p-6 shadow-lg">
        <Link href="/" class="flex basis-1/4 flex-row -space-x-10">
          <Image
            src="/blackhole.png"
            alt="Black Hole"
            width={150}
            height={150}
            class="self-center"
          />
          <div class="self-center pt-2 text-xl font-medium text-black">
            BlackHoleNFTs
          </div>
        </Link>
        <SearchBar />
        <Link href="/myNFTs" class="basis-1/12">
          My NFTs
        </Link>
        <Link href="/Cart">
          Cart
          {cartItemsCount > 0 && (
            <span class="ml-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
              {cartItemsCount}
            </span>
          )}
        </Link>
        <ConnectKitButton class="basis-3/4 self-end" />
      </div>
    </>
  );
}
