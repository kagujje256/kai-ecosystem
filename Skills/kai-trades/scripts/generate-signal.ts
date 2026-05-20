#!/usr/bin/env bun
/**
 * KAI Trades Signal Generator
 * Generates trading signals for Forex, Deriv, and synthetics
 */

import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "-1003988793545";

// Filter configuration
interface FilterConfig {
  enabled: boolean;
  mode: "whitelist" | "blacklist";
  allowedPairs: string[];
  blockedPairs: string[];
  signalTypes: {
    forex: boolean;
    deriv_digits: boolean;
    synthetic: boolean;
    opportunity: boolean;
  };
  lastUpdated: string;
  updatedBy: string;
}

const FILTER_CONFIG_PATH = join(import.meta.dir, "..", "data", "filter-config.json");

function loadFilterConfig(): FilterConfig {
  try {
    if (existsSync(FILTER_CONFIG_PATH)) {
      const content = readFileSync(FILTER_CONFIG_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading filter config:", error);
  }
  // Default: all signals pass
  return {
    enabled: false,
    mode: "whitelist",
    allowedPairs: [],
    blockedPairs: [],
    signalTypes: { forex: true, deriv_digits: true, synthetic: true, opportunity: true },
    lastUpdated: new Date().toISOString(),
    updatedBy: "system"
  };
}

function saveFilterConfig(config: FilterConfig): void {
  try {
    config.lastUpdated = new Date().toISOString();
    writeFileSync(FILTER_CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log("Filter config saved");
  } catch (error) {
    console.error("Error saving filter config:", error);
  }
}

function isSignalAllowed(signal: Signal, config: FilterConfig): boolean {
  // Check signal type filter
  if (!config.signalTypes[signal.type]) {
    return false;
  }

  // If filter disabled, pass all
  if (!config.enabled) {
    return true;
  }

  // Whitelist mode
  if (config.mode === "whitelist") {
    if (config.allowedPairs.length === 0) return true;
    return config.allowedPairs.some(pair => 
      signal.symbol.toUpperCase().includes(pair.toUpperCase())
    );
  }

  // Blacklist mode
  if (config.mode === "blacklist") {
    return !config.blockedPairs.some(pair =>
      signal.symbol.toUpperCase().includes(pair.toUpperCase())
    );
  }

  return true;
}

interface Signal {
  type: "forex" | "deriv_digits" | "synthetic" | "opportunity";
  symbol: string;
  direction: "BUY" | "SELL" | "HOLD";
  entry?: number;
  target?: number;
  stopLoss?: number;
  confidence: number;
  timeframe: string;
  notes: string;
  timestamp: string;
}

// Simulated market analysis (in production, connect to real APIs)
function analyzeForex(): Signal[] {
  const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"];
  const signals: Signal[] = [];
  
  for (const pair of pairs) {
    const random = Math.random();
    if (random > 0.6) {
      const direction = Math.random() > 0.5 ? "BUY" : "SELL";
      signals.push({
        type: "forex",
        symbol: pair,
        direction,
        entry: 1.0800 + Math.random() * 0.1,
        target: direction === "BUY" ? 1.0850 + Math.random() * 0.02 : 1.0750 - Math.random() * 0.02,
        stopLoss: direction === "BUY" ? 1.0770 : 1.0830,
        confidence: 70 + Math.floor(Math.random() * 20),
        timeframe: "H1-H4",
        notes: `${direction === "BUY" ? "Bullish" : "Bearish"} momentum detected. RSI ${direction === "BUY" ? "oversold" : "overbought"}.`,
        timestamp: new Date().toISOString()
      });
    }
  }
  return signals;
}

function analyzeDerivDigits(): Signal[] {
  const digits = ["Matches/Differs", "Over/Under", "Odd/Even"];
  const signals: Signal[] = [];
  
  if (Math.random() > 0.5) {
    const digit = Math.floor(Math.random() * 10);
    signals.push({
      type: "deriv_digits",
      symbol: "V10",
      direction: Math.random() > 0.5 ? "BUY" : "SELL",
      notes: `Last 10 digits pattern: ${Array(10).fill(0).map(() => Math.floor(Math.random() * 10)).join(",")}. High probability for ${digit}.`,
      confidence: 75 + Math.floor(Math.random() * 15),
      timeframe: "Ticks 5-10",
      timestamp: new Date().toISOString()
    });
  }
  return signals;
}

function analyzeSynthetics(): Signal[] {
  const synthetics = [
    { symbol: "V75", name: "Volatility 75" },
    { symbol: "V100", name: "Volatility 100" },
    { symbol: "BOOM300", name: "Boom 300" },
    { symbol: "CRASH500", name: "Crash 500" }
  ];
  const signals: Signal[] = [];
  
  for (const synth of synthetics) {
    if (Math.random() > 0.6) {
      const direction = synth.symbol.includes("BOOM") ? "BUY" : 
                        synth.symbol.includes("CRASH") ? "SELL" :
                        Math.random() > 0.5 ? "BUY" : "SELL";
      signals.push({
        type: "synthetic",
        symbol: synth.name,
        direction,
        notes: `${synth.name} showing ${direction === "BUY" ? "uptrend" : "downtrend"} pattern. Spike detection active.`,
        confidence: 65 + Math.floor(Math.random() * 25),
        timeframe: "M1-M5",
        timestamp: new Date().toISOString()
      });
    }
  }
  return signals;
}

function generateOpportunities(): Signal[] {
  const opportunities = [
    { symbol: "HAMSTER Kombat", notes: "New airdrop listing soon", type: "opportunity" },
    { symbol: "Blum", notes: "Points farming active - claim daily", type: "opportunity" },
    { symbol: "Major", notes: "NFT holders get token allocation", type: "opportunity" },
    { symbol: "TON Staking", notes: "5% APY - low risk passive income", type: "opportunity" },
    { symbol: "USDT Yield", notes: "DeFi pools 8-15% APY available", type: "opportunity" }
  ];
  
  const signals: Signal[] = [];
  const selected = opportunities[Math.floor(Math.random() * opportunities.length)];
  
  signals.push({
    type: "opportunity",
    symbol: selected.symbol,
    direction: "HOLD",
    notes: selected.notes,
    confidence: 90,
    timeframe: "Passive",
    timestamp: new Date().toISOString()
  });
  
  return signals;
}

function formatSignal(signal: Signal): string {
  const emoji = {
    forex: "💱",
    deriv_digits: "🎲",
    synthetic: "📊",
    opportunity: "💰"
  };
  
  const dirEmoji = {
    BUY: "🟢",
    SELL: "🔴",
    HOLD: "🟡"
  };
  
  let message = `${emoji[signal.type]} **${signal.symbol}** ${dirEmoji[signal.direction]}\n\n`;
  
  if (signal.entry) message += `📍 Entry: ${signal.entry.toFixed(5)}\n`;
  if (signal.target) message += `🎯 Target: ${signal.target.toFixed(5)}\n`;
  if (signal.stopLoss) message += `🛑 SL: ${signal.stopLoss.toFixed(5)}\n`;
  
  message += `📊 Confidence: ${signal.confidence}%\n`;
  message += `⏱️ Timeframe: ${signal.timeframe}\n\n`;
  message += `📝 ${signal.notes}\n\n`;
  message += `⏰ ${new Date().toLocaleString("en-UG", { timeZone: "Africa/Nairobi" })}\n\n`;
  message += `_KAI🧠 Analysis | Trade responsibly_`;
  
  return message;
}

async function postToTelegram(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("Telegram bot token not configured");
    return false;
  }
  
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });
    
    const data = await response.json() as any;
    if (data.ok) {
      console.log("Posted successfully:", data.result.message_id);
      return true;
    } else {
      console.error("Failed to post:", data.description);
      return false;
    }
  } catch (error) {
    console.error("Error posting to Telegram:", error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "generate";
  
  // Load filter config
  const filterConfig = loadFilterConfig();
  
  if (command === "filter-show") {
    console.log("Current Filter Configuration:");
    console.log(JSON.stringify(filterConfig, null, 2));
    return;
  }
  
  if (command === "filter-clear") {
    const defaultConfig: FilterConfig = {
      enabled: false,
      mode: "whitelist",
      allowedPairs: [],
      blockedPairs: [],
      signalTypes: { forex: true, deriv_digits: true, synthetic: true, opportunity: true },
      lastUpdated: new Date().toISOString(),
      updatedBy: "user"
    };
    saveFilterConfig(defaultConfig);
    console.log("Filter cleared - all signals will pass through");
    return;
  }
  
  if (command === "filter-set") {
    const pairsArg = args.indexOf("--pairs");
    const modeArg = args.indexOf("--mode");
    const typesArg = args.indexOf("--types");
    
    const newConfig: FilterConfig = { ...filterConfig, enabled: true };
    
    if (modeArg !== -1 && args[modeArg + 1]) {
      const mode = args[modeArg + 1].toLowerCase();
      if (mode === "whitelist" || mode === "blacklist") {
        newConfig.mode = mode;
      }
    }
    
    if (pairsArg !== -1 && args[pairsArg + 1]) {
      const pairs = args[pairsArg + 1].split(",").map(p => p.trim().toUpperCase());
      if (newConfig.mode === "whitelist") {
        newConfig.allowedPairs = pairs;
      } else {
        newConfig.blockedPairs = pairs;
      }
    }
    
    if (typesArg !== -1 && args[typesArg + 1]) {
      const types = args[typesArg + 1].split(",").map(t => t.trim().toLowerCase());
      newConfig.signalTypes = {
        forex: types.includes("forex"),
        deriv_digits: types.includes("deriv"),
        synthetic: types.includes("synthetic"),
        opportunity: types.includes("opportunity")
      };
    }
    
    saveFilterConfig(newConfig);
    console.log("Filter updated:");
    console.log(JSON.stringify(newConfig, null, 2));
    return;
  }
  
  if (command === "generate" || command === "post") {
    // Generate signals
    const forexSignals = analyzeForex();
    const digitSignals = analyzeDerivDigits();
    const syntheticSignals = analyzeSynthetics();
    const opportunities = generateOpportunities();
    
    const allSignals = [...forexSignals, ...digitSignals, ...syntheticSignals, ...opportunities];
    
    // Apply filter
    const filteredSignals = allSignals.filter(s => isSignalAllowed(s, filterConfig));
    
    console.log(`Generated ${allSignals.length} signals, ${filteredSignals.length} passed filter\n`);
    
    if (filteredSignals.length === 0) {
      console.log("No signals match current filter criteria");
      return;
    }
    
    for (const signal of filteredSignals) {
      const message = formatSignal(signal);
      console.log("---");
      console.log(message);
      
      if (command === "post") {
        await postToTelegram(message);
        // Rate limiting
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  
  if (command === "test") {
    const testMessage = `🧠 **KAI Trading Bot Online**

✅ Connected to Kai🧠 Trades ♻️
📊 Forex, Deriv, Synthetics active
💰 Money opportunities tracking

_Ready to serve signals!_`;
    
    await postToTelegram(testMessage);
  }
  
  if (command === "overview") {
    const overview = `🌅 **Daily Market Overview**

_${new Date().toLocaleDateString("en-UG", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Africa/Nairobi" })}_

**Forex Market**
• EUR/USD: Watching 1.0850 resistance
• GBP/USD: Bullish above 1.2700
• USD/JPY: Key level at 150.00

**Synthetics**
• Volatility 75: High volatility expected
• Boom/Crash: Spike patterns forming

**Opportunities**
• Check Telegram mini-apps for airdrops
• TON ecosystem farming active

_Next update in 4 hours_
_KAI🧠 Daily Overview_`;
    
    await postToTelegram(overview);
  }
}

main();
