/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ADD_TO_CART,
  DECREASE_ITEM_QUANTITY,
  DELETE_ALL_CARTITEM,
  DELETE_CART_ITEM,
  INCREASE_ITEM_QUANTITY,
  RESET_STATES,
  SELECT_ITEM_COLOR,
  SELECT_ITEM_SIZE,
} from './constants';

interface Size {
  size: string;
  displayName: string;
}

interface Color {
  color: string;
  displayName: string;
}

type CartItem = {
  _id: string;
  sizes: Size[];
  colors: Color[];
  price: number;
  discountPrice?: number;
  increaseValue?: number;
  quantity: number;
  title: string;
  description: string;
  sizeArrayForDropDown?: { key: number; value: string }[];
  selectedColor: string;
  selectedSize: string;
  displayColor: string;
  displaySize: string;
} & Record<string, any>;

// Interface for the cart state
export interface CartState {
  cart: CartItem[];
}

// Action interfaces
export interface AddToCartAction {
  type: typeof ADD_TO_CART;
  payload: CartItem;
}

export interface DeleteCartItemAction {
  type: typeof DELETE_CART_ITEM;
  payload: { _id: string };
}

export interface DeleteAllCartItemsAction {
  type: typeof DELETE_ALL_CARTITEM;
  payload: undefined | null;
}

export interface SelectItemColorAction {
  type: typeof SELECT_ITEM_COLOR;
  payload: CartItem;
  newColor: string;
}

export interface SelectItemSizeAction {
  type: typeof SELECT_ITEM_SIZE;
  payload: CartItem;
  newSize: string;
}

export interface IncreaseItemQuantityAction {
  type: typeof INCREASE_ITEM_QUANTITY;
  payload: CartItem;
}

export interface DecreaseItemQuantityAction {
  type: typeof DECREASE_ITEM_QUANTITY;
  payload: CartItem;
}

export interface ResetStatesAction {
  type: typeof RESET_STATES;
  payload: undefined | null;
}

// Union type for all actions
export type CartAction =
  | AddToCartAction
  | DeleteCartItemAction
  | DeleteAllCartItemsAction
  | SelectItemColorAction
  | SelectItemSizeAction
  | IncreaseItemQuantityAction
  | DecreaseItemQuantityAction
  | ResetStatesAction;
