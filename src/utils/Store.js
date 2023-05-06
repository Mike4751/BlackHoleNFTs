import { createContext, useReducer } from "react";
import Cookies from "js-cookie";

export const Store = createContext();

const initialState = {
  cart: Cookies.get("cart")
    ? JSON.parse(Cookies.get("cart"))
    : { cartItems: [] },
};

console.log("CART", initialState.cart);

function reducer(state, action) {
  switch (action.type) {
    case "CART_ADD_ITEM": {
      const newItem = action.payload;
      console.log("New Item", newItem);
      const existItem = state.cart.cartItems.find(
        (item) =>
          item.address === newItem.address && item.tokenId === newItem.tokenId
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item.address === existItem.address &&
            item.tokenId === existItem.tokenId
              ? newItem
              : item
          )
        : [...state.cart.cartItems, newItem];
      console.log("ADD_CART_ITEM", cartItems);

      console.log(
        "String being passed to cookie",
        JSON.stringify({ ...state.cart, cartItems })
      );
      Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));
      console.log("Setting cart", initialState.cart);
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "CART_REMOVE_ITEM": {
      console.log("item to be removed", action.payload);
      const cartItems = state.cart.cartItems.filter(
        (item) =>
          item.tokenId !== action.payload.tokenId &&
          item.price !== action.payload.price
      );
      Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "CART_RESET":
      return {
        ...state,
        cart: {
          cartItems: [],
        },
      };
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
