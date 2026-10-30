// Business rules: validation, server-side pricing, status-transition policy.
import { PRODUCTS, STATUSES, findAll, findById, insert, updateStatus } from '../data/store.js';

// A thrown ApiError carries the HTTP status the route handler should return.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Single source of truth for the order lifecycle.
// Delivered and Cancelled are terminal — no transition out of them.
const ALLOWED_TRANSITIONS = {
  Pending:   ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped:   ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

export function listOrders(status) {
  if (status && !STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status filter '${status}'. Allowed: ${STATUSES.join(', ')}`);
  }
  return findAll(status);
}

export function createOrder({ customerName, product, quantity }) {
  if (typeof customerName !== 'string' || customerName.trim().length < 2) {
    throw new ApiError(400, 'customerName is required and must be at least 2 characters');
  }
  if (!Object.prototype.hasOwnProperty.call(PRODUCTS, product)) {
    throw new ApiError(400, `product must be one of: ${Object.keys(PRODUCTS).join(', ')}`);
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
    throw new ApiError(400, 'quantity must be an integer between 1 and 100');
  }

  // Price comes from the server catalogue — any totalAmount in the request body is ignored.
  return insert({
    customerName: customerName.trim(),
    product,
    quantity: qty,
    totalAmount: PRODUCTS[product] * qty,
    status: 'Pending',
  });
}

export function changeOrderStatus(id, nextStatus) {
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) throw new ApiError(400, 'Order id must be numeric');

  if (!STATUSES.includes(nextStatus)) {
    throw new ApiError(400, `Invalid status '${nextStatus}'. Allowed: ${STATUSES.join(', ')}`);
  }

  const order = findById(orderId);
  if (!order) throw new ApiError(404, `Order ${orderId} not found`);

  if (order.status === nextStatus) {
    throw new ApiError(400, `Order ${orderId} is already ${nextStatus}`);
  }
  if (!ALLOWED_TRANSITIONS[order.status].includes(nextStatus)) {
    // Rejected before any mutation, so the stored order is left untouched.
    throw new ApiError(400, `Cannot change status from ${order.status} to ${nextStatus}`);
  }

  return updateStatus(orderId, nextStatus);
}

export function getCatalogue() {
  return { products: PRODUCTS, statuses: STATUSES };
}
