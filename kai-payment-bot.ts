#!/usr/bin/env bun
/**
 * KAI Payment Bot - Verifies USDT deposits to Binance
 * & auto-delivers products/services
 * 
 * All payments go to:
 * BEP20: 0xb0e9e74e720ff587a5097595f2ff5917bbb84838
 * TRC20: TDUmDLUgXFHcNiGQ6TeCf65pvwqditYi21
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8268927401:AAEdXA1d0RwvI0-8oP55XUHCekGE6jINfRg";
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "-1003988793545";
const ADMIN_ID = "6246573228"; // Shardick's Telegram ID

const WALLETS = {
  BEP20: "0xb0e9e74e720ff587a5097595f2ff5917bbb84838",
  TRC20: "TDUmDLUgXFHcNiGQ6TeCf65pvwqditYi21"
};

// Products catalog
const PRODUCTS = {
  vip_monthly: {
    name: "VIP Signal Channel - Monthly",
    price: 50,
    currency: "USDT",
    network: "TRC20",
    duration: "30 days",
    delivery: "add_to_vip_channel",
    description: "Premium trading signals for XAUUSD, XAGUSD, V75"
  },
  vip_lifetime: {
    name: "VIP Signal Channel - Lifetime",
    price: 200,
    currency: "USDT",
    network: "TRC20",
    duration: "forever",
    delivery: "add_to_vip_channel",
    description: "Lifetime premium signals access"
  },
  article_basic: {
    name: "SEO Article (1000 words)",
    price: 20,
    currency: "USDT",
    network: "TRC20",
    delivery: "custom_content",
    description: "Professional SEO-optimized article"
  },
  article_premium: {
    name: "Content Package (5 articles)",
    price: 80,
    currency: "USDT",
    network: "TRC20",
    delivery: "custom_content",
    description: "5 professional articles, any topic"
  },
  bot_basic: {
    name: "Custom Telegram Bot",
    price: 150,
    currency: "USDT",
    network: "TRC20",
    delivery: "custom_build",
    description: "Custom Telegram bot built by KAI"
  },
  bot_premium: {
    name: "Advanced Bot + Hosting",
    price: 500,
    currency: "USDT",
    network: "TRC20",
    delivery: "custom_build",
    description: "Advanced bot + 3 months hosting"
  },
  smm_basic: {
    name: "Social Media Growth Pack",
    price: 50,
    currency: "USDT",
    network: "TRC20",
    delivery: "instant",
    description: "1000 followers + 500 likes"
  },
  smm_premium: {
    name: "Social Media Mega Pack",
    price: 200,
    currency: "USDT",
    network: "TRC20",
    delivery: "instant",
    description: "5000 followers + 2000 likes + 1000 views"
  },
  ofm_starter: {
    name: "OFM Chat Service - Starter",
    price: 500,
    currency: "USDT",
    network: "TRC20",
    delivery: "manual_setup",
    description: "AI chatting for 1 OF model, 1 month"
  },
  ofm_pro: {
    name: "OFM Chat Service - Pro",
    price: 1500,
    currency: "USDT",
    network: "TRC20",
    delivery: "manual_setup",
    description: "AI chatting for up to 5 models, 1 month"
  },
  ebook_crypto: {
    name: "Crypto Trading Masterclass eBook",
    price: 25,
    currency: "USDT",
    network: "TRC20",
    delivery: "instant_file",
    description: "Complete guide to crypto trading"
  },
  template_pack: {
    name: "Business Templates Pack",
    price: 15,
    currency: "USDT",
    network: "TRC20",
    delivery: "instant_file",
    description: "50+ business document templates"
  }
};

// Pending payments tracker
interface Payment {
  id: string;
  user_id: number;
  username: string;
  product_id: string;
  amount: number;
  status: "pending" | "paid" | "delivered" | "expired";
  created_at: string;
  tx_hash?: string;
}

let pendingPayments: Map<string, Payment> = new Map();
const PAYMENTS_FILE = "/home/workspace/Skills/kai-learning/data/payments.json";

const fs = require("fs");

function loadPayments() {
  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PAYMENTS_FILE, "utf-8"));
      if (data.pending) {
        pendingPayments = new Map(Object.entries(data.pending));
      }
    }
  } catch (e) {
    console.error("Failed to load payments:", e);
  }
}

function savePayments() {
  try {
    const data = {
      updated: new Date().toISOString(),
      pending: Object.fromEntries(pendingPayments),
      wallet: WALLETS
    };
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to save payments:", e);
  }
}

async function sendTelegram(chatId: string, text: string, parseMode = "HTML") {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true
      })
    });
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
  }
}

function generatePaymentId(): string {
  return "PAY-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Product catalog message
function getCatalogMessage(): string {
  let msg = "🧠 <b>KAI STORE - All Products</b>\n";
  msg += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
  msg += "💰 <b>Payment:</b> USDT to Binance\n";
  msg += `📱 <b>TRC20:</b> <code>${WALLETS.TRC20}</code>\n`;
  msg += `🔗 <b>BEP20:</b> <code>${WALLETS.BEP20}</code>\n\n`;
  
  let category = "";
  const categories: Record<string, string[]> = {
    "📊 Signals": ["vip_monthly", "vip_lifetime"],
    "✍️ Content": ["article_basic", "article_premium"],
    "🤖 Bots": ["bot_basic", "bot_premium"],
    "📱 Social Media": ["smm_basic", "smm_premium"],
    "💬 OFM Service": ["ofm_starter", "ofm_pro"],
    "📚 Digital Products": ["ebook_crypto", "template_pack"]
  };
  
  for (const [cat, productIds] of Object.entries(categories)) {
    msg += `${cat}\n`;
    for (const pid of productIds) {
      const p = PRODUCTS[pid as keyof typeof PRODUCTS];
      msg += `  /buy_${pid} - ${p.name} (${p.price} USDT)\n`;
    }
    msg += "\n";
  }
  
  msg += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  msg += "💡 Send /buy_&lt;product_id&gt; to purchase\n";
  msg += "📧 Questions? Message @dicksonkagujje\n";
  
  return msg;
}

// Process purchase
async function processPurchase(userId: number, username: string, productId: string) {
  const product = PRODUCTS[productId as keyof typeof PRODUCTS];
  if (!product) {
    await sendTelegram(userId.toString(), "❌ Product not found. Send /store to see catalog.");
    return;
  }
  
  const paymentId = generatePaymentId();
  const payment: Payment = {
    id: paymentId,
    user_id: userId,
    username: username || "unknown",
    product_id: productId,
    amount: product.price,
    status: "pending",
    created_at: new Date().toISOString()
  };
  
  pendingPayments.set(paymentId, payment);
  savePayments();
  
  const wallet = product.network === "TRC20" ? WALLETS.TRC20 : WALLETS.BEP20;
  
  let msg = `🧾 <b>INVOICE</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `📦 <b>Product:</b> ${product.name}\n`;
  msg += `📝 <b>Description:</b> ${product.description}\n`;
  msg += `💰 <b>Amount:</b> ${product.price} USDT\n`;
  msg += `🌐 <b>Network:</b> ${product.network}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📤 <b>Send exactly ${product.price} USDT to:</b>\n\n`;
  msg += `<code>${wallet}</code>\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🆔 <b>Payment ID:</b> <code>${paymentId}</code>\n\n`;
  msg += `After sending, forward your tx hash or screenshot with:\n`;
  msg += `<code>/paid ${paymentId} YOUR_TX_HASH</code>\n\n`;
  msg += `⏰ Expires in 30 minutes\n`;
  
  await sendTelegram(userId.toString(), msg);
  
  // Notify admin
  await sendTelegram(ADMIN_ID, `💰 <b>NEW ORDER</b>\nUser: @${username} (${userId})\nProduct: ${product.name}\nAmount: ${product.price} USDT\nID: ${paymentId}`);
}

// Verify payment
async function verifyPayment(userId: number, paymentId: string, txHash: string) {
  const payment = pendingPayments.get(paymentId);
  if (!payment) {
    await sendTelegram(userId.toString(), "❌ Payment ID not found. It may have expired.");
    return;
  }
  
  if (payment.user_id !== userId) {
    await sendTelegram(userId.toString(), "❌ This payment belongs to another user.");
    return;
  }
  
  if (payment.status === "paid" || payment.status === "delivered") {
    await sendTelegram(userId.toString(), "✅ This payment has already been processed!");
    return;
  }
  
  // Check expiry (30 min)
  const age = Date.now() - new Date(payment.created_at).getTime();
  if (age > 30 * 60 * 1000) {
    payment.status = "expired";
    savePayments();
    await sendTelegram(userId.toString(), "❌ Payment expired. Please create a new order with /store");
    return;
  }
  
  // Mark as paid (admin verifies on Binance)
  payment.status = "paid";
  payment.tx_hash = txHash;
  savePayments();
  
  const product = PRODUCTS[payment.product_id as keyof typeof PRODUCTS];
  
  await sendTelegram(userId.toString(), 
    `✅ <b>Payment Submitted!</b>\n\n` +
    `📦 ${product.name}\n` +
    `💰 ${product.price} USDT\n` +
    `🔗 TX: ${txHash}\n\n` +
    `🔍 Verifying... You'll be notified once confirmed.\n` +
    `⏳ Usually takes 1-5 minutes.`
  );
  
  // Notify admin to verify
  await sendTelegram(ADMIN_ID,
    `🔍 <b>VERIFY PAYMENT</b>\n\n` +
    `User: @${payment.username} (${userId})\n` +
    `Product: ${product.name}\n` +
    `Amount: ${product.price} USDT\n` +
    `TX Hash: ${txHash}\n\n` +
    `Check Binance wallet then:\n` +
    `/confirm_${paymentId} or /reject_${paymentId}`
  );
}

// Confirm payment & deliver
async function confirmAndDeliver(paymentId: string) {
  const payment = pendingPayments.get(paymentId);
  if (!payment) return;
  
  payment.status = "delivered";
  savePayments();
  
  const product = PRODUCTS[payment.product_id as keyof typeof PRODUCTS];
  
  let deliveryMsg = `🎉 <b>PAYMENT CONFIRMED & DELIVERED!</b>\n\n`;
  deliveryMsg += `📦 <b>${product.name}</b>\n`;
  deliveryMsg += `💰 ${product.price} USDT - <b>RECEIVED</b>\n\n`;
  
  switch (product.delivery) {
    case "add_to_vip_channel":
      deliveryMsg += `✅ You've been added to the VIP Signal Channel!\n`;
      deliveryMsg += `📊 Premium signals for XAUUSD, XAGUSD, V75\n`;
      deliveryMsg += `🧠 KAI posts signals automatically\n`;
      break;
    case "instant_file":
      deliveryMsg += `📥 Your file is ready:\n`;
      deliveryMsg += `https://kaguujje3.zo.space/kai-store?download=${payment.product_id}\n`;
      break;
    case "instant":
      deliveryMsg += `⏳ Processing your order...\n`;
      deliveryMsg += `You'll receive confirmation within 1-24 hours.\n`;
      break;
    case "custom_content":
      deliveryMsg += `✉️ Send your topic/requirements to @dicksonkagujje\n`;
      deliveryMsg += `🧠 KAI will create your content within 24 hours.\n`;
      break;
    case "custom_build":
      deliveryMsg += `✉️ Send your bot requirements to @dicksonkagujje\n`;
      deliveryMsg += `🤖 KAI will build your bot within 48 hours.\n`;
      break;
    case "manual_setup":
      deliveryMsg += `✉️ Contact @dicksonkagujje for onboarding.\n`;
      deliveryMsg += `Setup takes 24-48 hours.\n`;
      break;
  }
  
  await sendTelegram(payment.user_id.toString(), deliveryMsg);
  await sendTelegram(ADMIN_ID, `✅ Delivered: ${product.name} to @${payment.username}`);
}

// Main webhook handler
export async function handlePaymentBot(body: any) {
  const message = body.message;
  if (!message) return;
  
  const chatId = message.chat.id.toString();
  const userId = message.from.id;
  const username = message.from.username || "unknown";
  const text = message.text || "";
  
  if (text === "/start" || text === "/store" || text === "/catalog") {
    await sendTelegram(chatId, getCatalogMessage());
    return;
  }
  
  if (text === "/wallet" || text === "/address") {
    await sendTelegram(chatId,
      `💰 <b>KAI Store - Payment Wallets</b>\n\n` +
      `📱 <b>TRC20 (USDT):</b>\n<code>${WALLETS.TRC20}</code>\n\n` +
      `🔗 <b>BEP20 (USDT):</b>\n<code>${WALLETS.BEP20}</code>\n\n` +
      `⚡ Both go to Binance account`
    );
    return;
  }
  
  if (text === "/orders" || text === "/my_orders") {
    const userPayments = Array.from(pendingPayments.values())
      .filter(p => p.user_id === userId);
    
    if (userPayments.length === 0) {
      await sendTelegram(chatId, "📭 No orders found. Send /store to browse.");
      return;
    }
    
    let msg = "📋 <b>Your Orders</b>\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    userPayments.forEach(p => {
      const product = PRODUCTS[p.product_id as keyof typeof PRODUCTS];
      msg += `🆔 ${p.id}\n`;
      msg += `📦 ${product?.name || p.product_id}\n`;
      msg += `💰 ${p.amount} USDT\n`;
      msg += `📊 Status: ${p.status.toUpperCase()}\n`;
      if (p.tx_hash) msg += `🔗 TX: ${p.tx_hash}\n`;
      msg += `\n`;
    });
    
    await sendTelegram(chatId, msg);
    return;
  }
  
  // Buy command
  if (text.startsWith("/buy_")) {
    const productId = text.replace("/buy_", "").trim();
    await processPurchase(userId, username, productId);
    return;
  }
  
  // Paid command
  if (text.startsWith("/paid ")) {
    const parts = text.replace("/paid ", "").split(" ");
    const paymentId = parts[0];
    const txHash = parts.slice(1).join(" ") || "screenshot";
    await verifyPayment(userId, paymentId, txHash);
    return;
  }
  
  // Admin: confirm payment
  if (text.startsWith("/confirm_") && chatId === ADMIN_ID) {
    const paymentId = text.replace("/confirm_", "").trim();
    await confirmAndDeliver(paymentId);
    return;
  }
  
  // Admin: reject payment
  if (text.startsWith("/reject_") && chatId === ADMIN_ID) {
    const paymentId = text.replace("/reject_", "").trim();
    const payment = pendingPayments.get(paymentId);
    if (payment) {
      payment.status = "expired";
      savePayments();
      await sendTelegram(payment.user_id.toString(), `❌ Payment for ${paymentId} was not verified. Please contact @dicksonkagujje`);
      await sendTelegram(ADMIN_ID, `❌ Rejected: ${paymentId}`);
    }
    return;
  }
  
  // Admin: stats
  if (text === "/stats" && chatId === ADMIN_ID) {
    const allPayments = Array.from(pendingPayments.values());
    const paid = allPayments.filter(p => p.status === "paid" || p.status === "delivered");
    const totalRevenue = paid.reduce((sum, p) => sum + p.amount, 0);
    
    await sendTelegram(chatId,
      `📊 <b>KAI STORE STATS</b>\n\n` +
      `💰 Total Revenue: ${totalRevenue} USDT\n` +
      `📦 Total Orders: ${allPayments.length}\n` +
      `✅ Paid: ${paid.length}\n` +
      `⏳ Pending: ${allPayments.filter(p => p.status === "pending").length}\n` +
      `❌ Expired: ${allPayments.filter(p => p.status === "expired").length}`
    );
    return;
  }
}

loadPayments();
console.log("✅ KAI Payment Bot loaded. Products:", Object.keys(PRODUCTS).length);
