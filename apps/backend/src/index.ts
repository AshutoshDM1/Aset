/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { clerkMiddleware } from '@clerk/express';
import express from 'express';
import cors from 'cors';
import { appRouter } from './appRouter';
import { createContext } from './context';
import { clerkWebhookHandler } from './webhooks/clerk';
import { optixUpdateFileHandler } from './webhooks/optix';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);

app.post(
  '/webhooks/clerk',
  express.raw({ type: 'application/json' }),
  clerkWebhookHandler,
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Secure internal route for Optix image compression updates
app.post('/api/optix/update-file', optixUpdateFileHandler);

app.get('/', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', message: 'Welcome to the Aset API' });
});

app.use(
  '/trpc',
  clerkMiddleware(),
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC Error] on path "${path}":`, error);
    },
  }),
);

// Global express error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('[Express Global Error]:', err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port http://0.0.0.0:${PORT}`);
});
