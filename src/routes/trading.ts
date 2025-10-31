/**
 * FlowPay Trading Routes
 * x402-protected endpoints for Polymarket trading operations
 */

import { Router } from 'express';
import { PolymarketClient } from '../polymarket-client.js';

export function createTradingRoutes(client: PolymarketClient): Router {
  const router = Router();

  /**
   * GET /balance
   * Get user's USDC balance and allowance
   */
  router.get('/balance', async (req, res) => {
    try {
      const balance = await client.getBalance();

      res.json({
        success: true,
        balance,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch balance',
      });
    }
  });

  /**
   * GET /balance/:tokenId
   * Get user's token balance for a specific outcome
   */
  router.get('/balance/:tokenId', async (req, res) => {
    try {
      const { tokenId } = req.params;

      if (!tokenId) {
        return res.status(400).json({
          success: false,
          error: 'Token ID is required',
        });
      }

      const tokenBalance = await client.getTokenBalance(tokenId);

      res.json({
        success: true,
        balance: tokenBalance,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch token balance',
      });
    }
  });

  /**
   * POST /orders
   * Create a new order (buy or sell)
   */
  router.post('/orders', async (req, res) => {
    try {
      const { tokenId, price, size, side } = req.body;

      // Validation
      if (!tokenId || !price || !size || !side) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: tokenId, price, size, side',
        });
      }

      if (side !== 'BUY' && side !== 'SELL') {
        return res.status(400).json({
          success: false,
          error: 'Side must be either BUY or SELL',
        });
      }

      if (price <= 0 || price >= 1) {
        return res.status(400).json({
          success: false,
          error: 'Price must be between 0 and 1',
        });
      }

      if (size <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Size must be greater than 0',
        });
      }

      const orderResponse = await client.createOrder({
        tokenId,
        price: parseFloat(price),
        size: parseFloat(size),
        side,
      });

      res.json({
        success: orderResponse.success,
        order: orderResponse,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create order',
      });
    }
  });

  /**
   * GET /orders
   * Get user's open orders
   */
  router.get('/orders', async (req, res) => {
    try {
      const { tokenId } = req.query;

      const orders = await client.getOrders(tokenId as string | undefined);

      res.json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch orders',
      });
    }
  });

  /**
   * DELETE /orders/:orderId
   * Cancel a specific order
   */
  router.delete('/orders/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required',
        });
      }

      const result = await client.cancelOrder(orderId);

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to cancel order',
      });
    }
  });

  /**
   * DELETE /orders
   * Cancel all orders (optionally filtered by tokenId)
   */
  router.delete('/orders', async (req, res) => {
    try {
      const { tokenId } = req.query;

      const result = await client.cancelAllOrders(tokenId as string | undefined);

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to cancel orders',
      });
    }
  });

  /**
   * GET /trades
   * Get user's trade history
   */
  router.get('/trades', async (req, res) => {
    try {
      const trades = await client.getTrades();

      res.json({
        success: true,
        count: trades.length,
        trades,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch trades',
      });
    }
  });

  return router;
}
