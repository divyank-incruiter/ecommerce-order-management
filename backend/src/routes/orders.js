// Route handlers: parse the request, call the service, shape the response.
import { Router } from 'express';
import { listOrders, createOrder, changeOrderStatus, getCatalogue } from '../services/orderService.js';

const router = Router();

router.get('/catalogue', (req, res) => res.json(getCatalogue()));

router.get('/orders', (req, res, next) => {
  try {
    res.json(listOrders(req.query.status));
  } catch (err) {
    next(err);
  }
});

router.post('/orders', (req, res, next) => {
  try {
    res.status(201).json(createOrder(req.body ?? {}));
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', (req, res, next) => {
  try {
    res.json(changeOrderStatus(req.params.id, (req.body ?? {}).status));
  } catch (err) {
    next(err);
  }
});

export default router;
