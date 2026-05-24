import { prisma } from "./db";

// Hardcoded pricing for products since Product model doesn't have a price field
const PRODUCT_PRICES: Record<string, number> = {
  "P-1": 3500, // Wireless Headphones Pro
  "P-2": 250,  // Organic Almond Milk
  "P-3": 8000, // Smart Watch Series 5
  "P-4": 150,  // AA Battery Pack
  "P-5": 3200, // Executive Pro Chair
};

interface AgentResponse {
  text: string;
  agent: "Sales Agent" | "Recovery Agent" | "AI Dispatcher";
  intent: string;
}

/**
 * Main orchestrator entry point. Analyzes message text, queries SQLite context, and returns response.
 */
export async function runOrchestrator(conversationId: string, text: string): Promise<AgentResponse> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const products = await prisma.product.findMany();
  const invoices = await prisma.invoice.findMany({
    where: { customer: { contains: conversation.customerName } },
  });

  // Try using live LLM if API Key is configured
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const llmResponse = await runLLMOrchestration(apiKey, conversation.customerName, conversation.messages, text, products, invoices);
      if (llmResponse) {
        return llmResponse;
      }
    } catch (e) {
      console.error("LLM Orchestration failed, falling back to local rule-engine:", e);
    }
  }

  // Fallback to local high-fidelity rule-based routing engine
  return runRuleEngine(text, conversation.customerName, products, invoices);
}

/**
 * Local high-fidelity rule-based router and generator
 */
function runRuleEngine(
  text: string,
  customerName: string,
  products: any[],
  invoices: any[]
): AgentResponse {
  const lowerText = text.toLowerCase();

  // Detect Agent Type
  const isSalesWord = /chair|headphone|watch|milk|battery|catalog|price|buy|order|product|cost|stock|inventory|recommend|spec/.test(lowerText);
  const isRecoveryWord = /invoice|pay|due|remind|money|delay|extend|late|overdue|bill|settle|account/.test(lowerText);

  // 1. RECOVERY AGENT FLOW
  if (isRecoveryWord || (!isSalesWord && invoices.length > 0)) {
    const activeInvoice = invoices.find(inv => inv.status !== "Paid") || invoices[0];
    
    if (activeInvoice) {
      const amountStr = `₹${activeInvoice.amount.toLocaleString("en-IN")}`;
      const isExtensionQuery = /extend|delay|time|wait|tomorrow|next week|cash flow|next month/.test(lowerText);
      const isLinkQuery = /link|portal|where|how|pay/.test(lowerText);

      if (isExtensionQuery) {
        return {
          text: `Understood, ${customerName}. I can temporarily extend the payment due date for Invoice ${activeInvoice.id} (${amountStr}) by 7 days to give you some breathing room. Does that work for you?`,
          agent: "Recovery Agent",
          intent: "PAYMENT_EXTENSION",
        };
      }

      if (isLinkQuery) {
        return {
          text: `Here is the secure payment link for your invoice ${activeInvoice.id} (${amountStr}): pay.dukanmitra.in/${activeInvoice.id.replace("#", "")}. Please complete the payment.`,
          agent: "Recovery Agent",
          intent: "PAYMENT_LINK",
        };
      }

      return {
        text: `Hi ${customerName}! This is the Recovery Agent. Friendly reminder that Invoice ${activeInvoice.id} (${amountStr}) is currently ${activeInvoice.status} (due: ${activeInvoice.dueDate}). Let me know if you would like to extend the due date or if you need the payment link.`,
        agent: "Recovery Agent",
        intent: "PAYMENT_REMINDER",
      };
    }
  }

  // 2. SALES AGENT FLOW
  let matchedProduct = null;
  if (lowerText.includes("chair")) matchedProduct = products.find(p => p.id === "P-5" || p.name.toLowerCase().includes("chair"));
  else if (lowerText.includes("headphone")) matchedProduct = products.find(p => p.id === "P-1" || p.name.toLowerCase().includes("headphone"));
  else if (lowerText.includes("watch")) matchedProduct = products.find(p => p.id === "P-3" || p.name.toLowerCase().includes("watch"));
  else if (lowerText.includes("milk") || lowerText.includes("almond")) matchedProduct = products.find(p => p.id === "P-2" || p.name.toLowerCase().includes("milk"));
  else if (lowerText.includes("battery")) matchedProduct = products.find(p => p.id === "P-4" || p.name.toLowerCase().includes("battery"));

  if (matchedProduct) {
    const price = PRODUCT_PRICES[matchedProduct.id] || 500;
    const priceStr = `₹${price.toLocaleString("en-IN")}`;
    
    if (matchedProduct.stock === 0) {
      return {
        text: `Hi ${customerName}! We are currently out of stock for the "${matchedProduct.name}". I can notify you as soon as we restock or suggest alternatives from our ${matchedProduct.category} category.`,
        agent: "Sales Agent",
        intent: "STOCKOUT_ALERT",
      };
    }

    if (matchedProduct.stock <= matchedProduct.threshold) {
      return {
        text: `Hi ${customerName}! We have the "${matchedProduct.name}" in stock, but stock is running low (${matchedProduct.stock} left). The price is ${priceStr} each. Shall I reserve a few units and draft an invoice for you?`,
        agent: "Sales Agent",
        intent: "LOW_STOCK_SALES",
      };
    }

    return {
      text: `Hi ${customerName}! Yes, we have the "${matchedProduct.name}" in stock (${matchedProduct.stock} units available). The price is ${priceStr} each. Shall I generate a formal quotation or log an order for you?`,
      agent: "Sales Agent",
      intent: "PRODUCT_QUERY",
    };
  }

  const isCatalogQuery = /catalog|product|stock|price|list|item|what do you have/.test(lowerText);
  if (isCatalogQuery) {
    const catalogList = products.map(p => {
      const price = PRODUCT_PRICES[p.id] || 500;
      return `- ${p.name}: ₹${price.toLocaleString("en-IN")} (${p.stock > 0 ? "In Stock" : "Out of Stock"})`;
    }).join("\n");

    return {
      text: `Hi ${customerName}! Here is our current product catalog:\n${catalogList}\n\nLet me know which products you'd like to inquire about or order!`,
      agent: "Sales Agent",
      intent: "CATALOG_QUERY",
    };
  }

  // 3. FALLBACK GENERAL AI DISPATCHER
  return {
    text: `Hello ${customerName}! I am your DukanMitra SME automated manager. I can assist you with checking stock, recommendations, quotations, or payment extensions. What can I do for you today?`,
    agent: "AI Dispatcher",
    intent: "GENERAL_GREETING",
  };
}

/**
 * Remote LLM execution via Gemini API
 */
async function runLLMOrchestration(
  apiKey: string,
  customerName: string,
  messages: any[],
  newText: string,
  products: any[],
  invoices: any[]
): Promise<AgentResponse | null> {
  const productsList = products.map(p => {
    const price = PRODUCT_PRICES[p.id] || 500;
    return `- ID: ${p.id}, Name: ${p.name}, Stock: ${p.stock}, Price: ₹${price}, Category: ${p.category}, Status: ${p.status}`;
  }).join("\n");

  const invoicesList = invoices.map(i => {
    return `- ID: ${i.id}, Customer: ${i.customer}, Amount: ₹${i.amount}, Due: ${i.dueDate}, Status: ${i.status}`;
  }).join("\n");

  const history = messages.map(m => `${m.sender === "customer" ? "Customer" : "AI"}: ${m.text}`).join("\n");

  const prompt = `You are the DukanMitra AI Agent for an SME store. 
You act as one of two roles:
1. Sales Agent: assist customer with product recommendations, catalog, prices, ordering.
2. Recovery Agent: assist customer with invoice follow-ups, payment links, due extensions.

Here is the current business state:
Products in stock:
${productsList}

Invoices:
${invoicesList}

Active Conversation history with customer ${customerName}:
${history}

Customer's new message: "${newText}"

Determine which agent role you should take (Sales Agent or Recovery Agent).
Then draft a professional, concise, and helpful response on WhatsApp. 
If the customer asks to order/buy products, recommend items, check stock, or ask about price, answer based on the products listed above. Offer to generate a quotation if they want to order.
If they ask about invoices, payments, or extensions, answer based on the invoices list. Offer a payment link or a 7-day extension if they request one.
Ensure your response is friendly, helpful, and formatted for WhatsApp.
Do not add any markdown headings, bold names, or other heavy layout syntax. Keep it under 3-4 sentences.
Do NOT append "(Draft)" to your text, as the application will suffix it automatically.

Your output MUST be a JSON object of this exact shape:
{
  "text": "Your drafted message text here",
  "agent": "Sales Agent" or "Recovery Agent",
  "intent": "SHORT_UPPERCASE_INTENT_CODE"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const result = JSON.parse(rawText.trim());
  return {
    text: result.text,
    agent: result.agent === "Recovery Agent" ? "Recovery Agent" : "Sales Agent",
    intent: result.intent || "LLM_GENERATED"
  };
}
