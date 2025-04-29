export type ProductRating = {
  productId: string;
  rating: number;
};

// export type Order = {
//   orderId: string;
//   items: Array<{
//     productId: string;
//     quantity: number;
//   }>;
//   totalAmount: number;
//   status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
//   createdAt: string; // or Date
// };

export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string; // or Date
};

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  profileUrl?: string;
  verified: boolean;
  verificationToken?: string;
  deviceToken?: string;
  likedProducts: string[];
  ratedProducts: Array<{
    productId: string;
    rating: number;
  }>;
  addresses: Array<
    Partial<{
      street: string;
      city: string;
      landmark: string;
      postalCode: string;
      houseAddress: string;
      mobileNo: number;
    }>
  >;
  notifications: Array<
    Partial<{
      header: string;
      message: string;
      sender: string;
      seen: boolean;
      timestamp: Date | string;
    }>
  >;
  orders: string[];
  createdAt: string;
};

// Define the main order type
export interface Order {
  _id: string;
  user: string; // The user ID (string, since it's ObjectId in the backend)
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
    color?: string;
    size?: string;
    gender?: string[];
  }>;
  totalPrice: number;
  shippingAddress: {
    mobileNo: number;
    houseAddress: string;
    street: string;
    city: string;
    postalCode: string;
    landmark?: string;
  };
  paymentMethod: string;
  shippingPrice?: number;
  status: string; // Status of the order (e.g., 'Pending', 'Completed')
  statusForAdmin: {
    delivered: boolean;
    terminated: boolean;
    deliveredBy: string | null; // The ID of the user who delivered, as a string
    terminatedBy: string | null; // The ID of the user who terminated, as a string
  };
  createdAt: string; // ISO string for the order creation time
}
