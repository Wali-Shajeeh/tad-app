import { Order, User } from './schema';

export type GetAllOrdersResponse = Array<
  Omit<Order, 'user'> & {
    user: User;
  }
>;

export type ConfirmOrderBody = {
  orderId: string;
  adminId: string;
  userId: string;
  confirmed: boolean;
};


export type ConfirmOrderResponse = {
  message: string;
}

export type LoginBody = { 
  email: string;
  password: string;
};

export type LoginResponse = {
  success: false;
  message: string;
} | {
  success: true;
  token: string;
}

export type RefreshTokenBody = {
  deviceToken: string;
  userId: string;
}

export type RefreshTokenResponse = {
  success: boolean;
}