import { GetAllOrdersResponse } from './api';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AppStackParamList = {
  mainScreens: undefined;
  orderScreenForAdmin: undefined;
  verify: undefined;
  register: undefined;
  login: undefined;
  MyOrders: undefined;
  userPage: undefined;
  productDisplay: {
    item: any;
    productId?: string;
    title: string;
    price: number;
    discountPrice: number;
    isDealActive: boolean;
    image: string;
    material: string;
    condition: string;
    brand: string;
    colors: string;
    sizes: string;
    description: string;
    averageRating: string;
    userLiked?: boolean;
  };
  orderDisplay: {
    item: GetAllOrdersResponse[number];
    userId: string;
  };
  checkoutPage: any;
  categories: {
    endpoint: string;
    name: string;
  };
  paystackCheckout: any;
  specials: any;
  myOrderDetail: { item: any };
  addProduct: undefined;
};
