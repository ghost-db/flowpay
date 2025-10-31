/**
 * FlowPay - x402 Payment Gateway for Polymarket
 *
 * Powering the next wave of on-chain intelligence.
 *
 * FlowPay connects AI agents to real-world prediction markets,
 * allowing them to buy and sell positions automatically through
 * a single API. No accounts. No subscriptions. No friction —
 * just pay-per-action access.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { paymentMiddleware } from 'x402-express';
import { facilitator } from '@coinbase/x402';
import { PolymarketClient } from './polymarket-client.js';
import { createMarketRoutes } from './routes/markets.js';
import { createTradingRoutes } from './routes/trading.js';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3000;
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS;
const POLYMARKET_PRIVATE_KEY = process.env.POLYMARKET_PRIVATE_KEY;
const POLYMARKET_HOST = process.env.POLYMARKET_HOST || 'https://clob.polymarket.com';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '137'); // Polygon mainnet
const NETWORK = process.env.NETWORK || 'polygon';

// Validate required environment variables
if (!PAYMENT_ADDRESS) {
  throw new Error('PAYMENT_ADDRESS environment variable is required');
}

if (!POLYMARKET_PRIVATE_KEY) {
  throw new Error('POLYMARKET_PRIVATE_KEY environment variable is required');
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Polymarket client
const polymarketClient = new PolymarketClient(
  POLYMARKET_HOST,
  POLYMARKET_PRIVATE_KEY,
  CHAIN_ID
);

// Initialize Polymarket client on startup
await polymarketClient.initialize();

// Welcome endpoint (free)
app.get('/', (req, res) => {
  res.json({
    name: 'FlowPay',
    tagline: 'Powering the next wave of on-chain intelligence',
    description: 'x402 payment gateway for Polymarket AI agent trading',
    version: '1.0.0',
    endpoints: {
      markets: {
        'GET /markets': 'Get active Polymarket markets ($0.01)',
        'GET /markets/:tokenId/orderbook': 'Get order book for a token ($0.02)',
        'GET /markets/:tokenId/quote': 'Get best bid/ask quote ($0.005)',
      },
      trading: {
        'GET /balance': 'Get USDC balance ($0.01)',
        'GET /balance/:tokenId': 'Get token balance ($0.01)',
        'POST /orders': 'Create a new order ($0.05)',
        'GET /orders': 'Get open orders ($0.02)',
        'DELETE /orders/:orderId': 'Cancel specific order ($0.03)',
        'DELETE /orders': 'Cancel all orders ($0.05)',
        'GET /trades': 'Get trade history ($0.02)',
      },
    },
    docs: 'https://github.com/yourusername/flowpay',
    powered_by: 'x402 Protocol',
  });
});

// Health check endpoint (free)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    polymarket: 'connected',
  });
});

// Apply x402 payment middleware to protected routes
app.use(
  paymentMiddleware(
    PAYMENT_ADDRESS,
    {
      // Market Data Endpoints
      'GET /markets': {
        price: '$0.01',
        network: NETWORK,
        config: {
          description: 'Get active Polymarket markets',
          discoverable: true,
          mimeType: 'application/json',
          outputSchema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              count: { type: 'number' },
              markets: { type: 'array' },
            },
          },
        },
      },
      'GET /markets/*/orderbook': {
        price: '$0.02',
        network: NETWORK,
        config: {
          description: 'Get order book data for a specific token',
          discoverable: true,
          mimeType: 'application/json',
        },
      },
      'GET /markets/*/quote': {
        price: '$0.005',
        network: NETWORK,
        config: {
          description: 'Get best bid/ask quote for a token',
          discoverable: true,
          mimeType: 'application/json',
        },
      },

      // Trading Endpoints
      'GET /balance': {
        price: '$0.01',
        network: NETWORK,
        config: {
          description: 'Get USDC balance and allowance',
          discoverable: true,
          mimeType: 'application/json',
        },
      },
      'GET /balance/*': {
        price: '$0.01',
        network: NETWORK,
        config: {
          description: 'Get token balance for a specific outcome',
          discoverable: true,
          mimeType: 'application/json',
        },
      },
      'POST /orders': {
        price: '$0.05',
        network: NETWORK,
        config: {
          description: 'Create a new order (buy or sell)',
          discoverable: true,
          mimeType: 'application/json',
        },
      },
      'GET /orders': {
        price: '$0.02',
        network: NETWORK,
        config: {
          description: 'Get open orders',
          discoverable: true,
          mimeType: 'application/json',
        },
      },
      'DELETE /orders/*': {
        price: '$0.03',
        network: NETWORK,
        config: {
          description: 'Cancel a specific order',
          discoverable: true,
          mimeType: 'application/json',
        },
      },
      'DELETE /orders': {
        price: '$0.05',
        network: NETWORK,
        config: {
          description: 'Cancel all orders',
          discoverable: true,
          mimeType: 'application/json',
        },
      },
      'GET /trades': {
        price: '$0.02',
        network: NETWORK,
        config: {
          description: 'Get trade history',
          discoverable: true,
          mimeType: 'application/json',
        },
      },
    },
    facilitator
  )
);

// Register routes
app.use(createMarketRoutes(polymarketClient));
app.use(createTradingRoutes(polymarketClient));

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
║                      FlowPay v1.0                        ║
║     x402 Payment Gateway for Polymarket AI Trading       ║
╚══════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}
💰 Payment address: ${PAYMENT_ADDRESS}
🌐 Network: ${NETWORK}
📊 Polymarket: ${POLYMARKET_HOST}
⚡ Protocol: x402

Endpoints ready:
  GET  /                           - API information
  GET  /health                     - Health check
  GET  /markets                    - Active markets ($0.01)
  GET  /markets/:id/orderbook      - Order book ($0.02)
  GET  /markets/:id/quote          - Quote ($0.005)
  GET  /balance                    - Balance ($0.01)
  POST /orders                     - Create order ($0.05)
  GET  /orders                     - Open orders ($0.02)

Ready for AI agents! 🤖
  `);
});
