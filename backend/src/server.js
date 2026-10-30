import express from 'express';
import cors from 'cors';
import ordersRouter from './routes/orders.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', ordersRouter);

// Central error handler — turns ApiError into its HTTP status, everything else into a 500.
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
