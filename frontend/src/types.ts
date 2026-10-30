export const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const;
export type OrderStatus = (typeof STATUSES)[number];

export interface Order {
  id: number;
  customerName: string;
  product: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface NewOrder {
  customerName: string;
  product: string;
  quantity: number;
}
