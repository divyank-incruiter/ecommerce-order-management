import type { Order, NewOrder, OrderStatus } from './types';

const BASE_URL = 'http://localhost:4000/api';

// Every response goes through here, so a non-2xx always becomes a thrown Error
// carrying the backend's own message - never a silent success.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? `Request failed with status ${res.status}`);
  }
  return body as T;
}

export function fetchOrders(status: string): Promise<Order[]> {
  const query = status === 'All' ? '' : `?status=${encodeURIComponent(status)}`;
  return request<Order[]>(`/orders${query}`);
}

export function createOrder(payload: NewOrder): Promise<Order> {
  return request<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  return request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function fetchCatalogue(): Promise<{ products: Record<string, number>; statuses: string[] }> {
  return request('/catalogue');
}
