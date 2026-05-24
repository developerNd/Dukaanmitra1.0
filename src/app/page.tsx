"use client";

import React, { useState, useEffect } from "react";

// Types
interface Message {
  id?: string;
  sender: "customer" | "ai";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  customerName: string;
  phone: string;
  lastMessage: string;
  intent: "ORDER_QUERY" | "NEGOTIATION" | "PAYMENT_REMINDER";
  agent: "Sales Agent" | "Recovery Agent";
  messages: Message[];
}

interface FeedItem {
  id: string;
  time: string;
  agent: string;
  text: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface SalesInteraction {
  customer: string;
  type: "QUOTE_REQUEST" | "PRODUCT_QUERY" | "COMPLAINT";
  text: string;
  time: string;
  status: "AI Responded" | "Escalated to Human";
  statusColor: string;
}

interface PendingQuotation {
  id: string;
  customer: string;
  value: string;
  status: "PENDING" | "SENT" | "CONVERTED";
  statusBg: string;
  statusText: string;
  confidence: number;
  actionText: string;
}

interface ConfirmedOrder {
  id: string;
  customer: string;
  amount: string;
  status: "Processing" | "Shipped" | "Delivered";
  statusColor: string;
}

interface OverdueBucket {
  label: string;
  amount: string;
  percent: number;
  bgClass: string;
}

interface ReminderLog {
  id: string;
  customer: string;
  time: string;
  tone: "FRIENDLY" | "FIRM" | "URGENT";
  channel: "WHATSAPP" | "EMAIL";
  text: string;
  status: string;
  statusIcon: string;
}

interface HighRiskCustomer {
  initials: string;
  name: string;
  invoicesCount: number;
  totalAmount: string;
  risk: "CRITICAL" | "HIGH" | "MEDIUM";
  riskColor: string;
  history: string;
}

interface RecoveryInvoice {
  id: string;
  customer: string;
  amount: number;
  dueDate: string;
  actionText: string;
  actionType: "schedule" | "check_circle" | "pulse_teal";
  status: "Overdue" | "Due Tomorrow" | "Paid";
  statusColor: string;
}

interface StockPulseRow {
  id: string;
  name: string;
  category: string;
  percent: number;
  stockText: string;
  coverageDays: number;
  statusColor: string;
}

interface InventoryReorder {
  item: string;
  packSize: string;
  suggested: number;
  reasoning: string;
  badgeClass: string;
}

interface StockActivity {
  type: "Sales Deduction" | "Purchase Order Recieved" | "Manual Audit";
  detail: string;
  time: string;
  ref: string;
  isAdd: boolean;
}

const demoDescriptions: { [key: number]: string } = {
  1: "Step 1: Customer sends 'Need 20 office chairs' on WhatsApp",
  2: "Step 2: Sales AI responds: 'Hi! We have the Executive Pro Chair at ₹3,200 each. Shall I generate a quotation?'",
  3: "Step 3: Quotation PDF is generated and sent to the customer automatically",
  4: "Step 4: Customer confirms; invoice #INV-8822 is created and payment link shared",
  5: "Step 5: Payment not received after 5 days (Aging simulation triggered)",
  6: "Step 6: Recovery AI drafts and sends a polite overdue reminder to Ramesh Kumar",
  7: "Step 7: Inventory AI detects high demand and alerts critical low stock on the owner's dashboard",
  8: "Step 8: Inventory AI recommends restocking 50 units of Executive Pro Chair to avoid stockout"
};

export default function Home() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"Overview" | "Sales Agent" | "Recovery Agent" | "Inventory Agent">("Overview");

  // Dialogs
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandText, setCommandText] = useState("");
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [chatOverrideText, setChatOverrideText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Demo Step Player
  const [demoStep, setDemoStep] = useState(0);

  // --- Database Persistent States ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [invoices, setInvoices] = useState<RecoveryInvoice[]>([]);
  const [products, setProducts] = useState<StockPulseRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load and refresh function
  const refreshData = async () => {
    try {
      const [resConv, resFeed, resInv, resProd] = await Promise.all([
        fetch("/api/conversations"),
        fetch("/api/feed"),
        fetch("/api/invoices"),
        fetch("/api/products"),
      ]);

      const [conv, feed, inv, prod] = await Promise.all([
        resConv.json(),
        resFeed.json(),
        resInv.json(),
        resProd.json(),
      ]);

      setConversations(conv);
      setFeedItems(feed);
      
      // Map invoices
      const mappedInvoices = inv.map((i: any) => ({
        id: i.id,
        customer: i.customer,
        amount: i.amount,
        dueDate: i.dueDate,
        actionText: i.actionText,
        actionType: i.actionType,
        status: i.status,
        statusColor: i.statusColor
      }));
      setInvoices(mappedInvoices);

      // Map products
      const mappedProducts = prod.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        percent: Math.min(Math.round((p.stock / p.threshold) * 50), 100), // percent of bar
        stockText: `${p.stock} / ${p.threshold * 2}`,
        coverageDays: p.coverageDays,
        statusColor: p.status === "Low Stock" ? "bg-error" : "bg-secondary"
      }));
      setProducts(mappedProducts);

    } catch (e) {
      console.error("Failed to fetch database items", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update open WhatsApp Inspector modal in real-time when conversations state refreshes
  useEffect(() => {
    if (selectedChat) {
      const updated = conversations.find(c => c.id === selectedChat.id);
      if (updated) {
        setSelectedChat(updated);
      }
    }
  }, [conversations, selectedChat]);

  // --- Static/Interactions from source screens ---
  const salesInteractions: SalesInteraction[] = [
    { customer: "Priya Sharma", type: "QUOTE_REQUEST", text: "Can you share the best price for bulk order of 50 units?", time: "2 mins ago", status: "AI Responded", statusColor: "bg-secondary" },
    { customer: "Rahul Varma", type: "PRODUCT_QUERY", text: "Does the warranty cover accidental water damage?", time: "15 mins ago", status: "AI Responded", statusColor: "bg-secondary" },
    { customer: "Suresh K.", type: "COMPLAINT", text: "My order hasn't arrived yet. It was supposed to be here yesterday.", time: "45 mins ago", status: "Escalated to Human", statusColor: "bg-primary" }
  ];

  // Dynamic Pending Quotations matching database status
  const pendingQuotations: PendingQuotation[] = [
    ...(demoStep >= 3 ? [{ id: "Quotation #8822", customer: "Ramesh Kumar", value: "₹64,000", status: "SENT" as const, statusBg: "bg-green-100 text-green-800", statusText: "SENT", confidence: 98, actionText: "View Details" }] : []),
    { id: "Quotation #8821", customer: "Rajesh Exports", value: "₹1,45,000", status: "PENDING", statusBg: "bg-amber-100 text-amber-800", statusText: "PENDING", confidence: 92, actionText: "Approve & Send" },
    { id: "Quotation #8819", customer: "Global Tech Solutions", value: "₹54,200", status: "SENT", statusBg: "bg-green-100 text-green-800", statusText: "SENT", confidence: 85, actionText: "View Details" },
    { id: "Quotation #8818", customer: "Amit Mishra", value: "₹12,900", status: "CONVERTED", statusBg: "bg-blue-100 text-blue-800", statusText: "CONVERTED", confidence: 100, actionText: "Order #4421" }
  ];

  const confirmedOrders: ConfirmedOrder[] = [
    { id: "#ORD-5521", customer: "Karan Johar", amount: "₹4,200.00", status: "Processing", statusColor: "text-secondary" },
    { id: "#ORD-5520", customer: "Meera Nair", amount: "₹1,850.00", status: "Shipped", statusColor: "text-blue-600" },
    { id: "#ORD-5519", customer: "Sneha Reddy", amount: "₹12,400.00", status: "Delivered", statusColor: "text-green-600" }
  ];

  const reminderLogs: ReminderLog[] = [
    ...(demoStep >= 6 ? [{ id: "4", customer: "Ramesh Kumar", time: "NOW", tone: "FRIENDLY" as const, channel: "WHATSAPP" as const, text: "Dear Ramesh, friendly reminder that payment for Invoice #INV-8822...", status: "Draft - Awaiting approval", statusIcon: "schedule" }] : []),
    { id: "1", customer: "Global Trade Co.", time: "2M AGO", tone: "FIRM", channel: "WHATSAPP", text: "Your payment for Invoice #2938 is now 10 days overdue. Please update...", status: "Read by customer", statusIcon: "done_all" },
    { id: "2", customer: "Zenith Solutions", time: "1H AGO", tone: "URGENT", channel: "EMAIL", text: "This is a final notice regarding outstanding dues...", status: "Replied: \"Paying by Friday\"", statusIcon: "reply" },
    { id: "3", customer: "Alpha Retail", time: "3H AGO", tone: "FRIENDLY", channel: "WHATSAPP", text: "Hope you are having a great week! Just a friendly nudge...", status: "", statusIcon: "" }
  ];

  const highRiskWatchlist: HighRiskCustomer[] = [
    { initials: "VK", name: "Vortex Kitchens", invoicesCount: 3, totalAmount: "$2,450", risk: "CRITICAL", riskColor: "text-error", history: "Constant Late Payer" },
    { initials: "NS", name: "Nova Supply", invoicesCount: 1, totalAmount: "$890", risk: "MEDIUM", riskColor: "text-tertiary", history: "First-time overdue" }
  ];

  const inventoryReorders: InventoryReorder[] = [
    ...(products.some(p => p.id === "P-5" && p.statusColor === "bg-error")
      ? [{ item: "Executive Pro Chair", packSize: "Pack of 10", suggested: 50, reasoning: "Predicted spike: Bulk request buffer", badgeClass: "bg-secondary-container/50 text-on-secondary-container" }]
      : []),
    { item: "Organic Almond Milk", packSize: "Pack of 12", suggested: 40, reasoning: "Predicted spike: Weekend Sale", badgeClass: "bg-secondary-container/50 text-on-secondary-container" },
    { item: "AA Battery Pack", packSize: "Essentials", suggested: 100, reasoning: "Historical Low Stock threshold", badgeClass: "bg-surface-container text-on-surface-variant" }
  ];

  const stockActivityLog: StockActivity[] = [
    { type: "Sales Deduction", detail: "-12 Wireless Headphones Pro", time: "10:45 AM", ref: "POS-421", isAdd: false },
    { type: "Purchase Order Recieved", detail: "+50 Smart Watch Series 5", time: "09:12 AM", ref: "Supplier: GizmoCorp", isAdd: true },
    { type: "Manual Audit", detail: "Stock adjustment: Dry Fruits (-2kg)", time: "Yesterday", ref: "User: Karan S.", isAdd: false }
  ];

  // Live log ticker console states
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Analyzing WhatsApp inquiry from Arjun Mehta...",
    "Processing Product SKU: DK-992-BLU",
    "Generating customized quotation with loyalty discount..."
  ]);
  const [logIndex, setLogIndex] = useState(0);

  // Console ticker loop
  useEffect(() => {
    if (activeTab !== "Sales Agent") return;
    const tickerList = [
      "Validating inventory levels for requested units...",
      "Calculating distance-based shipping estimates...",
      "Reviewing customer purchase history for discounts...",
      "Optimizing quote based on current market trends...",
      "Preparing AI-suggested follow-up script..."
    ];

    const timer = setInterval(() => {
      setConsoleLogs(prev => {
        const next = [...prev, tickerList[logIndex]];
        if (next.length > 4) next.shift();
        return next;
      });
      setLogIndex(prev => (prev + 1) % tickerList.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeTab, logIndex]);

  // Dynamic KPI Calculators from real database values
  const totalItemsCount = 1248;
  const slowMovingCount = 28;
  const predictedStockoutsCount = 7;
  const lowStockAlertsCount = products.filter(r => r.statusColor === "bg-error").length;

  const totalSalesVal = 4280000;
  const pendingInvoicesVal = invoices.reduce((sum, inv) => {
    if (inv.status === "Paid") return sum;
    const cleanAmount = inv.amount;
    return sum + cleanAmount;
  }, 0);

  // Overdue buckets calculation based on database invoices
  const calculatedBuckets: OverdueBucket[] = [
    {
      label: "0-7 Days",
      amount: `$${invoices
        .filter(inv => inv.status === "Overdue" && !inv.dueDate.includes("30") && !inv.dueDate.includes("12"))
        .reduce((sum, inv) => sum + inv.amount, 0)
        .toLocaleString()}`,
      percent: 42,
      bgClass: "bg-secondary"
    },
    {
      label: "7-30 Days",
      amount: `$${invoices
        .filter(inv => inv.status === "Overdue" && inv.dueDate.includes("12"))
        .reduce((sum, inv) => sum + inv.amount, 0)
        .toLocaleString()}`,
      percent: 33,
      bgClass: "bg-tertiary"
    },
    {
      label: "30+ Days",
      amount: `$${invoices
        .filter(inv => inv.status === "Overdue" && inv.dueDate.includes("30"))
        .reduce((sum, inv) => sum + inv.amount, 0)
        .toLocaleString()}`,
      percent: 25,
      bgClass: "bg-error"
    }
  ];

  // --- API Mutators ---
  const handleNextDemoStep = async () => {
    const nextStep = demoStep + 1;
    if (nextStep > 8) return;
    setDemoStep(nextStep);

    try {
      await fetch("/api/demo/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: nextStep }),
      });
    } catch (e) {
      console.error("Failed to run next demo step", e);
    } finally {
      await refreshData();
    }
  };

  const handleResetDemo = async () => {
    setDemoStep(0);

    try {
      await fetch("/api/demo/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
    } catch (e) {
      console.error("Failed to reset demo", e);
    } finally {
      await refreshData();
    }
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;

    try {
      await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: commandText,
          agent: activeTab === "Overview" ? "AI Dispatcher" : activeTab,
        }),
      });
    } catch (e) {
      console.error("Failed to send AI command", e);
    } finally {
      setCommandText("");
      setCommandOpen(false);
      await refreshData();
    }
  };

  const handleSendDraft = async (chatId: string) => {
    const responseToSend = chatOverrideText.trim();
    if (!responseToSend) return;

    try {
      await fetch("/api/ai/approve-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          text: responseToSend,
        }),
      });
    } catch (e) {
      console.error("Failed to send draft approval", e);
    } finally {
      setChatOverrideText("");
      setSelectedChat(null);
      await refreshData();
    }
  };

  useEffect(() => {
    if (selectedChat) {
      const drafts = selectedChat.messages.filter(m => m.text.includes("(Draft)"));
      if (drafts.length > 0) {
        setChatOverrideText(drafts[0].text.replace(" (Draft)", ""));
      } else {
        setChatOverrideText("");
      }
    }
  }, [selectedChat]);

  // Filters
  const filteredConversations = conversations.filter(chat => {
    if (activeTab === "Overview") return true;
    return chat.agent === activeTab;
  }).filter(chat => {
    if (!searchQuery) return true;
    return chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || chat.phone.includes(searchQuery);
  });

  const filteredFeed = feedItems.filter(item => {
    if (activeTab === "Overview") return true;
    return item.agent === activeTab;
  });

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background min-h-screen">
        <div className="flex flex-col items-center gap-sm">
          <span className="material-symbols-outlined text-4xl text-secondary animate-spin">sync</span>
          <p className="text-sm font-bold text-primary tracking-wider font-data-mono">LOADING DATABASE STATE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-full bg-background font-body-md text-on-background min-h-screen">
      
      {/* FIXED Sidebar Navigation Shell */}
      <aside className="w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col p-md z-50">
        <div className="mb-xl px-sm">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">DukanMitra</h1>
          <p className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest mt-1">AI Business Suite</p>
        </div>

        <nav className="flex-1 space-y-base">
          <button 
            onClick={() => setActiveTab("Overview")}
            className={`w-full flex items-center gap-md px-md py-sm rounded-lg group transition-all text-left ${
              activeTab === "Overview" 
                ? "text-secondary font-bold bg-secondary-container" 
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">dashboard</span>
            <span className="font-body-md">Overview</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("Sales Agent")}
            className={`w-full flex items-center gap-md px-md py-sm rounded-lg group transition-all text-left ${
              activeTab === "Sales Agent" 
                ? "text-secondary font-bold bg-secondary-container" 
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">point_of_sale</span>
            <span className="font-body-md">Sales Agent</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("Recovery Agent")}
            className={`w-full flex items-center gap-md px-md py-sm rounded-lg group transition-all text-left ${
              activeTab === "Recovery Agent" 
                ? "text-secondary font-bold bg-secondary-container" 
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">payments</span>
            <span className="font-body-md">Recovery Agent</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("Inventory Agent")}
            className={`w-full flex items-center gap-md px-md py-sm rounded-lg group transition-all text-left ${
              activeTab === "Inventory Agent" 
                ? "text-secondary font-bold bg-secondary-container" 
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">inventory_2</span>
            <span className="font-body-md">Inventory Agent</span>
          </button>
        </nav>

        <div className="mt-auto pt-lg space-y-md border-t border-outline-variant">
          <div className="glass-ai rounded-xl p-md flex items-center gap-sm">
            <div className="w-2 h-2 rounded-full bg-secondary pulse-teal"></div>
            <p className="text-label-caps font-label-caps text-on-secondary-fixed-variant font-bold tracking-wider shimmer-text">
              AI EMPLOYEES ACTIVE
            </p>
          </div>
          
          <button 
            onClick={() => setCommandOpen(true)}
            className="w-full bg-gradient-to-r from-secondary to-tertiary text-white font-bold py-md rounded-xl flex items-center justify-center gap-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            Ask AI
          </button>

          <div className="flex items-center gap-md px-sm">
            <img 
              alt="Admin Store Profile" 
              className="w-10 h-10 rounded-full border border-outline-variant shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqbqL-1KFWZtbjk8_QL0pIKF5JykKoPu5PNWSU3Ivqn8kCSWIKQtESnlMneBmd6hH9Hk4_-LmfwZ0osRxLjgEegy2bGG1tQXd9xK1avgOHp8kYkCzvjCJSlYqxVQO5P7oivCVdlWRsCJarA02cXwSTFLYyIbaqqJVdCPpluEZgouAc_5p56p7zP17ChhC4PB9C1teaAl94ioPnHDSo3uz58kiLgUNcmOyc8db1n_dQNGS6efLRpvVJLtzP-C7BvGw9-pGoHf4Sh88"
            />
            <div>
              <p className="font-bold text-sm text-primary">Admin Store</p>
              <p className="text-label-caps font-label-caps text-[10px] text-on-surface-variant font-bold">PREMIUM PLAN</p>
            </div>
          </div>
        </div>
      </aside>

      {/* FIXED Top Application Bar */}
      <header className="fixed top-0 right-0 left-[280px] h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant z-40 flex justify-between items-center px-lg">
        
        <div className="flex items-center bg-surface-container-low border border-outline-variant/55 rounded-full px-md py-xs w-96">
          <span className="material-symbols-outlined text-outline">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "Inventory Agent" ? "Search inventory levels or trends..." :
              activeTab === "Sales Agent" ? "Search sales orders & requests..." :
              activeTab === "Recovery Agent" ? "Search overdue invoices..." :
              "Search customer conversation logs..."
            }
            className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full ml-sm text-on-surface"
          />
        </div>

        <div className="flex items-center gap-md">
          {/* Active agent status badges */}
          <div className="flex items-center gap-xs px-md py-1 bg-secondary-container/40 rounded-full border border-secondary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary pulse-dot"></span>
            <span className="text-[10px] font-bold font-data-mono text-on-secondary-container uppercase">
              {activeTab === "Overview" ? "AI SUITE: ACTIVE" :
               activeTab === "Sales Agent" ? "SALES_AGENT: ACTIVE" :
               activeTab === "Recovery Agent" ? "RECOVERY_AGENT: ACTIVE" :
               "INVENTORY_AGENT: MONITORING"}
            </span>
          </div>

          {/* Hackathon Demo Controller */}
          <div className="flex items-center bg-surface-container rounded-lg p-1 border border-outline-variant">
            <span className="px-sm text-xs font-bold text-primary flex items-center gap-xs uppercase">
              <span className="w-1.5 h-1.5 bg-error rounded-full pulse-dot"></span>
              DEMO
            </span>
            {demoStep > 0 && (
              <span className="text-[10px] font-bold text-secondary mr-sm bg-white px-2 py-0.5 rounded border border-outline-variant">
                Step {demoStep}/8
              </span>
            )}
            <button
              onClick={handleNextDemoStep}
              disabled={demoStep === 8}
              className="flex items-center justify-center p-1 rounded hover:bg-white text-secondary transition-all disabled:opacity-50"
              title="Next Demo Step"
            >
              <span className="material-symbols-outlined text-base">skip_next</span>
            </button>
            <button
              onClick={handleResetDemo}
              className="flex items-center justify-center p-1 rounded hover:bg-white text-on-surface-variant transition-all"
              title="Reset Demo"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
            </button>
          </div>

          <button className="hover:bg-surface-container-low rounded-full p-xs relative transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-error rounded-full"></span>
          </button>
          <button 
            onClick={() => setCommandOpen(true)}
            className="hover:bg-surface-container-low rounded-full p-xs transition-colors"
            title="Ask AI"
          >
            <span className="material-symbols-outlined text-on-surface-variant">smart_toy</span>
          </button>
          <div className="h-8 w-[1px] bg-outline-variant"></div>
          <button className="hover:bg-surface-container-low rounded-full p-xs transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
          </button>
        </div>
      </header>

      {/* Demo Step Banner */}
      {demoStep > 0 && (
        <div className="fixed top-16 left-[280px] right-0 z-30 bg-gradient-to-r from-secondary/15 to-primary-container/15 border-b border-outline-variant px-lg py-sm flex justify-between items-center text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary animate-bounce text-sm">auto_awesome</span>
            <span>{demoDescriptions[demoStep]}</span>
          </div>
          <button 
            onClick={handleNextDemoStep} 
            disabled={demoStep === 8}
            className="bg-secondary text-white text-[10px] px-2.5 py-1 rounded-md shadow-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-xs font-bold"
          >
            {demoStep === 8 ? "Finished" : "Next Step"}
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Main Canvas Body */}
      <main className={`ml-[280px] p-lg bg-background min-h-screen space-y-lg ${demoStep > 0 ? "pt-28" : "pt-20"}`}>
        
        {/* --- OVERVIEW TAB CONSOLE --- */}
        {activeTab === "Overview" && (
          <div className="space-y-lg">
            {/* Page Title */}
            <div>
              <h2 className="font-headline-lg text-2xl font-bold text-primary">Overview Console</h2>
              <p className="text-on-surface-variant text-sm mt-1 font-semibold">Multi-agent operations controller for sales, recovery reminders, and inventory velocity.</p>
            </div>

            {/* Bento Grid KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-lg">
              <div onClick={() => setActiveTab("Inventory Agent")} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all cursor-pointer">
                <p className="text-label-caps font-label-caps text-xs text-on-surface-variant mb-xs">TOTAL ITEMS</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-primary">{totalItemsCount}</h2>
                  <span className="text-secondary text-[11px] font-bold bg-secondary-container px-2 py-0.5 rounded-full">+4%</span>
                </div>
              </div>

              <div onClick={() => setActiveTab("Inventory Agent")} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all cursor-pointer">
                <p className="text-label-caps font-label-caps text-xs text-error mb-xs">LOW STOCK ALERTS</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-error">{lowStockAlertsCount}</h2>
                  <span className="material-symbols-outlined text-error animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
              </div>

              <div onClick={() => setActiveTab("Inventory Agent")} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all cursor-pointer">
                <p className="text-label-caps font-label-caps text-xs text-on-surface-variant mb-xs">SLOW MOVING ITEMS</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-primary">{slowMovingCount}</h2>
                  <span className="text-outline text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded-full">ACTION REQ</span>
                </div>
              </div>

              <div onClick={() => setActiveTab("Inventory Agent")} className="glass-ai p-md rounded-xl shadow-lg border border-secondary/20 hover:-translate-y-0.5 transition-all cursor-pointer">
                <p className="text-label-caps font-label-caps text-xs text-secondary mb-xs">PREDICTED STOCKOUTS</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-primary">0{predictedStockoutsCount}</h2>
                  <span className="text-[10px] text-on-secondary-fixed-variant font-bold">NEXT 7 DAYS</span>
                </div>
              </div>
            </section>

            {/* Status Panel */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
              
              <div className="lg:col-span-8 space-y-lg">
                <div>
                  <div className="flex items-center gap-sm mb-md">
                    <span className="material-symbols-outlined text-secondary">smart_toy</span>
                    <h2 className="font-headline-md text-lg font-bold text-primary">AI Employee Status</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div onClick={() => setActiveTab("Sales Agent")} className="glass-ai rounded-xl p-md flex flex-col h-40 card-shadow cursor-pointer hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-sm">
                        <span className="font-label-caps text-[10px] text-on-surface-variant font-bold">SALES_AGENT</span>
                        <div className="flex items-center gap-1 bg-secondary-container px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full pulse-dot"></span>
                          <span className="text-[9px] font-bold text-on-secondary-container">ACTIVE</span>
                        </div>
                      </div>
                      <div className="font-bold text-base text-primary mb-xs">Sales Agent</div>
                      <div className="text-on-surface-variant text-xs italic mt-auto">
                        Responding to catalog & quotation enquiries in under 3s.
                      </div>
                    </div>

                    <div onClick={() => setActiveTab("Recovery Agent")} className="glass-ai rounded-xl p-md flex flex-col h-40 card-shadow cursor-pointer hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-sm">
                        <span className="font-label-caps text-[10px] text-on-surface-variant font-bold">RECOVERY_AGENT</span>
                        <div className="flex items-center gap-1 bg-tertiary-fixed px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[10px] text-tertiary">psychology</span>
                          <span className="text-[9px] font-bold text-tertiary">THINKING</span>
                        </div>
                      </div>
                      <div className="font-bold text-base text-primary mb-xs">Recovery Agent</div>
                      <div className="shimmer-text font-semibold text-xs mt-auto">
                        Monitoring aging buckets & drafts.
                      </div>
                    </div>

                    <div onClick={() => setActiveTab("Inventory Agent")} className="bg-white border border-outline-variant rounded-xl p-md flex flex-col h-40 card-shadow cursor-pointer hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-sm">
                        <span className="font-label-caps text-[10px] text-on-surface-variant font-bold">INVENTORY_AGENT</span>
                        <div className="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full">
                          <span className="text-[9px] font-bold text-on-surface-variant">MONITORING</span>
                        </div>
                      </div>
                      <div className="font-bold text-base text-primary mb-xs">Inventory Agent</div>
                      <div className="text-on-surface-variant text-xs mt-auto">
                        Tracking stock velocity & predicting stockouts.
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Conversations */}
                <div>
                  <div className="flex items-center justify-between mb-md">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-secondary">chat</span>
                      <h2 className="font-headline-md text-lg font-bold text-primary">Active WhatsApp Conversations</h2>
                    </div>
                    <span className="text-xs text-on-surface-variant font-semibold">
                      {filteredConversations.length} Threads Active
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr>
                          <th className="px-md py-sm font-label-caps text-xs font-bold text-on-surface-variant">Customer</th>
                          <th className="px-md py-sm font-label-caps text-xs font-bold text-on-surface-variant">Last Message</th>
                          <th className="px-md py-sm font-label-caps text-xs font-bold text-on-surface-variant">AI Intent</th>
                          <th className="px-md py-sm font-label-caps text-xs font-bold text-on-surface-variant text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredConversations.map(chat => {
                          const hasDraft = chat.messages.length > 0 && chat.messages[chat.messages.length - 1].text.includes("(Draft)");
                          return (
                            <tr 
                              key={chat.id} 
                              onClick={() => setSelectedChat(chat)} 
                              className="hover:bg-surface-bright cursor-pointer transition-colors border-b border-outline-variant"
                            >
                              <td className="px-md py-md">
                                <div className="flex flex-col">
                                  <span className="font-bold text-primary">{chat.customerName}</span>
                                  <span className="text-xs text-on-surface-variant">{chat.phone}</span>
                                </div>
                              </td>
                              <td className="px-md py-md text-sm text-on-surface">
                                <p className="truncate max-w-[280px]">{chat.lastMessage}</p>
                              </td>
                              <td className="px-md py-md">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  chat.intent === "ORDER_QUERY"
                                    ? "bg-secondary-container text-on-secondary-container"
                                    : chat.intent === "NEGOTIATION"
                                    ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                                    : "bg-error-container text-on-error-container"
                                }`}>
                                  {chat.intent}
                                </span>
                              </td>
                              <td className="px-md py-md text-right">
                                <div className="flex items-center justify-end gap-sm">
                                  {hasDraft && <span className="w-1.5 h-1.5 bg-tertiary rounded-full pulse-dot mr-1"></span>}
                                  <button className="p-1 hover:bg-surface-container-high rounded transition-all">
                                    <span className="material-symbols-outlined text-on-surface-variant text-sm">visibility</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recent Activity Live Feed */}
              <div className="lg:col-span-4 flex flex-col">
                <div className="flex items-center justify-between mb-md">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-secondary">bolt</span>
                    <h2 className="font-headline-md text-lg font-bold text-primary">Live AI Activity</h2>
                  </div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex-grow overflow-y-auto max-h-[520px] shadow-sm">
                  <div className="space-y-lg">
                    {filteredFeed.map((item, idx) => (
                      <div className="flex gap-md" key={item.id}>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${item.iconBg}`}>
                            <span className={`material-symbols-outlined text-sm ${item.iconColor}`}>{item.icon}</span>
                          </div>
                          {idx !== filteredFeed.length - 1 && <div className="w-0.5 flex-grow bg-outline-variant/30 my-1"></div>}
                        </div>
                        <div>
                          <div className="font-semibold text-[10px] text-on-surface-variant tracking-wider uppercase mb-1">{item.time}</div>
                          <div className="text-sm">
                            <span className="font-bold text-primary">{item.agent}</span>{" "}
                            <span className="text-on-surface-variant">{item.text}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </section>
          </div>
        )}

        {/* --- SALES AGENT DASHBOARD --- */}
        {activeTab === "Sales Agent" && (
          <div className="space-y-lg animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-headline-lg text-2xl font-bold text-primary">Sales Workflow Management</h2>
                <p className="text-sm text-on-surface-variant font-semibold">Monitoring autonomous customer interactions and revenue growth.</p>
              </div>
              <div className="flex gap-sm">
                <button className="px-md py-sm rounded-lg border border-outline font-bold text-xs text-primary hover:bg-surface-container transition-colors">Export Report</button>
                <button className="px-md py-sm rounded-lg bg-primary text-white font-bold text-xs hover:opacity-90 transition-opacity">Agent Settings</button>
              </div>
            </div>

            {/* KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-lg">
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-start mb-md">
                  <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Total Sales</span>
                  <span className="material-symbols-outlined text-secondary">trending_up</span>
                </div>
                <div className="text-2xl font-bold text-primary">₹{(totalSalesVal/100000).toFixed(1)}L</div>
                <div className="text-xs text-secondary mt-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span> 12.5% vs last month
                </div>
              </div>

              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-start mb-md">
                  <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Conv. Rate</span>
                  <span className="material-symbols-outlined text-primary">analytics</span>
                </div>
                <div className="text-2xl font-bold text-primary">34.2%</div>
                <div className="text-xs text-secondary mt-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span> 4.1% vs last month
                </div>
              </div>

              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-start mb-md">
                  <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Total Orders</span>
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                </div>
                <div className="text-2xl font-bold text-primary">1,482</div>
                <div className="text-xs text-on-surface-variant mt-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">remove</span> No change
                </div>
              </div>

              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-start mb-md">
                  <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">Avg. Order</span>
                  <span className="material-symbols-outlined text-primary">receipt</span>
                </div>
                <div className="text-2xl font-bold text-primary">₹2,887</div>
                <div className="text-xs text-error mt-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_downward</span> 2.3% vs last month
                </div>
              </div>
            </section>

            <section className="grid grid-cols-12 gap-lg">
              {/* Left Column: Live Agent thoughts & Live interactions */}
              <div className="col-span-12 lg:col-span-4 space-y-lg">
                <div className="glass-ai p-lg rounded-xl shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="material-symbols-outlined text-secondary animate-pulse">auto_awesome</span>
                    <span className="font-data-mono text-xs text-secondary uppercase tracking-wider font-bold">SALES_AGENT_LIVE</span>
                  </div>
                  <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden mb-md">
                    <div className="shimmer h-full w-full"></div>
                  </div>
                  <div className="font-data-mono text-xs text-on-surface space-y-xs">
                    {consoleLogs.map((log, index) => (
                      <div className="flex items-start gap-2" key={index}>
                        <span className="opacity-40 shrink-0">&gt;&gt;</span>
                        <span className={index === consoleLogs.length - 1 ? "text-secondary font-bold" : ""}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm h-[500px] flex flex-col">
                  <div className="flex items-center justify-between mb-lg">
                    <h3 className="font-bold text-primary">Live Interactions</h3>
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">forum</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-md pr-xs scrollbar-hide">
                    {salesInteractions.map((item, idx) => (
                      <div className="p-sm border border-outline-variant rounded-lg bg-surface-container-low/50" key={idx}>
                        <div className="flex justify-between items-center mb-xs">
                          <span className="font-bold text-sm text-primary">{item.customer}</span>
                          <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-[9px] font-bold font-data-mono">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant italic mt-1">"{item.text}"</p>
                        <div className="mt-sm text-[10px] text-outline flex justify-between font-bold">
                          <span>{item.time}</span>
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.statusColor}`}></span> {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Quotations & Confirmed Orders */}
              <div className="col-span-12 lg:col-span-8 space-y-lg">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                  <div className="p-lg border-b border-outline-variant flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-primary">Pending AI Quotations</h3>
                      <p className="text-xs text-on-surface-variant mt-1">Review and approve high-value quotes before delivery.</p>
                    </div>
                    <div className="bg-primary-fixed/40 text-on-primary-fixed border border-outline-variant/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {pendingQuotations.filter(q => q.status === "PENDING").length} Reviews Pending
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-low text-label-caps font-label-caps text-xs font-bold text-on-surface-variant">
                        <tr>
                          <th className="px-lg py-md">Customer</th>
                          <th className="px-lg py-md">Value</th>
                          <th className="px-lg py-md">Status</th>
                          <th className="px-lg py-md">Confidence</th>
                          <th className="px-lg py-md text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {pendingQuotations.map(quote => (
                          <tr className="hover:bg-surface-container-low/30 transition-colors text-sm" key={quote.id}>
                            <td className="px-lg py-md">
                              <div className="font-bold text-primary">{quote.customer}</div>
                              <div className="text-xs text-outline font-semibold">{quote.id}</div>
                            </td>
                            <td className="px-lg py-md font-data-mono font-bold text-primary">{quote.value}</td>
                            <td className="px-lg py-md">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${quote.statusBg}`}>
                                {quote.statusText}
                              </span>
                            </td>
                            <td className="px-lg py-md">
                              <div className="flex items-center gap-sm">
                                <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden shrink-0">
                                  <div className="bg-secondary h-full rounded-full" style={{ width: `${quote.confidence}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant font-data-mono">{quote.confidence}%</span>
                              </div>
                            </td>
                            <td className="px-lg py-md text-right font-bold text-secondary text-sm">
                              {quote.status === "PENDING" ? (
                                <button className="hover:underline transition-all">{quote.actionText}</button>
                              ) : (
                                <span className="text-on-surface-variant">{quote.actionText}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                  <div className="p-lg border-b border-outline-variant flex items-center justify-between bg-surface-container-low/20">
                    <h3 className="font-bold text-primary">Recent Confirmed Orders</h3>
                    <button className="text-secondary text-xs font-bold flex items-center gap-1 hover:underline">
                      View All <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                  <div className="p-lg grid grid-cols-1 md:grid-cols-3 gap-md">
                    {confirmedOrders.map((order, idx) => (
                      <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant hover:shadow-sm transition-all" key={idx}>
                        <div className="flex justify-between mb-sm text-xs font-bold">
                          <span className="font-data-mono text-outline">{order.id}</span>
                          <span className={`${order.statusColor} uppercase`}>{order.status}</span>
                        </div>
                        <div className="font-bold text-sm text-primary mb-1">{order.customer}</div>
                        <div className="text-sm text-primary font-bold font-data-mono">{order.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* --- RECOVERY AGENT DASHBOARD --- */}
        {activeTab === "Recovery Agent" && (
          <div className="space-y-lg animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-headline-lg text-2xl font-bold text-primary">Recovery Dashboard</h2>
                <p className="text-sm text-on-surface-variant font-semibold">AI-Driven collections and automated receivables management.</p>
              </div>
              <div className="flex gap-sm">
                <button 
                  onClick={async () => {
                    await fetch("/api/cron/reminders", { method: "POST" });
                    await refreshData();
                  }}
                  className="flex items-center gap-xs px-md py-2 border border-outline text-on-surface rounded-lg hover:bg-white transition-all font-bold text-xs text-primary bg-white"
                >
                  <span className="material-symbols-outlined text-[16px]">schedule</span> Run Reminders Cron
                </button>
                <button className="flex items-center gap-xs px-md py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all font-bold text-xs">
                  <span className="material-symbols-outlined text-[16px]">add</span> Create Invoice
                </button>
              </div>
            </div>

            {/* KPIs & Aging */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-md">
                <div className="bg-white p-md rounded-xl border border-outline-variant shadow-sm hover:border-secondary transition-colors cursor-default">
                  <p className="font-label-caps text-[10px] text-on-surface-variant font-bold mb-base">RECOVERY RATE</p>
                  <div className="flex items-end gap-xs">
                    <span className="text-xl font-bold text-primary">94.2%</span>
                    <span className="text-secondary text-[10px] font-bold mb-1 flex items-center">
                      <span className="material-symbols-outlined text-xs">arrow_upward</span> 2.4%
                    </span>
                  </div>
                  <div className="mt-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: "94.2%" }}></div>
                  </div>
                </div>

                <div className="bg-white p-md rounded-xl border border-outline-variant shadow-sm hover:border-secondary transition-colors cursor-default">
                  <p className="font-label-caps text-[10px] text-on-surface-variant font-bold mb-base">TOTAL OVERDUE</p>
                  <div className="flex items-end gap-xs">
                    <span className="text-xl font-bold text-primary">₹{pendingInvoicesVal.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-sm font-bold">{invoices.filter(i => i.status === "Overdue").length} pending invoices</p>
                </div>

                <div className="bg-white p-md rounded-xl border border-outline-variant shadow-sm hover:border-secondary transition-colors cursor-default">
                  <p className="font-label-caps text-[10px] text-on-surface-variant font-bold mb-base">PAID VIA AI</p>
                  <div className="flex items-end gap-xs">
                    <span className="text-xl font-bold text-primary">158</span>
                  </div>
                  <p className="text-xs text-secondary mt-sm font-bold">85% total volume</p>
                </div>

                <div className="bg-white p-md rounded-xl border border-outline-variant shadow-sm hover:border-secondary transition-colors cursor-default">
                  <p className="font-label-caps text-[10px] text-on-surface-variant font-bold mb-base">ACTIVE REMINDERS</p>
                  <div className="flex items-end gap-xs">
                    <span className="text-xl font-bold text-primary">42</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-sm font-bold">Next batch in 12m</p>
                </div>
              </div>

              {/* Overdue Buckets Visual */}
              <div className="lg:col-span-4 glass-ai p-md rounded-xl shadow-lg border border-secondary/20">
                <div className="flex justify-between items-start mb-md">
                  <h3 className="font-label-caps text-[10px] text-primary font-bold">AGING_BUCKETS_VISUAL</h3>
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div className="space-y-sm">
                  {calculatedBuckets.map((bucket, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1 font-bold">
                        <span className="text-primary">{bucket.label}</span>
                        <span className="font-data-mono text-on-surface-variant">{bucket.amount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bucket.bgClass}`} style={{ width: `${bucket.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-md text-[9px] text-on-surface-variant font-bold font-data-mono text-center">
                  AI Projected Recovery: 91% within 14 days
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
              {/* Reminder Stream timeline logs */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-outline-variant flex flex-col h-[520px] shadow-sm">
                <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/20">
                  <h3 className="font-label-caps text-xs text-primary font-bold">REMINDER_STREAM</h3>
                  <button className="text-secondary text-xs font-bold hover:underline">View All</button>
                </div>
                <div className="flex-1 overflow-y-auto p-md space-y-md scrollbar-hide">
                  {reminderLogs.map((log) => (
                    <div className="flex gap-md group" key={log.id}>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          log.tone === "FRIENDLY" ? "bg-surface-container" :
                          log.tone === "FIRM" ? "bg-secondary-container" : "bg-error-container"
                        }`}>
                          <span className={`material-symbols-outlined text-sm ${
                            log.tone === "FRIENDLY" ? "text-on-surface-variant" :
                            log.tone === "FIRM" ? "text-secondary" : "text-error"
                          }`}>
                            {log.tone === "FRIENDLY" ? "send" : log.tone === "FIRM" ? "mail" : "priority_high"}
                          </span>
                        </div>
                        <div className="w-[1px] flex-grow bg-outline-variant/30 mt-xs"></div>
                      </div>
                      <div className="pb-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-primary">{log.customer}</span>
                          <span className="text-[9px] text-outline font-semibold font-data-mono">{log.time}</span>
                        </div>
                        <div className="flex gap-xs mb-sm">
                          <span className="px-1.5 py-0.5 bg-surface-container rounded text-[9px] font-bold text-on-surface-variant">TONE: {log.tone}</span>
                          <span className="px-1.5 py-0.5 bg-secondary/15 rounded text-[9px] font-bold text-secondary">CHANNEL: {log.channel}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant italic leading-relaxed">"{log.text}"</p>
                        {log.status && (
                          <div className="mt-sm flex items-center gap-xs font-bold text-[10px] text-secondary">
                            <span className="material-symbols-outlined text-xs">{log.statusIcon}</span>
                            <span>{log.status}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watchlist & Ledger Invoices */}
              <div className="lg:col-span-8 space-y-lg">
                <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                  <div className="p-md bg-error/5 border-b border-outline-variant flex justify-between items-center">
                    <h3 className="font-label-caps text-xs text-error flex items-center gap-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">warning</span> HIGH_RISK_WATCHLIST
                    </h3>
                    <span className="text-[10px] font-bold font-data-mono text-on-surface-variant">
                      {highRiskWatchlist.length} CUSTOMERS FLAGGED
                    </span>
                  </div>
                  <div className="divide-y divide-outline-variant">
                    {highRiskWatchlist.map((c, index) => (
                      <div className="p-md flex items-center justify-between hover:bg-surface-container-low transition-colors text-sm" key={index}>
                        <div className="flex items-center gap-md">
                          <div className="w-9 h-9 rounded-full bg-error-container text-error flex items-center justify-center font-bold text-xs shadow-sm">
                            {c.initials}
                          </div>
                          <div>
                            <p className="font-bold text-primary">{c.name}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5 font-semibold">{c.invoicesCount} overdue invoices • {c.totalAmount} total</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-lg">
                          <div className="text-right">
                            <p className={`font-data-mono text-xs font-bold ${c.riskColor}`}>RISK: {c.risk}</p>
                            <p className="text-[9px] text-on-surface-variant uppercase tracking-tighter font-bold">History: {c.history}</p>
                          </div>
                          <button className="p-xs hover:bg-surface-container-highest rounded-full transition-colors text-on-surface-variant">
                            <span className="material-symbols-outlined text-base">more_vert</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                  <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/20">
                    <h3 className="font-label-caps text-xs text-primary font-bold">ALL_INVOICES_LEDGER</h3>
                    <div className="flex gap-sm">
                      <button className="px-2 py-0.5 rounded border border-outline-variant text-[11px] font-bold bg-white text-on-surface">Recent First</button>
                      <button className="px-2 py-0.5 rounded border border-outline-variant text-[11px] font-bold bg-white text-on-surface">Status: Overdue</button>
                    </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-outline-variant text-xs font-bold text-on-surface-variant">
                      <tr>
                        <th className="p-md font-label-caps uppercase tracking-wider text-[10px]">Invoice ID</th>
                        <th className="p-md font-label-caps uppercase tracking-wider text-[10px]">Customer</th>
                        <th className="p-md font-label-caps uppercase tracking-wider text-[10px]">Amount</th>
                        <th className="p-md font-label-caps uppercase tracking-wider text-[10px]">Due Date</th>
                        <th className="p-md font-label-caps uppercase tracking-wider text-[10px]">AI Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {invoices.map((inv) => (
                        <tr className="hover:bg-surface-container-lowest transition-colors text-sm" key={inv.id}>
                          <td className="p-md font-data-mono font-bold text-primary">{inv.id}</td>
                          <td className="p-md font-bold text-primary">{inv.customer}</td>
                          <td className="p-md font-bold text-primary">₹{inv.amount.toLocaleString("en-IN")}</td>
                          <td className={`p-md font-bold ${inv.status === "Overdue" ? "text-error" : inv.status === "Paid" ? "text-secondary" : "text-on-surface-variant"}`}>
                            {inv.dueDate}
                          </td>
                          <td className="p-md">
                            <div className="flex items-center gap-xs text-xs font-semibold">
                              {inv.actionType === "pulse_teal" && (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary pulse-dot"></span>
                                  <span className="text-secondary font-bold">{inv.actionText}</span>
                                </>
                              )}
                              {inv.actionType === "schedule" && (
                                <>
                                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">schedule</span>
                                  <span className="text-on-surface-variant">{inv.actionText}</span>
                                </>
                              )}
                              {inv.actionType === "check_circle" && (
                                <>
                                  <span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                  <span className="text-secondary">{inv.actionText}</span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-md bg-surface-container-low/30 flex justify-center border-t border-outline-variant">
                    <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">Load 20 More Records</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* --- INVENTORY AGENT DASHBOARD --- */}
        {activeTab === "Inventory Agent" && (
          <div className="space-y-lg animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-headline-lg text-2xl font-bold text-primary">Inventory Agent Dashboard</h2>
                <p className="text-sm text-on-surface-variant font-semibold">Autonomous stock auditing, critical threshold checks, and restock recommendation cycles.</p>
              </div>
            </div>

            {/* KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-lg">
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                <p className="text-label-caps text-xs text-on-surface-variant font-bold mb-xs uppercase">TOTAL ITEMS</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-primary">1,248</h2>
                  <span className="text-secondary text-[11px] font-bold bg-secondary-container px-2 py-0.5 rounded-full">+4%</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                <p className="text-label-caps text-xs text-error font-bold mb-xs uppercase">LOW STOCK ALERTS</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-error">{lowStockAlertsCount}</h2>
                  <span className="material-symbols-outlined text-error animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                <p className="text-label-caps text-xs text-on-surface-variant font-bold mb-xs uppercase">SLOW MOVING ITEMS</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-primary">28</h2>
                  <span className="text-outline text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded-full">ACTION REQ</span>
                </div>
              </div>
              <div className="glass-ai p-md rounded-xl shadow-sm hover:shadow-md transition-all">
                <p className="text-label-caps text-xs text-secondary font-bold mb-xs uppercase">PREDICTED STOCKOUTS</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-2xl font-bold text-primary">07</h2>
                  <span className="text-[10px] text-on-secondary-fixed-variant font-bold">NEXT 7 DAYS</span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              {/* Stock Pulse Table */}
              <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                <div className="flex justify-between items-center mb-lg">
                  <h3 className="font-bold text-primary text-base">Stock Level Pulse</h3>
                  <div className="flex gap-sm">
                    <button className="px-3 py-1 text-xs font-bold border border-outline-variant rounded hover:bg-surface-container transition-colors">EXPORT</button>
                    <button className="px-3 py-1 text-xs font-bold bg-primary text-white rounded hover:opacity-90 transition-opacity">MANAGE ALL</button>
                  </div>
                </div>
                <div className="space-y-md">
                  {products.map((row, idx) => (
                    <div className="grid grid-cols-12 items-center gap-md pb-md border-b border-outline-variant/30" key={idx}>
                      <div className="col-span-4">
                        <p className={`font-bold text-sm ${row.statusColor === "bg-error" ? "text-error" : "text-primary"}`}>{row.name}</p>
                        <p className="text-xs text-on-surface-variant font-semibold mt-0.5">{row.category}</p>
                      </div>
                      <div className="col-span-5 flex flex-col gap-1">
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${row.statusColor}`} style={{ width: `${row.percent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                          <span className={row.statusColor === "bg-error" ? "text-error" : "text-secondary"}>{row.statusColor === "bg-error" ? `CRITICAL (${row.percent}%)` : `${row.percent}% STOCK`}</span>
                          <span className="text-on-surface-variant">{row.stockText}</span>
                        </div>
                      </div>
                      <div className="col-span-3 text-right">
                        <p className={`text-[10px] font-bold ${row.statusColor === "bg-error" ? "text-error" : "text-on-surface-variant"}`}>COVERAGE</p>
                        <p className={`text-base font-bold ${row.statusColor === "bg-error" ? "text-error" : "text-primary"}`}>{row.coverageDays} <span className="text-[10px] font-semibold text-on-surface-variant">DAYS</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demand Forecasting */}
              <div className="glass-ai rounded-xl p-lg flex flex-col shadow-sm">
                <div className="flex items-center gap-sm mb-lg">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                  <h3 className="font-bold text-primary text-base">AI Demand Forecast</h3>
                </div>
                <div className="flex-1 space-y-lg">
                  <div className="h-32 flex items-end justify-between px-md gap-sm border-b border-secondary/20 pb-1">
                    <div className="w-8 bg-primary/20 h-[40%] rounded-t-sm" title="Actual"></div>
                    <div className="w-8 bg-secondary h-[55%] rounded-t-sm shadow-md" title="Predicted"></div>
                    <div className="w-8 bg-primary/20 h-[30%] rounded-t-sm"></div>
                    <div className="w-8 bg-secondary h-[45%] rounded-t-sm shadow-md"></div>
                    <div className="w-8 bg-primary/20 h-[60%] rounded-t-sm"></div>
                    <div className="w-8 bg-secondary h-[85%] rounded-t-sm shadow-md"></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-on-surface-variant px-sm">
                    <span>WK 14</span>
                    <span>WK 15</span>
                    <span>WK 16 (Forecast)</span>
                  </div>
                  <div className="bg-white/40 p-md rounded-lg border border-secondary/15">
                    <p className="font-data-mono text-[11px] text-on-secondary-fixed-variant leading-relaxed">
                      <span className="text-secondary font-bold">Insight:</span> Velocity for "Cold Beverages" is trending +12% week-on-week. AI recommends increasing safety stock for weekend peaks.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Row */}
            <section className="grid grid-cols-1 lg:grid-cols-5 gap-lg">
              
              {/* Suggested Reorders */}
              <div className="lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">shopping_cart_checkout</span>
                    <h3 className="font-bold text-primary">Reorder Recommendations</h3>
                  </div>
                  <button className="bg-secondary text-white px-md py-sm rounded-lg font-bold text-xs hover:bg-on-secondary-fixed-variant transition-colors">Approve All</button>
                </div>
                <div className="p-lg">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-label-caps font-label-caps text-[10px] text-on-surface-variant border-b border-outline-variant font-bold">
                        <th className="pb-md">ITEM</th>
                        <th className="pb-md">SUGGESTED</th>
                        <th className="pb-md">REASONING</th>
                        <th className="pb-md text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {inventoryReorders.map((re, idx) => (
                        <tr key={idx} className="text-sm">
                          <td className="py-md">
                            <p className="font-bold text-primary">{re.item}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{re.packSize}</p>
                          </td>
                          <td className="py-md">
                            <p className="text-base font-bold text-secondary">{re.suggested} <span className="text-xs font-semibold text-on-surface-variant">units</span></p>
                          </td>
                          <td className="py-md">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${re.badgeClass}`}>
                              {re.reasoning}
                            </span>
                          </td>
                          <td className="py-md text-right">
                            <button className="material-symbols-outlined text-outline hover:text-secondary transition-colors text-lg">add_circle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Activity Log */}
              <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-sm mb-lg">
                    <span className="material-symbols-outlined text-on-surface-variant">history</span>
                    <h3 className="font-bold text-primary">Stock Activity</h3>
                  </div>
                  <div className="space-y-md">
                    {stockActivityLog.map((log, idx) => (
                      <div className="flex gap-md" key={idx}>
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
                            log.isAdd ? "bg-secondary-container text-secondary" : 
                            log.type.includes("Manual") ? "bg-surface-container text-on-surface-variant" : "bg-error-container text-error"
                          }`}>
                            <span className="material-symbols-outlined text-sm font-semibold">{log.isAdd ? "add" : log.type.includes("Manual") ? "inventory" : "remove"}</span>
                          </div>
                          {idx !== stockActivityLog.length - 1 && <div className="w-[1px] flex-grow bg-outline-variant/35 my-1"></div>}
                        </div>
                        <div className="pb-2">
                          <p className="font-bold text-sm text-primary">{log.type}</p>
                          <p className="text-xs text-on-surface-variant font-semibold mt-0.5">{log.detail}</p>
                          <p className="text-[10px] text-outline font-semibold font-data-mono mt-1">{log.time} • {log.ref}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full mt-lg text-secondary text-[11px] font-bold font-data-mono hover:underline tracking-wider text-center border-t border-outline-variant/35 pt-md">
                  VIEW FULL LEDGER
                </button>
              </div>
            </section>
          </div>
        )}

      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setCommandOpen(true)}
        className="fixed bottom-lg right-lg bg-primary hover:bg-secondary text-white p-lg rounded-full shadow-2xl flex items-center gap-md hover:scale-105 transition-all z-50 group duration-300"
      >
        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
          smart_toy
        </span>
        <span className="font-bold pr-1">Ask AI</span>
      </button>

      {/* AI Command Modal */}
      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white border border-outline-variant rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100 flex flex-col">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                <span className="font-bold text-lg text-primary">Execute AI Command</span>
              </div>
              <button onClick={() => setCommandOpen(false)} className="p-1 hover:bg-surface-container-high rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSendCommand} className="p-lg space-y-md">
              <p className="text-sm text-on-surface-variant">
                Instruct the active AI employees. Your instruction will be translated into autonomous actions, and status updates will report directly to the activity feed.
              </p>
              
              <div className="space-y-sm">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Select Target Agent
                </label>
                <div className="grid grid-cols-3 gap-sm">
                  {["Sales Agent", "Recovery Agent", "Inventory Agent"].map(agentName => (
                    <button
                      key={agentName}
                      type="button"
                      onClick={() => setActiveTab(agentName as any)}
                      className={`px-3 py-2 border rounded-lg text-xs font-semibold transition-all ${
                        activeTab === agentName 
                          ? "bg-secondary-container border-secondary text-on-secondary-container" 
                          : "border-outline-variant hover:bg-surface-container"
                      }`}
                    >
                      {agentName.replace(" Agent", "")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-sm">
                <label htmlFor="command" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Instruction Description
                </label>
                <textarea 
                  id="command"
                  rows={3} 
                  required
                  value={commandText}
                  onChange={(e) => setCommandText(e.target.value)}
                  placeholder="e.g., Draft a pricing message for Ramesh Kumar giving him a ₹5 per unit discount if he orders 100 more spools."
                  className="w-full border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary bg-white text-on-background"
                />
              </div>

              <div className="flex justify-end gap-md pt-2">
                <button
                  type="button"
                  onClick={() => setCommandOpen(false)}
                  className="px-4 py-2 border border-outline-variant hover:bg-surface-container rounded-lg text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-semibold transition-all shadow-md"
                >
                  Send Command
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Chat Inspector Modal */}
      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white border border-outline-variant rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all scale-100 flex flex-col h-[80vh]">
            
            {/* Header */}
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg">
                  {selectedChat.customerName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-primary text-base flex items-center gap-xs">
                    {selectedChat.customerName}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container uppercase animate-pulse">
                      {selectedChat.agent}
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant">{selectedChat.phone}</div>
                </div>
              </div>
              <button onClick={() => setSelectedChat(null)} className="p-1 hover:bg-surface-container-high rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-grow p-lg bg-surface-container-low overflow-y-auto space-y-md flex flex-col scrollbar-hide">
              {selectedChat.messages.map((msg, index) => {
                const isDraft = msg.text.includes("(Draft)");
                return (
                  <div 
                    key={index} 
                    className={`max-w-[85%] p-md rounded-2xl text-sm ${
                      msg.sender === "customer" 
                        ? "bg-white text-on-background border border-outline-variant self-start rounded-tl-none shadow-sm" 
                        : isDraft 
                        ? "bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-container/30 self-end rounded-tr-none shadow-sm"
                        : "bg-secondary-container text-on-secondary-container self-end rounded-tr-none shadow-sm"
                    }`}
                  >
                    <div className="font-semibold text-[10px] opacity-75 mb-1 flex items-center justify-between gap-xl">
                      <span>{msg.sender === "customer" ? "Customer" : "AI Agent"}</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="leading-relaxed font-semibold">
                      {msg.text}
                    </div>
                    {isDraft && (
                      <div className="mt-xs pt-xs border-t border-tertiary/20 flex items-center gap-xs text-[10px] font-bold text-tertiary">
                        <span className="w-1.5 h-1.5 bg-tertiary rounded-full pulse-dot animate-ping"></span>
                        Pending Human Approval
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Approvals/Inputs Footer */}
            <div className="p-lg border-t border-outline-variant bg-white space-y-md">
              {selectedChat.messages.length > 0 && selectedChat.messages[selectedChat.messages.length - 1].text.includes("(Draft)") ? (
                <div className="space-y-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-tertiary uppercase tracking-wider flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">edit_note</span>
                      Approve or Override AI Draft Response
                    </label>
                    <span className="text-[10px] text-on-surface-variant font-semibold">
                      Pressing Send will deliver this message on WhatsApp
                    </span>
                  </div>
                  
                  <textarea 
                    rows={2} 
                    value={chatOverrideText}
                    onChange={(e) => setChatOverrideText(e.target.value)}
                    className="w-full border border-outline-variant focus:border-tertiary focus:ring-1 focus:ring-tertiary rounded-lg p-md text-sm bg-white text-on-background"
                  />

                  <div className="flex justify-end gap-md pt-1">
                    <button
                      onClick={() => {
                        // Reject draft
                        setConversations(prev => 
                          prev.map(c => {
                            if (c.id === selectedChat.id) {
                              return {
                                ...c,
                                messages: c.messages.slice(0, c.messages.length - 1),
                                lastMessage: c.messages[c.messages.length - 2]?.text || ""
                              };
                            }
                            return c;
                          })
                        );
                        setSelectedChat(null);
                      }}
                      className="px-4 py-2 border border-error text-error hover:bg-error-container/20 rounded-lg text-sm font-semibold transition-all"
                    >
                      Reject Draft
                    </button>
                    <button
                      onClick={() => handleSendDraft(selectedChat.id)}
                      className="px-4 py-2 bg-secondary hover:bg-secondary-container hover:text-on-secondary-container text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      Approve and Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-md items-center">
                  <input 
                    type="text" 
                    placeholder="Type a message to manually take over the chat..." 
                    value={chatOverrideText}
                    onChange={(e) => setChatOverrideText(e.target.value)}
                    className="flex-grow border border-outline-variant rounded-lg px-md py-sm text-sm focus:outline-none focus:ring-1 focus:ring-secondary bg-white text-on-background"
                  />
                  <button 
                    onClick={() => handleSendDraft(selectedChat.id)}
                    className="px-md py-sm bg-primary hover:bg-secondary text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
