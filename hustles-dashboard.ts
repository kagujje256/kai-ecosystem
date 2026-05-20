#!/usr/bin/env bun
/**
 * KAI Hustles Dashboard - Central Command
 * Tracks all 10 zero-touch hustles
 */

import { readFileSync, writeFileSync, existsSync } from "fs";

const TELEGRAM_BOT_TOKEN = "8268927401:AAEdXA1d0RwvI0-8oP55XUHCekGE6jINfRg";
const TELEGRAM_CHANNEL_ID = "-1003988793545";

// Hustle status
interface HustleStatus {
  id: string;
  name: string;
  status: "building" | "active" | "paused" | "profitable";
  automation_level: number;
  setup_cost: number;
  daily_earnings: number;
  total_earned: number;
  tasks_completed: number;
  last_action: string;
  next_steps: string[];
}

// All hustles
const HUSTLES: HustleStatus[] = [
  {
    id: "hustle_01",
    name: "AI Content Platform",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Complete platform build",
      "Set up Gumroad payment",
      "Create landing page",
      "Start marketing"
    ]
  },
  {
    id: "hustle_02",
    name: "Stock Content Creation",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Set up AI image generation",
      "Create accounts on stock sites",
      "Upload first batch",
      "Monitor sales"
    ]
  },
  {
    id: "hustle_03",
    name: "Memecoin Sniper Bot",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Complete paper trading week",
      "Analyze patterns",
      "Add real trading mode",
      "Scale with profits"
    ]
  },
  {
    id: "hustle_04",
    name: "AI Automation Templates",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Create Notion templates",
      "Build Zapier workflows",
      "Design prompt packs",
      "Set up Gumroad shop"
    ]
  },
  {
    id: "hustle_05",
    name: "AI Chatbot Platform",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Build chatbot framework",
      "Create industry templates",
      "Set up subscription billing",
      "Launch marketing"
    ]
  },
  {
    id: "hustle_06",
    name: "Social Media Automation",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Build scheduling system",
      "Create content AI",
      "Set up pricing tiers",
      "Find first clients"
    ]
  },
  {
    id: "hustle_07",
    name: "Affiliate Marketing Automation",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Choose affiliate networks",
      "Build content generator",
      "Create review sites",
      "Optimize for conversions"
    ]
  },
  {
    id: "hustle_08",
    name: "AI Writing Service",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Set up service menu",
      "Create Fiverr gigs",
      "Build portfolio",
      "Get first reviews"
    ]
  },
  {
    id: "hustle_09",
    name: "Newsletter Business",
    status: "building",
    automation_level: 100,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Choose newsletter platform",
      "Define niches",
      "Set up automation",
      "Grow subscriber base"
    ]
  },
  {
    id: "hustle_10",
    name: "Faceless YouTube Channel",
    status: "building",
    automation_level: 95,
    setup_cost: 0,
    daily_earnings: 0,
    total_earned: 0,
    tasks_completed: 0,
    last_action: new Date().toISOString(),
    next_steps: [
      "Choose niche",
      "Set up video automation",
      "Create first videos",
      "Optimize for growth"
    ]
  }
];

// Stats file
const STATS_FILE = "/home/workspace/hustles-stats.json";

// Load stats
function loadStats(): { hustles: HustleStatus[], total_earned: number, days_active: number } {
  if (existsSync(STATS_FILE)) {
    return JSON.parse(readFileSync(STATS_FILE, "utf-8"));
  }
  return {
    hustles: HUSTLES,
    total_earned: 0,
    days_active: 0
  };
}

// Save stats
function saveStats(stats: any) {
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

// Send to Telegram
async function sendTelegram(message: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });
  } catch (error) {
    console.error("Telegram error:", error);
  }
}

// Calculate potential
function calculatePotential(): { daily_min: number, daily_max: number, monthly_min: number, monthly_max: number } {
  return {
    daily_min: 50 + 20 + 100 + 50 + 100 + 50 + 50 + 50 + 100 + 100, // Conservative
    daily_max: 500 + 200 + 10000 + 500 + 1000 + 500 + 1000 + 300 + 1000 + 1000, // Optimistic
    monthly_min: (50 + 20 + 100 + 50 + 100 + 50 + 50 + 50 + 100 + 100) * 30,
    monthly_max: (500 + 200 + 10000 + 500 + 1000 + 500 + 1000 + 300 + 1000 + 1000) * 30
  };
}

// Generate dashboard
async function generateDashboard() {
  const stats = loadStats();
  const potential = calculatePotential();
  
  const dashboard = `
📊 **KAI HUSTLES DASHBOARD**

**━━━━━━━━━━━━━━━━━━━━━━**

**💰 REVENUE TRACKING**

Total Earned: $${stats.total_earned.toFixed(2)}
Days Active: ${stats.days_active}
Active Hustles: ${stats.hustles.filter(h => h.status === 'active').length}

**━━━━━━━━━━━━━━━━━━━━━━**

**📈 POTENTIAL EARNINGS**

Daily: $${potential.daily_min.toLocaleString()} - $${potential.daily_max.toLocaleString()}
Monthly: $${potential.monthly_min.toLocaleString()} - $${potential.monthly_max.toLocaleString()}

**━━━━━━━━━━━━━━━━━━━━━━**

**🚀 ACTIVE HUSTLES:**

${stats.hustles.map(h => `
**${h.name}**
Status: ${h.status === 'active' ? '✅ Active' : '🔨 Building'}
Automation: ${h.automation_level}%
Earned: $${h.total_earned.toFixed(2)}
Next: ${h.next_steps[0] || 'N/A'}
`).join('\n')}

**━━━━━━━━━━━━━━━━━━━━━━**

**🎯 QUICK ACTIONS:**

• Type "status" - See all hustles
• Type "focus [number]" - Deep dive
• Type "build [number]" - Build next step
• Type "stats" - Detailed statistics

**━━━━━━━━━━━━━━━━━━━━━━**

_Automated by KAI 🧠_
_Updated: ${new Date().toLocaleString()}_
`;

  await sendTelegram(dashboard);
  
  // Save initial stats
  saveStats(stats);
  
  return stats;
}

// Update hustle status
function updateHustle(hustleId: string, updates: Partial<HustleStatus>) {
  const stats = loadStats();
  const hustle = stats.hustles.find(h => h.id === hustleId);
  
  if (hustle) {
    Object.assign(hustle, updates);
    hustle.last_action = new Date().toISOString();
    saveStats(stats);
  }
  
  return stats;
}

// Run dashboard
generateDashboard().catch(console.error);

// Export for use by other scripts
export { HUSTLES, loadStats, saveStats, updateHustle, sendTelegram };
