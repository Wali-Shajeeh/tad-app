/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { AppDispatch } from './store';

export const addToCart = (product: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: ADD_TO_CART,
    payload: product,
  });
};

export const deleteCartItem = (product: any) => (dispatch: AppDispatch) => {
  dispatch({
    type: DELETE_CART_ITEM,
    payload: product,
  });
};
export const deleteAllCartItem = () => (dispatch: AppDispatch) => {
  dispatch({
    type: DELETE_ALL_CARTITEM,
  });
};

export const increaseItemQuantity =
  (product: any) => (dispatch: AppDispatch) => {
    dispatch({
      type: INCREASE_ITEM_QUANTITY,
      payload: product,
    });
  };

export const decreaseItemQuantity =
  (product: any) => (dispatch: AppDispatch) => {
    dispatch({
      type: DECREASE_ITEM_QUANTITY,
      payload: product,
    });
  };

export const selectItemSize =
  (product: any, size: any) => (dispatch: AppDispatch) => {
    dispatch({
      type: SELECT_ITEM_SIZE,
      payload: product,
      newSize: size,
    });
  };

export const selectItemColor =
  (product: any, color: any) => (dispatch: AppDispatch) => {
    dispatch({
      type: SELECT_ITEM_COLOR,
      payload: product,
      newColor: color,
    });
  };

export const resetStates = () => (dispatch: AppDispatch) => {
  dispatch({
    type: RESET_STATES,
  });
};
