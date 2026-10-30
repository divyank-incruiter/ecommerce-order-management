// In-memory data layer. Nothing above this file touches the array directly.

export const PRODUCTS = {
  Laptop: 50000,
  Mouse: 1000,
  Keyboard: 2000,
};

export const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

let nextId = 1;

const orders = [
  { id: nextId++, customerName: 'Aarav Mehta',  product: 'Laptop',   quantity: 1, totalAmount: 50000, status: 'Pending',   createdAt: new Date().toISOString() },
  { id: nextId++, customerName: 'Priya Nair',   product: 'Keyboard', quantity: 2, totalAmount: 4000,  status: 'Confirmed', createdAt: new Date().toISOString() },
  { id: nextId++, customerName: 'Rohit Sharma', product: 'Mouse',    quantity: 3, totalAmount: 3000,  status: 'Delivered', createdAt: new Date().toISOString() },
];

export function findAll(status) {
  return status ? orders.filter((o) => o.status === status) : [...orders];
}

export function findById(id) {
  return orders.find((o) => o.id === id);
}

export function insert(order) {
  const record = { id: nextId++, createdAt: new Date().toISOString(), ...order };
  orders.push(record);
  return record;
}

export function updateStatus(id, status) {
  const order = findById(id);
  if (!order) return undefined;
  order.status = status;
  return order;
}
