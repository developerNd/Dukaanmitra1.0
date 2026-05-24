# DukanMitra — AI Employees for SMEs
### Product Requirements Document · v1.0 · Hackathon Edition

---

> **One-line pitch:** "DukanMitra provides AI employees for SMEs that autonomously manage sales, payments, and inventory through WhatsApp."

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [Core Product Goals](#3-core-product-goals)
4. [Target Users](#4-target-users)
5. [Key Features](#5-key-features)
6. [AI Agent Architecture](#6-ai-agent-architecture)
7. [User Flow](#7-user-flow)
8. [Dashboard Modules](#8-dashboard-modules)
9. [Functional Requirements](#9-functional-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Recommended Tech Stack](#11-recommended-tech-stack)
12. [System Architecture](#12-system-architecture)
13. [MVP Scope](#13-mvp-scope-hackathon)
14. [Build Order](#14-build-order)
15. [Future Scope](#15-future-scope)
16. [Success Metrics](#16-success-metrics)
17. [Competitive Advantage](#17-competitive-advantage)
18. [Demo Script](#18-demo-script-hackathon)

---

## 1. Problem Statement

Small businesses struggle with:

- Replying to customer inquiries quickly
- Tracking unpaid invoices and recovering payments
- Managing inventory manually across channels
- Handling repetitive operational tasks without dedicated staff
- Affording specialized employees for every business function

Most SMEs already operate through WhatsApp but lack intelligent automation tools that can autonomously manage these workflows.

---

## 2. Solution Overview

DukanMitra provides three autonomous AI employees:

| Agent | Role |
|---|---|
| **AI Sales Employee** | Handles customer communication and sales workflows |
| **AI Recovery Employee** | Manages payment follow-ups and invoice recovery |
| **AI Inventory Employee** | Monitors stock levels and predicts shortages |

These agents communicate with customers, take actions autonomously, coordinate between each other, and deliver real-time insights to business owners — all through WhatsApp and a unified dashboard.

---

## 3. Core Product Goals

### Primary Goals

- Reduce manual operational workload for SMEs
- Improve customer response speed (target: under 3 seconds)
- Increase payment recovery rate
- Prevent inventory stockouts
- Provide 24/7 autonomous business assistance

### Secondary Goals

- Centralize business workflow automation
- Enable conversational business management via WhatsApp
- Deliver actionable AI-generated insights to owners

---

## 4. Target Users

### Primary — Small Business Owners

- Kirana stores and general retail
- Wholesale distributors
- Electronics and furniture shops
- Agencies and service businesses

### Secondary — Operations Staff

- Store managers
- Sales executives
- Operations and finance teams

---

## 5. Key Features

### 5.1 AI Sales Employee

**Responsibilities:**

- Reply to customer queries on WhatsApp
- Recommend products based on request
- Generate quotations automatically
- Process orders and upsell products
- Share pricing and answer FAQs
- Send payment links

**Example workflow:**

```
Customer: "Need 20 office chairs."

1. AI understands the request
2. AI checks inventory
3. AI suggests matching products
4. AI shares pricing
5. AI generates quotation
6. AI sends payment link
```

---

### 5.2 AI Recovery Employee

**Responsibilities:**

- Monitor all unpaid invoices in real time
- Send payment reminders at configured intervals
- Escalate reminder tone gradually (friendly → firm → urgent)
- Notify business owner about overdue payments
- Predict and flag high-risk customers

**Example workflow:**

```
1. Invoice overdue by 5 days
2. AI sends polite reminder
3. No response after 2 days
4. AI escalates follow-up with firmer tone
5. Owner receives notification with action options
```

---

### 5.3 AI Inventory Employee

**Responsibilities:**

- Track stock levels across all products
- Detect low stock in real time
- Predict demand based on sales velocity
- Recommend restock quantities
- Identify fast-moving and slow-moving products

**Example workflow:**

```
1. Sales spike detected on a product
2. AI predicts stock shortage in 3 days
3. Owner receives low-stock alert
4. Suggested reorder quantity generated automatically
```

---

## 6. AI Agent Architecture

### Multi-Agent System

The platform uses a coordinated multi-agent architecture where agents communicate internally to complete end-to-end workflows.

```
Customer Message (WhatsApp)
         ↓
    API Gateway
         ↓
  AI Orchestrator (LangGraph)
    ↙      ↓       ↘
Sales   Recovery  Inventory
Agent    Agent      Agent
    ↘      ↓       ↙
    Database + Dashboard
```

### Agent Coordination Example

```
Sales Agent creates order
       ↓
Inventory Agent updates stock levels
       ↓
Recovery Agent tracks payment status
       ↓
Owner dashboard reflects all updates in real time
```

---

## 7. User Flow

### Step 1 — Registration & Setup

- Create business account
- Connect WhatsApp number (via Baileys or WhatsApp Business API)
- Upload product catalog
- Configure pricing and stock thresholds

### Step 2 — Dashboard Overview

Owner sees:

- Active AI employees and their status
- Real-time business stats
- Open tasks and pending actions

### Step 3 — Customer Interaction

Customer sends a WhatsApp message to the business number.

### Step 4 — AI Automation

AI agents handle the full workflow: understand intent → check inventory → generate quote → send payment link → track payment → alert on overdue.

### Step 5 — Owner Monitoring

Owner monitors via dashboard:

- Sales activity and conversion rates
- Invoice and payment status
- Inventory levels and restock alerts
- All AI decisions and actions taken

---

## 8. Dashboard Modules

### Overview Dashboard

| Metric | Description |
|---|---|
| Total sales | Revenue for selected period |
| Pending invoices | Count and total value of unpaid invoices |
| Low stock alerts | Products below threshold |
| AI actions | Recent autonomous decisions taken |
| Active conversations | Live WhatsApp threads |

### Sales Dashboard

- Orders received and processed
- Quotations generated
- Conversion rate (quotes → orders)
- Customer interaction log

### Recovery Dashboard

- Overdue invoices with aging buckets (0–7d, 7–30d, 30d+)
- Reminder history per customer
- Payment recovery rate over time

### Inventory Dashboard

- Current stock levels per product
- Demand prediction (next 7 days)
- Reorder recommendations with suggested quantities
- Fast-moving and slow-moving product lists

---

## 9. Functional Requirements

### Authentication

- User signup and login (email + password)
- JWT-based session management
- Role-based access control (Owner, Manager)

### WhatsApp Integration

- Send and receive text messages
- Media message support (images, documents)
- Automated AI replies
- Message status tracking (sent, delivered, read)

### AI Engine

- Natural language understanding for customer messages
- Multi-agent orchestration via LangGraph
- Conversation memory and context management per customer
- Escalation handling for edge cases

### Inventory System

- CRUD operations for product catalog
- Real-time stock tracking
- Low-stock threshold configuration
- Demand prediction model

### Invoice System

- Invoice generation from orders
- Payment status tracking (pending, paid, overdue)
- Automated reminder scheduling

### Notifications

- Real-time dashboard alerts
- WhatsApp notifications to business owner for critical events

---

## 10. Non-Functional Requirements

### Performance

- WhatsApp message response time: under 3 seconds
- Dashboard real-time updates via WebSocket

### Scalability

- Multi-tenant architecture — each business is isolated
- Horizontal scaling for AI agent workers

### Security

- JWT authentication with refresh tokens
- End-to-end encrypted WhatsApp communication
- Secrets managed via environment variables (never hardcoded)

### Reliability

- Message retry system for failed WhatsApp sends
- Error logging and alerting (e.g., Sentry)
- Graceful degradation if AI layer is slow

---

## 11. Recommended Tech Stack

> Chosen for build speed, minimal setup, and hackathon-friendliness.

### Frontend

| Tool | Reason |
|---|---|
| **Next.js 14** | Full-stack React, fast routing, server components |
| **Tailwind CSS** | Utility-first styling, no context switching |
| **shadcn/ui** | Pre-built accessible components, no design time |
| **Recharts** | Simple data visualizations for dashboards |

### Backend

| Tool | Reason |
|---|---|
| **Node.js + Express.js** | Fast to write, vast ecosystem |
| **BullMQ + Redis** | Job queues for recovery reminders and background tasks |
| **Zod** | Runtime schema validation |

### AI Layer

| Tool | Reason |
|---|---|
| **OpenAI GPT-4o** | Best NLU quality for customer message understanding |
| **LangGraph** | Fine-grained multi-agent state machine control |
| **LangSmith** | Tracing and debugging agent decisions |

### Data & Messaging

| Tool | Reason |
|---|---|
| **Supabase (PostgreSQL)** | Database + real-time subscriptions + auth in one |
| **Baileys** | Open-source WhatsApp client, no Meta approval needed |
| **Socket.io** | Real-time WhatsApp message streaming to dashboard |

### Infrastructure & Deployment

| Tool | Reason |
|---|---|
| **Railway / Render** | Deploy backend in minutes, no DevOps overhead |
| **Vercel** | Zero-config Next.js deployment |
| **Cloudflare** | DNS, CDN, and DDoS protection |

### Developer Tooling

| Tool | Reason |
|---|---|
| **Prisma ORM** | Type-safe database queries, auto-migrations |
| **Webhooksite** | Test incoming WhatsApp webhooks without ngrok |
| **Postman** | API testing and documentation |

> **Note on WhatsApp:** Baileys is ideal for a hackathon — no Meta Business approval required. For production, migrate to the official WhatsApp Business API.

> **Note on LangGraph vs CrewAI:** LangGraph offers finer control over agent state transitions, making it easier to demo and debug during a hackathon. CrewAI abstracts too much when you need to show agent decisions explicitly.

---

## 12. System Architecture

```
WhatsApp (Customer)
        ↓
   API Gateway (Express)
        ↓
 AI Orchestrator (LangGraph)
        ↓
┌───────────────────────────┐
│  Sales Agent              │  ← Handles customer NLU, quotes, orders
│  Recovery Agent           │  ← Monitors invoices, sends reminders
│  Inventory Agent          │  ← Tracks stock, predicts shortages
└───────────────────────────┘
        ↓
 Database (Supabase/PostgreSQL)
        ↓
 Real-time Dashboard (Next.js + Socket.io)
```

### Data Flow Example — Order Creation

```
1. Customer sends "Need 20 chairs" on WhatsApp
2. Baileys receives message → sends to API Gateway
3. AI Orchestrator routes to Sales Agent
4. Sales Agent queries product catalog (Supabase)
5. Sales Agent generates quotation
6. Sales Agent sends quote + payment link to customer via WhatsApp
7. Recovery Agent begins monitoring payment status
8. Inventory Agent deducts stock on order confirmation
9. Dashboard updates in real time via Socket.io
```

---

## 13. MVP Scope (Hackathon)

### Must Have ✅

- WhatsApp message send/receive via Baileys
- AI Sales Agent (NLU + auto-reply + quotation generation)
- Invoice creation and payment status tracking
- Basic Recovery Agent (scheduled reminders)
- Inventory alert on low stock threshold breach
- Real-time dashboard with overview, sales, and inventory modules

### Nice to Have 🟡

- Hindi and multilingual message support
- Voice ordering via WhatsApp audio
- Predictive demand analytics
- Advanced multi-agent coordination with visible handoffs
- Customer risk scoring for recovery prioritization

---

## 14. Build Order

Recommended sequence for a hackathon:

| Step | Task | Est. Time |
|---|---|---|
| 1 | WhatsApp connection via Baileys + echo bot | 1–2 hrs |
| 2 | Supabase schema: products, invoices, conversations | 1 hr |
| 3 | Sales Agent with GPT-4o + inventory check | 3–4 hrs |
| 4 | Quotation generation + payment link flow | 1–2 hrs |
| 5 | Dashboard with real-time conversation feed | 2–3 hrs |
| 6 | Recovery reminders as background cron job | 1–2 hrs |
| 7 | Inventory alerts on threshold breach | 1 hr |
| 8 | Demo polish and error handling | 1–2 hrs |

**Total: ~12–17 hours**

---

## 15. Future Scope

### Phase 2

- Voice AI ordering via WhatsApp audio messages
- Multilingual support (Hindi, Tamil, Bengali, Marathi)
- AI-generated marketing campaigns and promotional blasts
- Customer segmentation and personalized follow-ups

### Phase 3

- ERP and accounting integrations (Tally, Zoho Books)
- Advanced AI business forecasting and demand planning
- Mobile app for business owners
- Marketplace integrations (Meesho, Flipkart, Amazon)

---

## 16. Success Metrics

### Business Metrics

| Metric | Target |
|---|---|
| Customer response time | Under 3 seconds |
| Payment recovery improvement | +30–40% vs manual |
| Stockout incidents | Reduced to near zero |

### Product Metrics

| Metric | Description |
|---|---|
| Daily active businesses | Businesses using at least one AI agent per day |
| Automated conversations | % of WhatsApp threads handled without owner input |
| AI task completion rate | % of tasks completed end-to-end without human fallback |

---

## 17. Competitive Advantage

| Dimension | Traditional SME Tools | DukanMitra |
|---|---|---|
| Workflow type | Manual, static | Autonomous, adaptive |
| Customer communication | Owner-managed | AI-managed |
| Inventory management | Spreadsheets | Predictive AI alerts |
| Payment recovery | Manual follow-up | Escalating AI reminders |
| Interface | Desktop dashboards | WhatsApp-first |
| Staff required | Dedicated employees | Zero — AI employees |

---

## 18. Demo Script (Hackathon)

**Scenario:** A wholesale furniture shop receives a customer order.

```
Step 1: Customer sends "Need 20 office chairs" on WhatsApp

Step 2: Sales AI responds within 3 seconds:
        "Hi! We have the Executive Pro Chair at ₹3,200 each.
         For 20 units: ₹64,000. Shall I generate a quotation?"

Step 3: Quotation PDF generated and sent automatically

Step 4: Invoice created, payment link shared

Step 5: Payment not received after 5 days

Step 6: Recovery AI sends polite reminder:
        "Hi, your invoice #1042 of ₹64,000 is due.
         Please complete payment here: [link]"

Step 7: Inventory AI detects high demand for office chairs,
        predicts shortage in 3 days, alerts owner on dashboard

Step 8: Owner dashboard shows:
        - ₹64,000 order pending payment
        - Low stock alert: Office chairs (12 remaining)
        - Suggested reorder: 50 units
```

---

*DukanMitra · PRD v1.0 · Built for Hackathon*
