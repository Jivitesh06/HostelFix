const express = require('express');
const cors = require('cors');
const config = require('./config/env'); // validates env on startup
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { startSlaCron } = require('./services/sla.service');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  config.clientUrl,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check configured origins or Vercel preview/production deployments
      const isAllowed =
        config.clientUrl === '*' ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        config.nodeEnv !== 'production';

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to permissive origin in production
    },
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logging (development) ─────────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  // Safe one-time demo accounts seeding when explicitly enabled
  if (process.env.SEED_DEMO_ACCOUNTS === 'true') {
    console.log('[Server] SEED_DEMO_ACCOUNTS=true detected. Provisioning demo accounts...');
    try {
      const { seedDemoAccounts } = require('../scripts/seed-demo-accounts');
      await seedDemoAccounts();
      console.log('[Server] Demo accounts provisioning completed successfully.');
    } catch (err) {
      console.error('[Server] Error provisioning demo accounts on startup:', err.message);
    }
  }

  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(config.port, HOST, () => {
    console.log(`[Server] HostelFix API running on http://${HOST}:${config.port}`);
    console.log(`[Server] Environment: ${config.nodeEnv}`);
    console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);

    // Start SLA escalation cron (every 5 minutes)
    startSlaCron();
  });
};

startServer();

module.exports = app;
