/**
 * FlowPay Polymarket Client
 * Wrapper around @polymarket/clob-client for x402 integration
 */

import { ClobClient } from '@polymarket/clob-client';
import { ethers } from 'ethers';

export interface MarketData {
  tokenId: string;
  bestBid: number;
  bestAsk: number;
  spread: number;
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
}

export interface Balance {
  balanceUSD: number;
  allowanceUSD: number;
}

export interface TokenBalance {
  tokenId: string;
  balanceUSD: number;
  allowanceUSD: number;
}

export interface OrderParams {
  tokenId: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
}

export interface OrderResponse {
  orderId: string;
  success: boolean;
  message?: string;
}

export class PolymarketClient {
  private client: ClobClient;
  private initialized: boolean = false;

  constructor(
    private host: string,
    private privateKey: string,
    private chainId: number = 137 // Polygon mainnet
  ) {
    // Initialize client with private key
    const wallet = new ethers.Wallet(privateKey);

    this.client = new ClobClient(
      host,
      chainId,
      wallet,
      undefined // Will derive API key
    );
  }

  /**
   * Initialize the client with API credentials
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Derive API credentials from private key
      await this.client.deriveApiKey();
      this.initialized = true;
      console.log('✓ Polymarket client initialized');
    } catch (error) {
      console.error('Failed to initialize Polymarket client:', error);
      throw new Error('Failed to initialize Polymarket client');
    }
  }

  /**
   * Ensure client is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get collateral balance (USDC)
   */
  async getBalance(): Promise<Balance> {
    await this.ensureInitialized();

    try {
      const balance = await this.client.getBalanceAllowance('COLLATERAL');
      const allowance = await this.client.getBalanceAllowance('COLLATERAL');

      return {
        balanceUSD: parseFloat(balance.balance) / 1e6,
        allowanceUSD: parseFloat(allowance.allowance) / 1e6,
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }

  /**
   * Get token balance for a specific outcome
   */
  async getTokenBalance(tokenId: string): Promise<TokenBalance> {
    await this.ensureInitialized();

    try {
      const balance = await this.client.getBalanceAllowance('CONDITIONAL', tokenId);

      return {
        tokenId,
        balanceUSD: parseFloat(balance.balance) / 1e6,
        allowanceUSD: parseFloat(balance.allowance) / 1e6,
      };
    } catch (error) {
      console.error('Error fetching token balance:', error);
      throw new Error('Failed to fetch token balance');
    }
  }

  /**
   * Get order book data for a token
   */
  async getOrderBook(tokenId: string): Promise<MarketData> {
    await this.ensureInitialized();

    try {
      const orderBookSummary = await this.client.getOrderBook(tokenId);

      const bids = orderBookSummary.bids.map((bid: any) => ({
        price: parseFloat(bid.price),
        size: parseFloat(bid.size),
      }));

      const asks = orderBookSummary.asks.map((ask: any) => ({
        price: parseFloat(ask.price),
        size: parseFloat(ask.size),
      }));

      const bidPrices = bids.map(b => b.price);
      const askPrices = asks.map(a => a.price);

      const bestBid = bidPrices.length > 0 ? Math.max(...bidPrices) : 0;
      const bestAsk = askPrices.length > 0 ? Math.min(...askPrices) : 0;
      const spread = bestAsk - bestBid;

      return {
        tokenId,
        bestBid,
        bestAsk,
        spread,
        bids,
        asks,
      };
    } catch (error) {
      console.error('Error fetching order book:', error);
      throw new Error('Failed to fetch order book');
    }
  }

  /**
   * Create and post an order
   */
  async createOrder(params: OrderParams): Promise<OrderResponse> {
    await this.ensureInitialized();

    try {
      const { tokenId, price, size, side } = params;

      // Create order arguments
      const orderArgs = {
        tokenID: tokenId,
        price: price.toString(),
        size: size.toString(),
        side: side === 'BUY' ? 'BUY' : 'SELL',
        feeRateBps: '0', // No fee
      };

      // Create and sign order
      const signedOrder = await this.client.createOrder(orderArgs);

      // Post order
      const response = await this.client.postOrder(signedOrder, 'GTC');

      return {
        orderId: response.orderID || 'unknown',
        success: true,
        message: 'Order placed successfully',
      };
    } catch (error: any) {
      console.error('Error creating order:', error);
      return {
        orderId: '',
        success: false,
        message: error.message || 'Failed to create order',
      };
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<{ success: boolean; message?: string }> {
    await this.ensureInitialized();

    try {
      await this.client.cancelOrder(orderId);
      return {
        success: true,
        message: 'Order cancelled successfully',
      };
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      return {
        success: false,
        message: error.message || 'Failed to cancel order',
      };
    }
  }

  /**
   * Cancel all orders for a token
   */
  async cancelAllOrders(tokenId?: string): Promise<{ success: boolean; cancelledCount: number }> {
    await this.ensureInitialized();

    try {
      const orders = await this.client.getOrders();
      const ordersToCancel = tokenId
        ? orders.filter((order: any) => order.asset_id === tokenId)
        : orders;

      let cancelledCount = 0;
      for (const order of ordersToCancel) {
        try {
          await this.client.cancelOrder(order.id);
          cancelledCount++;
        } catch (error) {
          console.error(`Failed to cancel order ${order.id}:`, error);
        }
      }

      return {
        success: true,
        cancelledCount,
      };
    } catch (error) {
      console.error('Error cancelling orders:', error);
      return {
        success: false,
        cancelledCount: 0,
      };
    }
  }

  /**
   * Get user's open orders
   */
  async getOrders(tokenId?: string): Promise<any[]> {
    await this.ensureInitialized();

    try {
      const orders = await this.client.getOrders();

      if (tokenId) {
        return orders.filter((order: any) => order.asset_id === tokenId);
      }

      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  /**
   * Get user's trade history
   */
  async getTrades(): Promise<any[]> {
    await this.ensureInitialized();

    try {
      const trades = await this.client.getTrades();
      return trades;
    } catch (error) {
      console.error('Error fetching trades:', error);
      throw new Error('Failed to fetch trades');
    }
  }

  /**
   * Get markets data from Gamma API
   */
  async getMarkets(params?: {
    active?: boolean;
    closed?: boolean;
    archived?: boolean;
    limit?: number;
  }): Promise<any[]> {
    try {
      // Fetch from Gamma API
      const queryParams = new URLSearchParams();
      if (params?.active !== undefined) queryParams.set('active', params.active.toString());
      if (params?.closed !== undefined) queryParams.set('closed', params.closed.toString());
      if (params?.archived !== undefined) queryParams.set('archived', params.archived.toString());
      if (params?.limit) queryParams.set('limit', params.limit.toString());

      const url = `https://gamma-api.polymarket.com/markets?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch markets: ${response.statusText}`);
      }

      const markets = await response.json();
      return markets;
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw new Error('Failed to fetch markets');
    }
  }
}
