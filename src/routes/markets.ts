/**
 * FlowPay Market Data Routes
 * x402-protected endpoints for Polymarket market data
 */

import { Router } from 'express';
import { PolymarketClient } from '../polymarket-client.js';

export function createMarketRoutes(client: PolymarketClient): Router {
  const router = Router();

  /**
   * GET /markets
   * Get active markets from Polymarket
   */
  router.get('/markets', async (req, res) => {
    try {
      const { active, closed, archived, limit } = req.query;

      const params = {
        active: active === 'true',
        closed: closed === 'true',
        archived: archived === 'false',
        limit: limit ? parseInt(limit as string) : 50,
      };

      const markets = await client.getMarkets(params);

      res.json({
        success: true,
        count: markets.length,
        markets,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch markets',
      });
    }
  });

  /**
   * GET /markets/:tokenId/orderbook
   * Get order book data for a specific token
   */
  router.get('/markets/:tokenId/orderbook', async (req, res) => {
    try {
      const { tokenId } = req.params;

      if (!tokenId) {
        return res.status(400).json({
          success: false,
          error: 'Token ID is required',
        });
      }

      const marketData = await client.getOrderBook(tokenId);

      res.json({
        success: true,
        data: marketData,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch order book',
      });
    }
  });

  /**
   * GET /markets/:tokenId/quote
   * Get best bid/ask quote for a token (simplified)
   */
  router.get('/markets/:tokenId/quote', async (req, res) => {
    try {
      const { tokenId } = req.params;

      if (!tokenId) {
        return res.status(400).json({
          success: false,
          error: 'Token ID is required',
        });
      }

      const marketData = await client.getOrderBook(tokenId);

      res.json({
        success: true,
        quote: {
          tokenId,
          bestBid: marketData.bestBid,
          bestAsk: marketData.bestAsk,
          spread: marketData.spread,
          spreadPercentage: ((marketData.spread / marketData.bestBid) * 100).toFixed(3),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch quote',
      });
    }
  });

  return router;
}
