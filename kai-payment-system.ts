#!/usr/bin/env bun
/**
 * KAI Payment Integration System
 * Accepts payments to Shardick's wallets
 */

import { readFileSync, writeFileSync } from "fs";

const WALLETS = {
  BEP20: {
    address: "0xb0e9e74e720ff587a5097595f2ff5917bbb84838",
    network: "BSC (Binance Smart Chain)",
    accepted: ["USDT", "BNB", "BUSD"]
  },
  TRC20: {
    address: "TDUmDLUgXFHcNiGQ6TeCf65pvwqditYi21",
    network: "TRON",
    accepted: ["USDT", "TRX"]
  }
};

// Product pricing
const PRODUCTS = {
  content_pack_basic: {
    name: "AI Content Pack - Basic",
    price: 19,
    currency: "USDT",
    description: "10 AI-generated articles + 5 social posts"
  },
  content_pack_pro: {
    name: "AI Content Pack - Pro",
    price: 49,
    currency: "USDT",
    description: "50 AI articles + 20 social posts + 5 videos"
  },
  content_pack_enterprise: {
    name: "AI Content Pack - Enterprise",
    price: 199,
    currency: "USDT",
    description: "Unlimited content for 30 days + priority support"
  },
  automation_template: {
    name: "AI Automation Template",
    price: 29,
    currency: "USDT",
    description: "Ready-to-deploy automation script"
  },
  subscription_monthly: {
    name: "KAI Automation - Monthly",
    price: 99,
    currency: "USDT",
    description: "Full automation suite - 30 days"
  },
  signal_access: {
    name: "Premium Trading Signals",
    price: 149,
    currency: "USDT",
    description: "30-day access to high-probability signals"
  }
};

// Generate payment instructions
function generatePaymentLink(productId: string): string {
  const product = PRODUCTS[productId as keyof typeof PRODUCTS];
  if (!product) return "Invalid product";
  
  const wallet = WALLETS.BEP20; // Default to BEP20 for USDT
  
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 PAYMENT FOR: ${product.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Amount: $${product.price} ${product.currency}

📍 Send to:
${wallet.network}
${wallet.address}

📝 Include in memo:
"KAI-${productId}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ After payment, send tx hash to confirm
📱 Delivery: Within 24 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

// Display all products
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🧠 KAI PRODUCTS AVAILABLE");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

for (const [id, product] of Object.entries(PRODUCTS)) {
  console.log(`📦 ${product.name}`);
  console.log(`   Price: $${product.price} ${product.currency}`);
  console.log(`   ${product.description}`);
  console.log(`   Code: ${id}\n`);
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("💡 To get payment link, use product code");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Export for API
export { WALLETS, PRODUCTS, generatePaymentLink };
