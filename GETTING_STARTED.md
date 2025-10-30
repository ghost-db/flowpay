# Getting Started with PulsePay

This guide will walk you through setting up and running PulsePay, the x402 payment gateway for Polymarket.

## What is PulsePay?

PulsePay enables AI agents to interact with Polymarket prediction markets through a pay-per-action API. Instead of subscriptions or API keys, agents pay tiny amounts (0.5¢ to 5¢) for each action using the x402 protocol.

## Prerequisites

### Required
- Node.js v20 or higher
- pnpm package manager (`npm install -g pnpm`)
- Polymarket account with a private key
- Ethereum/Polygon wallet for receiving payments

### Optional but Recommended
- USDC on testnet (for testing payments)
- Familiarity with x402 protocol basics

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pulsepay.git
cd pulsepay
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including:
- `@polymarket/clob-client` - Polymarket trading client
- `x402-express` - x402 payment middleware
- `@coinbase/x402` - Coinbase facilitator integration
- `express`, `ethers`, and other supporting libraries

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```bash
# Your address for receiving x402 payments (required)
PAYMENT_ADDRESS=0xYourEthereumAddress

# Your Polymarket trading private key (required)
POLYMARKET_PRIVATE_KEY=0xYourPolymarketPrivateKey

# Blockchain network for payments (default: polygon)
NETWORK=polygon

# Polymarket CLOB endpoint (default: https://clob.polymarket.com)
POLYMARKET_HOST=https://clob.polymarket.com

# Chain ID (137 for Polygon mainnet)
CHAIN_ID=137

# Server port (default: 3000)
PORT=3000
```

**Important Security Notes:**
- Never commit `.env` to git
- Keep your `POLYMARKET_PRIVATE_KEY` secure
- Use different keys for testing and production

### 4. Run the Server

Development mode (with hot reload):

```bash
pnpm dev
```

You should see:

```
╔══════════════════════════════════════════════════════════╗
║                      PulsePay v1.0                       ║
║     x402 Payment Gateway for Polymarket AI Trading       ║
╚══════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:3000
💰 Payment address: 0x...
🌐 Network: polygon
📊 Polymarket: https://clob.polymarket.com
⚡ Protocol: x402

Ready for AI agents! 🤖
```

### 5. Test the API

First, test the free endpoints:

```bash
# API info
curl http://localhost:3000/

# Health check
curl http://localhost:3000/health
```

For protected endpoints, you'll need to make x402 payments. See the examples below.

## Making x402 Payments

To call protected endpoints, you need an x402-compatible client. Here's how to set one up:

### Option 1: Using x402-axios Client

Create a simple client script:

```typescript
// client.ts
import axios from 'axios';
import { x402Axios } from 'x402-axios';
import { ethers } from 'ethers';

// Your funded wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);

// Create x402-enabled axios instance
const client = x402Axios(axios.create(), wallet);

// Call protected endpoint
async function getMarketQuote(tokenId: string) {
  const response = await client.get(
    `http://localhost:3000/markets/${tokenId}/quote`
  );
  console.log(response.data);
}

// Example token ID (ETH $10k market)
getMarketQuote('99476570761000577440024940590256958973314519370649204423022376036320363399376');
```

### Option 2: Using x402-fetch Client

```typescript
import { x402Fetch } from 'x402-fetch';
import { ethers } from 'ethers';

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
const fetch = x402Fetch(wallet);

const response = await fetch('http://localhost:3000/markets/TOKEN_ID/quote');
const data = await response.json();
console.log(data);
```

## Example Use Cases

### 1. Get Active Markets

```bash
# With x402 payment ($0.01)
curl -H "X-PAYMENT: <payment-header>" \
  http://localhost:3000/markets?active=true&limit=10
```

Response:
```json
{
  "success": true,
  "count": 10,
  "markets": [
    {
      "question": "Will Bitcoin hit $100k in 2025?",
      "tokens": [...],
      "condition_id": "0x..."
    }
  ]
}
```

### 2. Get Order Book

```bash
curl -H "X-PAYMENT: <payment-header>" \
  http://localhost:3000/markets/99476570.../orderbook
```

Response:
```json
{
  "success": true,
  "data": {
    "tokenId": "99476570...",
    "bestBid": 0.973,
    "bestAsk": 0.975,
    "spread": 0.002,
    "bids": [...],
    "asks": [...]
  }
}
```

### 3. Place an Order

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <payment-header>" \
  -d '{
    "tokenId": "99476570...",
    "price": 0.97,
    "size": 10,
    "side": "BUY"
  }' \
  http://localhost:3000/orders
```

## AI Agent Integration Example

Here's a complete example of an AI agent using PulsePay:

```python
# ai_agent.py
import requests
from x402_python import X402Client

class PolymarketAgent:
    def __init__(self, private_key, pulsepay_url):
        self.client = X402Client(private_key)
        self.base_url = pulsepay_url

    def analyze_market(self, token_id):
        # Get quote (pays $0.005)
        quote = self.client.get(f"{self.base_url}/markets/{token_id}/quote")

        spread = quote['quote']['spread']
        best_bid = quote['quote']['bestBid']

        # Decision logic
        if spread > 0.01:  # Spread > 1%
            return "wide_spread", best_bid
        elif best_bid < 0.5:
            return "undervalued", best_bid
        return "hold", None

    def trade(self, token_id, expected_fair_value):
        action, price = self.analyze_market(token_id)

        if action == "undervalued":
            # Place buy order (pays $0.05)
            order = self.client.post(
                f"{self.base_url}/orders",
                json={
                    "tokenId": token_id,
                    "price": price + 0.001,
                    "size": 50,
                    "side": "BUY"
                }
            )
            print(f"Placed order: {order}")

# Usage
agent = PolymarketAgent(
    private_key="0x...",
    pulsepay_url="http://localhost:3000"
)

agent.trade("99476570...", expected_fair_value=0.3)
```

## Production Deployment

### Docker

Build and run with Docker:

```bash
docker build -t pulsepay .
docker run -p 3000:3000 --env-file .env pulsepay
```

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up

# Set environment variables in Railway dashboard
```

### Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch
fly launch

# Set secrets
fly secrets set PAYMENT_ADDRESS=0x...
fly secrets set POLYMARKET_PRIVATE_KEY=0x...
```

## Monitoring and Debugging

### Check Server Logs

```bash
# In development
pnpm dev

# Watch for:
# ✓ Polymarket client initialized
# Payment verified for address 0x...
# Order placed successfully
```

### Common Issues

**Issue**: "Failed to initialize Polymarket client"
- Check `POLYMARKET_PRIVATE_KEY` is valid
- Ensure network connection to Polymarket CLOB

**Issue**: "Payment verification failed"
- Verify client wallet has sufficient USDC
- Check `PAYMENT_ADDRESS` is correct
- Ensure `NETWORK` matches client network

**Issue**: "Order creation failed"
- Verify Polymarket account has USDC balance
- Check token ID is valid
- Ensure price is between 0 and 1

**Issue**: "Module not found" errors
- Run `pnpm install` to ensure all dependencies are installed
- Check that Node.js version is >= 20

## Next Steps

1. **Test with Testnet**: Use `base-sepolia` network for testing
2. **Add Custom Logic**: Extend routes with your own market analysis
3. **Scale**: Deploy to production and monitor usage
4. **Monetize**: Share your API with AI agent developers

## Resources

- [x402 Protocol Docs](https://x402.org)
- [Polymarket API Docs](https://docs.polymarket.com)
- [x402 Ecosystem](https://x402.org/ecosystem)
- [Project README](README.md)

## Support

Having issues? Open an issue on the [GitHub repository](https://github.com/yourusername/pulsepay/issues).

---

Happy building! 🚀
