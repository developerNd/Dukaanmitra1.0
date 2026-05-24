# DukanMitra — AI Employees for SMEs

> **"Your store runs itself, 24/7."**

DukanMitra deploys autonomous AI employees for small and medium businesses that handle **sales conversations, payment recovery, and inventory management** through WhatsApp — all from a single real-time dashboard.

---

## ✨ Features

### 🤖 Three Autonomous AI Agents

| Agent | Responsibilities |
|---|---|
| **Sales Agent** | Replies to customer WhatsApp queries, recommends products, generates quotations, shares payment links |
| **Recovery Agent** | Monitors unpaid invoices, sends escalating payment reminders (friendly → firm → urgent), flags high-risk customers |
| **Inventory Agent** | Tracks stock levels in real time, predicts shortages, recommends restock quantities |

### 📊 Real-Time Dashboard
- Live activity feed of all autonomous AI actions
- WhatsApp conversation inspector with draft approval workflow
- Recovery ledger with aging buckets (overdue, due tomorrow, paid)
- Inventory stock pulse with demand predictions
- 5-second auto-polling — dashboard stays live without manual refresh

### 🔐 Authentication & Security
- Email + password registration and login
- PBKDF2 (SHA-512) password hashing via Node's native `crypto` — zero external auth dependencies
- Database-backed sessions stored in SQLite (no JWT required)
- HTTP-only cookie session tokens with 7-day expiry
- Route protection middleware — unauthenticated users are redirected to `/login`
- Role-based accounts: **Owner** and **Manager**

### 💬 Chat Inspector & AI Orchestration
- Open any WhatsApp thread and inspect the full conversation history
- **Owner Mode** — manually take over a chat or approve/reject AI draft responses
- **Simulate Customer Mode** — type as the customer; the AI Orchestrator auto-routes the message to the correct agent (Sales or Recovery) and generates a contextual draft reply
- AI Orchestrator supports a **local rule-based engine** as default, with optional **Gemini API** fallback when `GEMINI_API_KEY` is set

### 🎭 Hackathon Demo Player
- Built-in 8-step demo script that mutates database state in sequence
- Simulates a complete order lifecycle: customer inquiry → quotation → invoice → overdue → recovery reminder → inventory alert → restock suggestion

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, Material Symbols, custom HSL design tokens |
| **Database** | SQLite via Prisma ORM 6 |
| **Auth** | Custom database-backed sessions (Node `crypto` PBKDF2) |
| **AI Layer** | Rule-based orchestrator + optional Gemini API |
| **Runtime** | Node.js (Edge-compatible middleware via `proxy.ts`) |

---

## 📁 Project Structure

```
dukaanmitra/
├── prisma/
│   ├── schema.prisma        # DB models: User, Session, Product, Invoice, Conversation, Message, FeedItem
│   └── seed.js              # Seeds database with demo store data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # login, logout, register, me
│   │   │   ├── ai/          # command, approve-draft
│   │   │   ├── conversations/
│   │   │   ├── invoices/
│   │   │   ├── products/
│   │   │   ├── feed/
│   │   │   ├── cron/        # reminders (automated recovery scheduling)
│   │   │   └── demo/        # step (8-step hackathon demo player)
│   │   ├── login/
│   │   │   └── page.tsx     # Split-screen login & register UI
│   │   ├── globals.css      # Design system tokens + utility classes
│   │   ├── layout.tsx
│   │   └── page.tsx         # Main dashboard (Sales / Recovery / Inventory tabs)
│   ├── lib/
│   │   ├── auth.ts          # hashPassword / verifyPassword (PBKDF2)
│   │   ├── db.ts            # Prisma client singleton
│   │   └── orchestrator.ts  # AI agent router (rule-based + Gemini fallback)
│   └── proxy.ts             # Next.js route protection middleware
├── dev.db                   # SQLite database (local only, git-ignored)
├── prd.md                   # Product Requirements Document v1.0
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **npm** v9+

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
# Push the Prisma schema to create the local SQLite database
npx prisma db push

# Generate the Prisma client
npx prisma generate
```

### 3. Seed demo data

```bash
node prisma/seed.js
```

This populates the database with sample products, invoices, and conversations to power the 8-step demo.

### 4. (Optional) Configure AI API

To enable live Gemini AI responses instead of the rule-based engine, create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Without this key, the app works fully using the built-in local orchestrator.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You will be redirected to the **Login page**. Register a new account (e.g. `owner@dukanmitra.in` / `password123`) and you'll land on the dashboard.

---

## 📖 First-Time Usage

1. **Register** at `/login` — enter your name, email, password, and role.
2. **Dashboard loads** — the sidebar shows your name and role dynamically.
3. **Run the Demo** — click the ▶ button in the header toolbar to step through the 8-step wholesale furniture demo:
   - Customer sends "Need 20 office chairs"
   - Sales AI drafts a response (approve it)
   - Quotation is generated
   - Invoice is created and payment link shared
   - Invoice goes overdue
   - Recovery AI drafts a reminder (approve it)
   - Inventory Agent flags low stock
   - Restock recommendation generated
4. **Simulate a customer** — open any conversation, switch to **Simulate Customer** tab in the inspector, type a message and watch the AI Orchestrator auto-reply.
5. **Logout** — click the logout icon in the bottom-left sidebar.

---

## 🔌 API Reference

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Login and receive a session cookie |
| `POST` | `/api/auth/logout` | Clear session and cookie |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `GET` | `/api/conversations` | List all conversations with messages |
| `POST` | `/api/conversations` | Add a message (triggers AI orchestrator if sender is `"customer"`) |
| `GET` | `/api/invoices` | List all invoices |
| `GET` | `/api/products` | List all products |
| `GET` | `/api/feed` | List activity feed items |
| `POST` | `/api/ai/command` | Send a custom instruction to an AI agent |
| `POST` | `/api/ai/approve-draft` | Approve and commit a draft AI response |
| `POST` | `/api/cron/reminders` | Trigger automated recovery reminder scheduling |
| `POST` | `/api/demo/step` | Advance or reset the 8-step hackathon demo |

---

## 🗄 Database Schema

```prisma
User          # id, email, passwordHash, name, role, sessions[], createdAt
Session       # id, userId, expiresAt, createdAt
Product       # id, name, stock, threshold, status, demandPrediction, category, coverageDays
Invoice       # id, customer, amount, dueDate, overdueDays, status, remindersSent
Conversation  # id, customerName, phone, lastMessage, intent, agent, messages[]
Message       # id, sender, text, time, conversationId
FeedItem      # id, time, agent, text, icon, iconBg, iconColor
```

---

## 🏗 Available Scripts

```bash
npm run dev       # Start development server (Turbopack)
npm run build     # Build production bundle
npm run start     # Start production server
npm run lint      # Run ESLint

npx prisma db push      # Sync schema to database
npx prisma generate     # Regenerate Prisma client
npx prisma studio       # Open visual database explorer
node prisma/seed.js     # Re-seed demo data
```

---

## 📋 MVP Scope

### ✅ Implemented
- Full dashboard UI (Overview, Sales Agent, Recovery Agent, Inventory Agent tabs)
- SQLite database with Prisma ORM
- All API route handlers
- Authentication & session management
- AI Orchestrator (rule-based + Gemini fallback)
- Customer simulation mode in chat inspector
- 8-step hackathon demo player
- 5-second real-time dashboard polling
- Human-in-the-loop draft approval workflow

### 🟡 Simulated (Hackathon Mode)
- WhatsApp send/receive (mocked via local API — Baileys not integrated)
- LangGraph multi-agent orchestration (rule-based engine used instead)
- Demand forecasting model (static predictions from seed data)

### 🔮 Future Roadmap
- Live WhatsApp integration via Baileys or Meta Business API
- LangGraph-powered multi-agent state machine
- WebSocket real-time push (replacing polling)
- Hindi and multilingual NLU support
- Voice ordering via WhatsApp audio messages
- ERP integrations (Tally, Zoho Books)
- Mobile app for business owners

---

## 🏆 Built For

This project was built as a **hackathon prototype** demonstrating how autonomous AI agents can replace manual business operations for Indian SMEs.

---

*DukanMitra · PRD v1.0 · Next.js 16 · Prisma + SQLite*
