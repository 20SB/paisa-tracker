# 💰 Paisa Tracker

**AI-Powered Personal Finance Management for India**

Stop wondering where your money went. Paisa Tracker automatically detects expenses, categorizes them using AI, tracks investments & SIPs, and helps you understand your spending patterns.

---

## 🎯 Vision

Build a **privacy-first**, **AI-powered** personal finance OS that:
- ✅ Automatically detects money deductions (SMS parsing)
- ✅ Tracks investments & SIPs
- ✅ Detects subscriptions
- ✅ Categorizes expenses using AI (Google Gemini)
- ✅ Works mobile-first (PWA)
- ✅ Keeps your data secure and private

---

## 🚀 Features

### Phase 1: MVP (Current)
- [x] User authentication (email + password)
- [x] Manual transaction entry
- [x] AI-powered auto-categorization
- [x] Basic dashboard
- [x] Transaction list with filters
- [ ] Bank account management
- [ ] Monthly analytics

### Phase 2: Intelligence (Coming Soon)
- [ ] SMS parsing (auto-detect transactions)
- [ ] Learning from corrections
- [ ] Merchant name cleaning
- [ ] Category suggestions

### Phase 3: Advanced (Planned)
- [ ] SIP & investment tracking
- [ ] Subscription detection
- [ ] Recurring payment calendar
- [ ] Financial health score
- [ ] Goal-based budgeting
- [ ] Voice-based expense entry
- [ ] Cash wallet tracking

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Offline:** IndexedDB
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT + bcrypt
- **AI:** Google Gemini API
- **Validation:** Custom utilities

### Infrastructure
- **Hosting:** Vercel
- **Database:** MongoDB Atlas (Free Tier)
- **AI Provider:** Google Gemini

---

## 📁 Project Structure

```
paisa-tracker/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── transactions/     # Transaction management
│   │   ├── investments/      # Investment tracking
│   │   └── analytics/        # Analytics & insights
│   ├── dashboard/            # Dashboard pages
│   ├── transactions/         # Transaction pages
│   └── layout.tsx            # Root layout
│
├── components/                # React components
│   ├── ui/                   # Reusable UI components
│   ├── layouts/              # Layout components
│   ├── transactions/         # Transaction components
│   └── dashboard/            # Dashboard components
│
├── lib/                       # Core libraries (modular)
│   ├── db/                   # Database
│   │   ├── mongodb.ts        # Connection handler
│   │   └── models/           # Mongoose models
│   ├── auth/                 # Authentication
│   │   ├── jwt.ts           # JWT utilities
│   │   ├── password.ts      # Password hashing
│   │   └── middleware.ts    # Auth middleware
│   ├── ai/                   # AI services
│   │   └── gemini.ts        # Gemini integration
│   ├── modules/              # Feature modules
│   │   ├── transactions/    # Transaction logic
│   │   ├── investments/     # Investment logic
│   │   ├── subscriptions/   # Subscription detection
│   │   └── analytics/       # Analytics engine
│   ├── validations/          # Input validation
│   └── utils/                # Utility functions
│
├── public/                    # Static assets
│   └── icons/                # App icons
│
├── .env                       # Environment variables (local)
├── .env.example               # Environment template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Google Gemini API key

### 1. Clone Repository
```bash
git clone https://github.com/20SB/paisa-tracker.git
cd paisa-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
MONGODB_URI="your-mongodb-connection-string"
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `JWT_SECRET` | Secret for JWT signing | ✅ Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |
| `GEMINI_MODEL` | Gemini model name | No (default: gemini-pro) |
| `JWT_EXPIRES_IN` | Token expiry time | No (default: 7d) |

---

## 📊 Database Schema

### Collections
- **Users** - User accounts and preferences
- **Transactions** - All financial transactions
- **BankAccounts** - Linked bank accounts
- **Categories** - Transaction categories (system + custom)
- **Investments** - SIP and investment tracking
- **Subscriptions** - Recurring payments
- **Goals** - Financial goals
- **FinancialHealth** - Health score metrics

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed schema.

---

## 🧠 AI Features (Powered by Gemini)

### 1. SMS Parsing
Automatically extract transaction details from bank SMS:
```
Input: "Your A/c XXXX1234 debited with Rs.2499.00 on 28-Feb-26 
for UPI/Groww. Avl Bal: Rs.45000.50"

Output:
{
  "amount": 2499.00,
  "type": "debit",
  "merchant": "Groww",
  "date": "2026-02-28",
  "balance": 45000.50,
  "transactionType": "upi"
}
```

### 2. Auto-Categorization
AI categorizes transactions based on merchant, amount, and context:
- Food & Dining
- Transportation
- Shopping
- Bills & Utilities
- Entertainment
- Healthcare
- Investment
- And more...

### 3. Merchant Name Cleaning
Converts messy merchant names to clean, readable format:
```
"SWIGGY*FOOD ORDER" → "Swiggy"
"AMAZON PAY*BILL" → "Amazon Pay"
```

### 4. Financial Insights
AI generates personalized insights:
- Spending trends
- Savings opportunities
- Subscription optimization
- Budget recommendations

---

## 📱 API Endpoints

### Authentication
```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login
POST   /api/auth/refresh          - Refresh access token
POST   /api/auth/logout           - Logout
```

### Transactions
```
GET    /api/transactions          - List transactions
POST   /api/transactions          - Add transaction
GET    /api/transactions/:id      - Get details
PATCH  /api/transactions/:id      - Update transaction
DELETE /api/transactions/:id      - Delete transaction
POST   /api/transactions/parse-sms - Parse SMS
```

### Analytics
```
GET    /api/analytics/spending    - Spending analytics
GET    /api/analytics/monthly     - Monthly comparison
GET    /api/analytics/category    - Category breakdown
```

See full API documentation in [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🛡️ Security

- ✅ **End-to-end encryption** for sensitive data
- ✅ **JWT authentication** with short-lived tokens
- ✅ **Password hashing** using bcrypt (10 rounds)
- ✅ **Input validation** on all endpoints
- ✅ **Rate limiting** (production)
- ✅ **HTTPS only** (production)
- ✅ **Local SMS processing** (Android)
- ✅ **Privacy-first** architecture

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import `paisa-tracker` repository
- Add environment variables
- Deploy!

3. **Configure MongoDB**
- Use MongoDB Atlas free tier
- Whitelist Vercel IP addresses
- Update `MONGODB_URI` in Vercel

---

## 📈 Roadmap

### ✅ Phase 1: MVP (Week 1-2)
- Basic expense tracking
- Manual entry
- AI categorization
- Simple dashboard

### 🔄 Phase 2: Intelligence (Week 3-4)
- SMS parsing
- Auto-detection
- Learning engine
- Subscription detection

### ⏳ Phase 3: Advanced (Week 5-6)
- Investment tracking
- Financial health score
- Goal management
- Voice input

### ⏳ Phase 4: Scale (Week 7-8)
- Performance optimization
- Security hardening
- Comprehensive testing
- Production launch

---

## 🤝 Contributing

This is a personal project. Not currently accepting contributions.

---

## 📄 License

Proprietary - All rights reserved

---

## 🆘 Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/20SB/paisa-tracker/issues)

---

## 🙏 Acknowledgments

- **Google Gemini** - AI-powered features
- **MongoDB Atlas** - Database hosting
- **Vercel** - Deployment platform
- **Next.js** - Amazing framework

---

**Built with ❤️ for Indian users who want to take control of their finances.**

Stop wondering where your paisa went! 💰
