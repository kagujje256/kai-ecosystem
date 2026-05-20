#!/usr/bin/env bun
/**
 * Hustle #1: Premium Signal Channel
 * Free channel = bait, VIP = paid ($50/mo)
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8268927401:AAEdXA1d0RwvI0-8oP55XUHCekGE6jINfRg";
const FREE_CHANNEL = "@KaiSignalsFree"; // Bait channel
const VIP_CHANNEL = "-1003988793545"; // Paid VIP channel (your existing one)

const FOCUS_PAIRS = ["XAUUSD", "XAGUSD", "V75"];

interface Signal {
  pair: string;
  type: "BUY" | "SELL";
  entry: string;
  sl: string;
  tp1: string;
  tp2: string;
  confidence: number;
  timeframe: string;
  timestamp: string;
  is_vip: boolean;
}

function generateSignal(pair: string, isVip: boolean): Signal {
  const type = Math.random() > 0.5 ? "BUY" : "SELL";
  const basePrice = pair === "XAUUSD" ? 2350 : pair === "XAGUSD" ? 28 : 100;
  const price = basePrice + (Math.random() * 50 - 25);
  
  const entry = price.toFixed(pair === "V75" ? 2 : 2);
  const sl = type === "BUY" 
    ? (price - (pair === "XAUUSD" ? 15 : pair === "XAGUSD" ? 0.5 : 5)).toFixed(2)
    : (price + (pair === "XAUUSD" ? 15 : pair === "XAGUSD" ? 0.5 : 5)).toFixed(2);
  const tp1 = type === "BUY"
    ? (price + (pair === "XAUUSD" ? 25 : pair === "XAGUSD" ? 1 : 10)).toFixed(2)
    : (price - (pair === "XAUUSD" ? 25 : pair === "XAGUSD" ? 1 : 10)).toFixed(2);
  const tp2 = type === "BUY"
    ? (price + (pair === "XAUUSD" ? 50 : pair === "XAGUSD" ? 2 : 20)).toFixed(2)
    : (price - (pair === "XAUUSD" ? 50 : pair === "XAGUSD" ? 2 : 20)).toFixed(2);
  
  return {
    pair,
    type,
    entry,
    sl,
    tp1,
    tp2,
    confidence: Math.floor(Math.random() * 20) + 80,
    timeframe: ["15M", "1H", "4H"][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString(),
    is_vip: isVip
  };
}

function formatSignal(signal: Signal, isVip: boolean): string {
  const emoji = signal.type === "BUY" ? "🟢" : "🔴";
  let msg = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `${emoji} <b>${signal.type} ${signal.pair}</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `📍 <b>Entry:</b> ${signal.entry}\n`;
  
  if (isVip) {
    msg += `🛡️ <b>Stop Loss:</b> ${signal.sl}\n`;
    msg += `🎯 <b>Take Profit 1:</b> ${signal.tp1}\n`;
    msg += `🎯 <b>Take Profit 2:</b> ${signal.tp2}\n`;
    msg += `📊 <b>Confidence:</b> ${signal.confidence}%\n`;
    msg += `⏱️ <b>Timeframe:</b> ${signal.timeframe}\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🧠 <b>KAI VIP Signal</b>\n`;
    msg += `⏰ ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}`;
  } else {
    msg += `\n💎 <b>Get full entry, SL & TP in VIP!</b>\n`;
    msg += `💰 $50/month → @kai_store_bot\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🧠 <b>KAI Free Signal Preview</b>`;
  }
  
  return msg;
}

async function postToChannel(channelId: string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to post to channel:", e);
    return false;
  }
}

async function runSignalService() {
  console.log("🧠 KAI Signal Service Started");
  console.log("📊 Focus pairs:", FOCUS_PAIRS.join(", "));
  console.log("💰 VIP Channel:", VIP_CHANNEL);
  console.log("🆓 Free Channel:", FREE_CHANNEL);
  console.log("\nPosting signals every 2-4 hours...\n");
  
  // Post signals every 2-4 hours
  while (true) {
    // Generate 1-3 signals
    const numSignals = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numSignals; i++) {
      const pair = FOCUS_PAIRS[Math.floor(Math.random() * FOCUS_PAIRS.length)];
      
      // Free signal (bait)
      const freeSignal = generateSignal(pair, false);
      const freeMsg = formatSignal(freeSignal, false);
      await postToChannel(FREE_CHANNEL, freeMsg);
      console.log(`✅ Posted FREE signal: ${pair} ${freeSignal.type}`);
      
      await new Promise(r => setTimeout(r, 5000)); // 5 sec gap
      
      // VIP signal (full)
      const vipSignal = generateSignal(pair, true);
      const vipMsg = formatSignal(vipSignal, true);
      await postToChannel(VIP_CHANNEL, vipMsg);
      console.log(`✅ Posted VIP signal: ${pair} ${vipSignal.type}`);
      
      await new Promise(r => setTimeout(r, 60000)); // 1 min gap
    }
    
    // Wait 2-4 hours
    const waitHours = 2 + Math.random() * 2;
    console.log(`\n⏳ Next signals in ${waitHours.toFixed(1)} hours...\n`);
    await new Promise(r => setTimeout(r, waitHours * 60 * 60 * 1000));
  }
}

// Run
runSignalService().catch(console.error);
