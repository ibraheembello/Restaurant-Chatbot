# 🍽️ Restaurant Chatbot

A conversational chatbot for restaurant ordering with Paystack payment integration. Built with Node.js, Express, TypeScript, and MongoDB.

![Restaurant Chatbot](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## 📋 Features

- **Conversational Interface**: Chat-based ordering system
- **Session Management**: Device-based sessions (no authentication required)
- **Menu Display**: Categorized menu with item selection
- **Order Management**: Add items, view cart, checkout, cancel orders
- **Order History**: View all past orders
- **Payment Integration**: Paystack payment gateway
- **Order Scheduling**: Optional ability to schedule orders for later
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Automatic dark mode support

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Paystack account (for payment integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ibraheembello/restaurant-chatbot.git
   cd restaurant-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/restaurant-chatbot
   SESSION_SECRET=your-super-secret-session-key
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   BASE_URL=http://localhost:3000
   ```

4. **Seed the menu**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
restaurant-chatbot/
├── src/
│   ├── config/
│   │   ├── database.ts       # MongoDB connection
│   │   ├── session.ts        # Session configuration
│   │   └── paystack.ts       # Paystack API integration
│   ├── models/
│   │   ├── MenuItem.ts       # Menu item model
│   │   ├── Order.ts          # Order model
│   │   ├── UserSession.ts    # User session model
│   │   └── index.ts
│   ├── services/
│   │   ├── chatbot.service.ts  # Core chatbot logic
│   │   ├── menu.service.ts     # Menu operations
│   │   ├── order.service.ts    # Order management
│   │   ├── payment.service.ts  # Payment processing
│   │   └── index.ts
│   ├── controllers/
│   │   ├── chat.controller.ts    # Chat endpoints
│   │   ├── payment.controller.ts # Payment endpoints
│   │   └── index.ts
│   ├── routes/
│   │   ├── chat.routes.ts      # Chat routes
│   │   ├── payment.routes.ts   # Payment routes
│   │   └── index.ts
│   ├── middleware/
│   │   ├── session.middleware.ts    # Session handling
│   │   ├── validation.middleware.ts # Input validation
│   │   └── index.ts
│   ├── utils/
│   │   ├── constants.ts      # Bot messages & constants
│   │   └── helpers.ts        # Helper functions
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── public/
│   │   ├── index.html        # Chat interface
│   │   ├── styles.css        # Styling
│   │   └── script.js         # Frontend logic
│   ├── seed/
│   │   └── menu.seed.ts      # Menu seeder
│   └── app.ts                # Express app entry
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run seed` | Seed menu items to database |

## 📱 How to Use

### Chatbot Commands

| Command | Action |
|---------|--------|
| `1` | View menu and place an order |
| `99` | Checkout current order |
| `98` | View order history |
| `97` | View current cart |
| `0` | Cancel current order |

### Ordering Flow

1. Enter `1` to view the menu
2. Enter item number (e.g., `1` for Jollof Rice) to add to cart
3. Continue adding items or enter `97` to view cart
4. Enter `99` to checkout
5. Choose to schedule or order now
6. Click "Pay Now" to complete payment

## 🔌 API Endpoints

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/init` | Initialize chat session |
| POST | `/api/chat/message` | Send message to chatbot |
| GET | `/api/chat/session` | Get current session state |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/initialize` | Initialize Paystack payment |
| GET | `/api/payment/callback` | Paystack callback handler |
| GET | `/api/payment/verify/:reference` | Verify payment status |
| GET | `/api/payment/public-key` | Get Paystack public key |

## 📝 API Examples

### Initialize Chat
```bash
curl http://localhost:3000/api/chat/init
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-here",
    "message": "Welcome to Delicious Bites Restaurant! 🍽️\n\nI'm here to help you place your order..."
  }
}
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "1"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Here's our menu...",
    "showPayButton": false
  }
}
```

### Initialize Payment
```bash
curl -X POST http://localhost:3000/api/payment/initialize \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Payment initialized...",
    "paymentUrl": "https://checkout.paystack.com/xxxxx"
  }
}
```

## 🧪 Testing

### Manual Testing Steps

1. **Test Menu Display**
   - Open the app
   - Send `1` to view menu
   - Verify all items display correctly

2. **Test Adding Items**
   - Send item number (e.g., `1`)
   - Verify item is added to cart
   - Send `97` to verify cart contents

3. **Test Checkout**
   - Add items to cart
   - Send `99` to checkout
   - Verify order total is correct

4. **Test Payment (Paystack Test Mode)**
   - Complete checkout
   - Click "Pay Now"
   - Use test card: `4084 0841 1115 0811`
   - Expiry: Any future date
   - CVV: `408`
   - OTP: `123456`

5. **Test Order History**
   - After payment, send `98`
   - Verify completed order appears

6. **Test Cancel Order**
   - Add items to cart
   - Send `0` to cancel
   - Verify cart is empty

## 🚀 Deployment

### Deployment to Railway

1. **Create Railway Account**
   - Sign up at [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add MongoDB**
   - Click "New" → "Database" → "Add MongoDB"
   - Copy the connection string

4. **Configure Environment Variables**
   ```
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=<railway-mongodb-url>
   SESSION_SECRET=<generate-secure-secret>
   PAYSTACK_SECRET_KEY=sk_live_xxxxx
   PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
   BASE_URL=https://your-app.railway.app
   ```

5. **Deploy**
   - Railway will auto-deploy on push to main branch

### Deployment to Render

1. **Create Render Account**
   - Sign up at [render.com](https://render.com)

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect GitHub repository

3. **Configure**
   - Build Command: `npm install && npm run build && npm run seed`
   - Start Command: `npm start`

4. **Add Environment Variables**
   - Same as Railway configuration

5. **Create MongoDB (Atlas)**
   - Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Get connection string
   - Add to MONGODB_URI

## 🔐 Security Notes

- Session secrets should be at least 32 characters
- Never commit `.env` file to version control
- Use HTTPS in production
- Paystack webhook signature verification (recommended for production)

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ using Node.js, Express, TypeScript, and MongoDB
