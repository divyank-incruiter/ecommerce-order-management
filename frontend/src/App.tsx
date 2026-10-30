import { useCallback, useEffect, useState } from 'react';
import { fetchOrders, createOrder, updateOrderStatus, fetchCatalogue } from './api';
import { STATUSES } from './types';
import type { Order, OrderStatus } from './types';
import './App.css';

const FILTERS = ['All', ...STATUSES] as const;

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<string>('All');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Single source of truth for the table: always re-read from the API.
  const loadOrders = useCallback(async (status: string) => {
    setLoading(true);
    try {
      setOrders(await fetchOrders(status));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders(filter);
  }, [filter, loadOrders]);

  useEffect(() => {
    fetchCatalogue()
      .then((c) => {
        setProducts(c.products);
        setProduct(Object.keys(c.products)[0] ?? '');
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // quantity is sent as a number; totalAmount is deliberately never sent.
      const created = await createOrder({ customerName, product, quantity: Number(quantity) });
      setSuccess(`Order #${created.id} created - total calculated by server: ${inr(created.totalAmount)}`);
      setCustomerName('');
      setQuantity('1');
      await loadOrders(filter); // refresh after a successful mutation
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(order: Order, next: OrderStatus) {
    setUpdatingId(order.id);
    setError(null);
    setSuccess(null);
    try {
      await updateOrderStatus(order.id, next);
      setSuccess(`Order #${order.id}: ${order.status} -> ${next}`);
      await loadOrders(filter);
    } catch (err) {
      // The select stays bound to the server's status, so a rejected transition
      // leaves the row showing the real, unchanged status.
      setError(`Order #${order.id}: ${(err as Error).message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Order Management</h1>
        <p>Internal operations dashboard</p>
      </header>

      {error && <div className="banner banner-error" role="alert">{error}</div>}
      {success && <div className="banner banner-success" role="status">{success}</div>}

      <section className="card">
        <h2>Create Order</h2>
        <form className="form" onSubmit={handleCreate}>
          <label>
            Customer Name
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Aarav Mehta"
            />
          </label>
          <label>
            Product
            <select value={product} onChange={(e) => setProduct(e.target.value)}>
              {Object.entries(products).map(([name, price]) => (
                <option key={name} value={name}>{name} ({inr(price)})</option>
              ))}
            </select>
          </label>
          <label>
            Quantity
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Order'}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="toolbar">
          <h2>Orders</h2>
          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`chip ${filter === f ? 'chip-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="muted">No orders{filter !== 'All' ? ` with status "${filter}"` : ''}.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Product</th>
                <th className="num">Qty</th><th className="num">Total</th>
                <th>Status</th><th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{o.product}</td>
                  <td className="num">{o.quantity}</td>
                  <td className="num">{inr(o.totalAmount)}</td>
                  <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o, e.target.value as OrderStatus)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function inr(amount: number) {
  return `Rs ${amount.toLocaleString('en-IN')}`;
}
