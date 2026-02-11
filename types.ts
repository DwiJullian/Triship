
export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating?: number;
  comment: string;
  date: string;
  parentId?: string;
  isAdmin?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  salesCount: number;
  createdAt: string | number;
  isNew?: boolean;
  reviews: Review[];
  discount?: number; // Discount percentage (0-100)
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ShippingDetails {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'credit_card' | 'qris' | 'paypal';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: {
    products: CartItem[];
    customer: ShippingDetails;
    paymentMethod: PaymentMethod;
  };
  totalPrice: number;
  shippingCost: number;
  paymentFee?: number;
  returnFee?: number;
  wantsReturn?: boolean;
  status: OrderStatus;
  createdAt: string;
}

// Fix: Added CarouselItem interface to resolve the "Module '"./types"' has no exported member 'CarouselItem'" error in constants.ts
export interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}
