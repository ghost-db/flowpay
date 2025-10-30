# PulsePay

**Powering the next wave of on-chain intelligence**

PulsePay connects AI agents to real-world prediction markets, allowing them to buy and sell positions automatically through a single API. No accounts. No subscriptions. No friction — just pay-per-action access.

![PulsePay](https://img.shields.io/badge/x402-enabled-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

PulsePay is an x402-enabled payment gateway that wraps Polymarket's CLOB (Central Limit Order Book) API, enabling:

🤖 **AI Agents** - Funded agents can request quotes, place orders, and monitor outcomes in real time

💹 **Developers** - Monetize data, routing logic, or strategy models by exposing them via x402-enabled endpoints

🔮 **Prediction Markets** - Unlock autonomous liquidity and efficient price discovery by letting bots trade and arbitrate freely

## Features

- **Pay-per-action**: Each API call costs $0.005-$0.05 in USDC via x402
- **No subscriptions**: AI agents pay only for what they use
- **Real-time data**: Access live market data and order books
- **Full trading**: Create orders, cancel orders, check balances
- **Chain agnostic**: Support for Polygon, Base, and other networks
- **Instant settlement**: 2-second payment confirmation

## Quick Start

### Prerequisites

- Node.js v20+
- pnpm (or npm/yarn)
- Ethereum wallet with USDC (for receiving payments)
- Polymarket account with private key (for trading operations)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pulsepay.git
cd pulsepay
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `PAYMENT_ADDRESS` - Your address for receiving x402 payments
- `POLYMARKET_PRIVATE_KEY` - Your Polymarket wallet private key
- `NETWORK` - Blockchain network (polygon, base, etc.)

4. Start the server:

```bash
pnpm dev
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Free Endpoints

- `GET /` - API information
- `GET /health` - Health check

### Market Data (x402 Protected)

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /markets` | $0.01 | Get active Polymarket markets |
| `GET /markets/:tokenId/orderbook` | $0.02 | Get order book for a token |
| `GET /markets/:tokenId/quote` | $0.005 | Get best bid/ask quote |

### Trading Operations (x402 Protected)

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /balance` | $0.01 | Get USDC balance and allowance |
| `GET /balance/:tokenId` | $0.01 | Get token balance for specific outcome |
| `POST /orders` | $0.05 | Create a new order (buy/sell) |
| `GET /orders` | $0.02 | Get open orders |
| `DELETE /orders/:orderId` | $0.03 | Cancel a specific order |
| `DELETE /orders` | $0.05 | Cancel all orders |
| `GET /trades` | $0.02 | Get trade history |

## Usage Examples

### Get Market Quote (with x402 payment)

```bash
# Using x402-enabled client
curl -H "X-PAYMENT: <base64-encoded-payment>" \
  http://localhost:3000/markets/99476570761000577440024940590256958973314519370649204423022376036320363399376/quote
```

Response:
```json
{
  "success": true,
  "quote": {
    "tokenId": "99476570...",
    "bestBid": 0.973,
    "bestAsk": 0.975,
    "spread": 0.002,
    "spreadPercentage": "0.206"
  }
}
```

### Create Order

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <base64-encoded-payment>" \
  -d '{
    "tokenId": "99476570...",
    "price": 0.97,
    "size": 10,
    "side": "BUY"
  }' \
  http://localhost:3000/orders
```

Response:
```json
{
  "success": true,
  "order": {
    "orderId": "0xabc...",
    "success": true,
    "message": "Order placed successfully"
  }
}
```

## For AI Agents

PulsePay is designed to be easily integrated into AI agent workflows:

```python
# Example: AI agent using PulsePay
import requests
from x402_client import X402Client

# Initialize x402 client with your funded wallet
client = X402Client(private_key=AGENT_PRIVATE_KEY)

# Get market quote (automatically handles x402 payment)
quote = client.get("http://pulsepay.example.com/markets/TOKEN_ID/quote")

# Decide based on quote
if quote['bestBid'] < expected_fair_value:
    # Place order (pays $0.05 automatically)
    order = client.post(
        "http://pulsepay.example.com/orders",
        json={
            "tokenId": TOKEN_ID,
            "price": quote['bestBid'] + 0.001,
            "size": 50,
            "side": "BUY"
        }
    )
```

## Architecture

```
┌─────────────┐
│  AI Agent   │
│  (Funded)   │
└──────┬──────┘
       │ x402 Payment
       │ ($0.005-0.05)
       ▼
┌─────────────────┐
│    PulsePay     │
│  (This Server)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Polymarket    │
│   CLOB API      │
└─────────────────┘
```

## Development

### Run in development mode:

```bash
pnpm dev
```

### Build for production:

```bash
pnpm build
pnpm start
```

### Lint and format:

```bash
pnpm lint
pnpm format
```

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t pulsepay .
docker run -p 3000:3000 --env-file .env pulsepay
```

### Deploy to Cloud Platforms

**Railway:**
```bash
railway up
```

**Vercel:**
```bash
vercel deploy
```

**Fly.io:**
```bash
fly launch
fly secrets set PAYMENT_ADDRESS=0x...
fly secrets set POLYMARKET_PRIVATE_KEY=0x...
```

Ensure you set environment variables in your deployment platform.

## Security

- All trading operations use your Polymarket private key stored securely in `.env`
- Payment verification handled by x402 protocol
- Payments only settle on successful API responses (status < 400)
- Never share your `POLYMARKET_PRIVATE_KEY`

## Project Structure

```
pulsepay/
├── src/
│   ├── index.ts              # Main Express server
│   ├── polymarket-client.ts  # Polymarket CLOB wrapper
│   └── routes/
│       ├── markets.ts        # Market data endpoints
│       └── trading.ts        # Trading endpoints
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
└── README.md
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [x402 Protocol](https://x402.org)
- [Polymarket Documentation](https://docs.polymarket.com)
- [x402 Ecosystem](https://x402.org/ecosystem)

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/pulsepay/issues)
- Docs: [x402 Documentation](https://x402.org/docs)

---

Built with ❤️ using the x402 Protocol
