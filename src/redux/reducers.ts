/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { combineReducers } from '@reduxjs/toolkit';
import {
  ADD_TO_CART,
  DELETE_CART_ITEM,
  SELECT_ITEM_COLOR,
  SELECT_ITEM_SIZE,
  INCREASE_ITEM_QUANTITY,
  DECREASE_ITEM_QUANTITY,
  DELETE_ALL_CARTITEM,
  RESET_STATES,
} from './constants';
import {
  AddToCartAction,
  CartAction,
  CartState,
  DecreaseItemQuantityAction,
  DeleteAllCartItemsAction,
  DeleteCartItemAction,
  IncreaseItemQuantityAction,
  SelectItemColorAction,
  SelectItemSizeAction,
} from './types';

const initialState: CartState = {
  cart: [],
};

const addToCart = (state: CartState, action: AddToCartAction) => {
  const item = action.payload;
  // this new array is created to make use of the select-down library
  const newSizesArray = item?.sizes?.map((sizeItem, index) => ({
    key: index,
    value: sizeItem.size,
  }));

  // these new variables are created for cart functions
  item.price = item.discountPrice ? item.discountPrice : item.price;
  item.increaseValue = item.discountPrice ? item.discountPrice : item.price;
  item.quantity = 1;

  item.sizeArrayForDropDown = newSizesArray;

  item.selectedColor = item.colors[0].color;
  item.selectedSize = item.sizes[0].size;
  item.displayColor =
    item.colors.find((obj) => obj.color === item.selectedColor)?.displayName ||
    '';
  item.displaySize =
    item.sizes.find((obj) => obj.size === item.selectedSize)?.displayName || '';

  return { ...state, cart: [...state.cart, item] };
};

const deleteCartItem = (state: CartState, action: DeleteCartItemAction) => ({
  ...state,
  cart: state.cart.filter((cartItem) => cartItem._id !== action.payload._id),
});

const deleteAllCartItem = (
  state: CartState,
  _action: DeleteAllCartItemsAction,
) => ({
  ...state,
  cart: [],
});

const selectItemColor = (state: CartState, action: SelectItemColorAction) => {
  const item = action.payload;

  const index = state.cart.findIndex((obj) => obj._id == item._id);
  const newArray = [...state.cart];
  newArray[index] = {
    ...newArray[index],
    selectedColor: action.newColor,
    displayColor:
      item.colors.find((obj) => obj.color === action.newColor)?.displayName ||
      '',
  };

  return { ...state, cart: newArray };
};

const selectItemSize = (state: CartState, action: SelectItemSizeAction) => {
  const item = action.payload;
  const indexRefSize = state.cart.findIndex((obj) => obj._id == item._id);
  const newArrayRefSize = [...state.cart];
  newArrayRefSize[indexRefSize] = {
    ...newArrayRefSize[indexRefSize],
    selectedSize: action.newSize,
    displaySize:
      item.sizes.find((obj) => obj.size === action.newSize)?.displayName || '',
  };
  return { ...state, cart: newArrayRefSize };
};

const increaseItemQuantity = (
  state: CartState,
  action: IncreaseItemQuantityAction,
) => {
  const item = action.payload;
  const indexRefIQ = state.cart.findIndex((obj) => obj._id == item._id);
  const newArrayRefIQ = [...state.cart];
  newArrayRefIQ[indexRefIQ] = {
    ...newArrayRefIQ[indexRefIQ],
    quantity: item.quantity + 1,
    price: item.price + (item.increaseValue || 0),
  };
  return { ...state, cart: newArrayRefIQ };
};

const decreaseItemQuantity = (
  state: CartState,
  action: DecreaseItemQuantityAction,
) => {
  const item = action.payload;
  const indexRefDQ = state.cart.findIndex((obj) => obj._id == item._id);
  const newArrayRefDQ = [...state.cart];
  newArrayRefDQ[indexRefDQ] = {
    ...newArrayRefDQ[indexRefDQ],
    quantity: item.quantity - 1,
    price: item.price - (item.increaseValue || 0),
  };
  return { ...state, cart: newArrayRefDQ };
};

function cartReducer(state: CartState = initialState, action: CartAction) {
  switch (action.type) {
    case ADD_TO_CART: {
      return addToCart(state, action);
    }

    case DELETE_CART_ITEM: {
      return deleteCartItem(state, action);
    }

    case DELETE_ALL_CARTITEM: {
      return deleteAllCartItem(state, action);
    }

    case SELECT_ITEM_COLOR: {
      return selectItemColor(state, action);
    }
    case SELECT_ITEM_SIZE: {
      return selectItemSize(state, action);
    }

    case INCREASE_ITEM_QUANTITY: {
      return increaseItemQuantity(state, action);
    }

    case DECREASE_ITEM_QUANTITY: {
      return decreaseItemQuantity(state, action);
    }
    case RESET_STATES:
      return initialState;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  cartReducer,
});

export default rootReducer;
