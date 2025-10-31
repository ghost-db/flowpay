/**
 * FlowPay Test Server (Without x402 Middleware)
 * For testing Polymarket integration
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PolymarketClient } from './polymarket-client.js';
import { createMarketRoutes } from './routes/markets.js';
import { createTradingRoutes } from './routes/trading.js';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3000;
const POLYMARKET_PRIVATE_KEY = process.env.POLYMARKET_PRIVATE_KEY;
const POLYMARKET_HOST = process.env.POLYMARKET_HOST || 'https://clob.polymarket.com';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '137'); // Polygon mainnet

// Validate required environment variables
if (!POLYMARKET_PRIVATE_KEY) {
  console.log('⚠️  POLYMARKET_PRIVATE_KEY not set - running in demo mode');
  console.log('   Set POLYMARKET_PRIVATE_KEY in .env to test trading features\n');
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Polymarket client (if key provided)
let polymarketClient: PolymarketClient | null = null;

if (POLYMARKET_PRIVATE_KEY) {
  polymarketClient = new PolymarketClient(
    POLYMARKET_HOST,
    POLYMARKET_PRIVATE_KEY,
    CHAIN_ID
  );

  // Initialize Polymarket client on startup
  await polymarketClient.initialize();
}

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'FlowPay TEST Server',
    version: '1.0.0-test',
    description: 'Testing Polymarket integration (x402 middleware disabled)',
    polymarket_connected: polymarketClient !== null,
    endpoints: {
      'GET /health': 'Health check',
      'GET /markets': 'Get active markets',
      'GET /markets/:tokenId/orderbook': 'Get order book',
      'GET /markets/:tokenId/quote': 'Get quote',
      'GET /balance': 'Get balance (requires POLYMARKET_PRIVATE_KEY)',
      'POST /orders': 'Create order (requires POLYMARKET_PRIVATE_KEY)',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    polymarket: polymarketClient ? 'connected' : 'disconnected',
    mode: 'test (no x402)',
  });
});

// Register routes if client is available
if (polymarketClient) {
  app.use(createMarketRoutes(polymarketClient));
  app.use(createTradingRoutes(polymarketClient));
} else {
  // Stub routes for demo mode
  app.get('/markets', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'POLYMARKET_PRIVATE_KEY not configured',
    });
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                   FlowPay TEST Server                    ║
║                (x402 Middleware Disabled)                ║
╚══════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}
📊 Polymarket: ${POLYMARKET_HOST}
${polymarketClient ? '✅ Polymarket client initialized' : '⚠️  Running in demo mode (no POLYMARKET_PRIVATE_KEY)'}

Test endpoints:
  GET  /                           - API information
  GET  /health                     - Health check
  GET  /markets                    - Active markets
  GET  /markets/:id/orderbook      - Order book
  GET  /markets/:id/quote          - Quote

Ready for testing! 🧪
  `);
});
