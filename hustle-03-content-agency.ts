#!/usr/bin/env bun
/**
 * Hustle #3: AI Content Agency
 * Sells AI-generated content
 */

const PAYMENT_WALLET = "0xb0e9e74e720ff587a5097595f2ff5917bbb84838";

const SERVICES = {
  blog_posts: { price: 50, delivery: "24h" },
  social_media: { price: 30, delivery: "6h" },
  seo_articles: { price: 80, delivery: "48h" },
  product_descriptions: { price: 20, delivery: "12h" },
  email_sequences: { price: 100, delivery: "48h" },
  website_copy: { price: 200, delivery: "72h" }
};

console.log("📝 KAI Content Agency Started");
console.log(`💳 Payments to: ${PAYMENT_WALLET}`);
console.log("\n💰 Services:");
Object.entries(SERVICES).forEach(([service, details]) => {
  console.log(`  ${service}: $${details.price} (${details.delivery})`);
});
console.log("\n🚀 Ready for orders!");
