#!/usr/bin/env bun
/**
 * KAI Sync Script
 * Synchronizes learning data between Zo spaces
 */

import { readFileSync, existsSync } from "fs";

const SPACES = {
  kaggu: "https://kaggu.zo.space/api/kai/sync",
  daily4: "https://daily4.zo.space/api/kai/sync",
  kaguujje3: "https://kaguujje3.zo.space/api/kai/sync",
};

// MCP tokens for authentication
const TOKENS: Record<string, string> = {
  kaggu: "zo_sk_y_bxlT7XzZfxYyIdChqXxStyMmg1YIhgGllor3gh_nc",
  daily4: "zo_sk_LPz6Ag9IYJ1cgMIUISBajLmQMn1XtQX6_uRzyyyDj10",
  kaguujje3: "zo_sk_RTly_rRjGS8-WWbXCLF6ptM2aAP-CKvCgFGrtFOuDdw",
};

const DATA_PATHS = {
  agents: "/home/workspace/AGENTS.md",
  config: "/home/workspace/Skills/kai-advanced-trading/data/config.json",
  capabilities: "/home/workspace/Skills/kai-learning/data/capabilities.json",
  conversations: "/home/workspace/Skills/kai-learning/data/conversations.json",
  ecosystem: "/home/workspace/Skills/kai-sync/data/ecosystem.json",
};

const AGENTS_PATH = "/home/workspace/AGENTS.md";
const CONFIG_PATH = "/home/workspace/Skills/kai-advanced-trading/data/config.json";
const CONVERSATIONS_PATH = "/home/workspace/Skills/kai-learning/data/conversations.json";
const ECOSYSTEM_CONVERSATIONS_PATH = "/home/workspace/ECOSYSTEM-CONVERSATIONS.json";

interface SyncData {
  agents_md?: string;
  config?: any;
  capabilities?: any;
  conversations?: any;
  ecosystem_conversations?: any;
  accounts?: any[];
  patterns?: any[];
  learning?: any[];
  timestamp: string;
  source: string;
}

async function status() {
  console.log("Fetching sync status...\n");
  
  for (const [name, url] of Object.entries(SPACES)) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`✅ ${name}.zo.computer:`);
      console.log(`   Timestamp: ${data.timestamp || "N/A"}`);
      console.log(`   Source: ${data.source || "N/A"}\n`);
    } catch (e) {
      console.log(`❌ ${name}.zo.computer: ${(e as Error).message}\n`);
    }
  }
}

async function pull(source: string = "kaggu") {
  const url = SPACES[source as keyof typeof SPACES];
  if (!url) {
    console.error(`Unknown source: ${source}`);
    process.exit(1);
  }
  
  console.log(`Pulling from ${source}.zo.computer...`);
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

async function pushToNode(node: string, data: SyncData): Promise<boolean> {
  const url = SPACES[node as keyof typeof SPACES];
  const token = TOKENS[node];
  
  if (!url) {
    console.log(`Skipping ${node} - no URL`);
    return false;
  }
  
  if (!token) {
    console.log(`Skipping ${node} - no token`);
    return false;
  }
  
  try {
    console.log(`Pushing to ${node}...`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    console.log(`  Response status: ${res.status}`);
    const result = await res.json();
    console.log(`  Response:`, JSON.stringify(result).substring(0, 100));
    
    if (result.success || result.ok || res.status === 200) {
      console.log(`✅ Pushed to ${node}.zo.computer`);
      return true;
    } else {
      console.log(`❌ Failed to push to ${node}: ${result.error || "unknown"}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ Error pushing to ${node}: ${(e as Error).message}`);
    return false;
  }
}

async function pushAll() {
  console.log("🔄 Syncing to all nodes...\n");
  
  const data: SyncData = {
    timestamp: new Date().toISOString(),
    source: "kaguujje3.zo.computer",
  };
  
  // Load AGENTS.md
  if (existsSync(AGENTS_PATH)) {
    data.agents_md = readFileSync(AGENTS_PATH, "utf-8");
    console.log("📄 Loaded AGENTS.md");
  }
  
  // Load trading config
  if (existsSync(CONFIG_PATH)) {
    data.config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    console.log("⚙️ Loaded trading config");
  }
  
  // Load capabilities
  if (existsSync(DATA_PATHS.capabilities)) {
    data.capabilities = JSON.parse(readFileSync(DATA_PATHS.capabilities, "utf-8"));
    console.log("🧠 Loaded capabilities");
  }
  
  // Load conversations
  if (existsSync(CONVERSATIONS_PATH)) {
    data.conversations = JSON.parse(readFileSync(CONVERSATIONS_PATH, "utf-8"));
    console.log("💬 Loaded conversations");
  }
  
  // Load ecosystem conversations
  if (existsSync(ECOSYSTEM_CONVERSATIONS_PATH)) {
    data.ecosystem_conversations = JSON.parse(readFileSync(ECOSYSTEM_CONVERSATIONS_PATH, "utf-8"));
    console.log("🌐 Loaded ecosystem conversations");
  }
  
  // Push to all other nodes
  const results: Record<string, boolean> = {};
  for (const node of ["kaggu", "daily4"]) {
    results[node] = await pushToNode(node, data);
  }
  
  console.log("\n📊 Sync Results:");
  for (const [node, success] of Object.entries(results)) {
    console.log(`   ${success ? "✅" : "❌"} ${node}`);
  }
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case "status":
    status();
    break;
  case "pull":
    pull(args[0]);
    break;
  case "push":
    pushAll();
    break;
  default:
    console.log(`
KAI Sync - Multi-space synchronization

Usage:
  bun sync.ts status          Show sync status for all spaces
  bun sync.ts pull [source]   Pull data from source (default: kaggu)
  bun sync.ts push            Push local data to all other nodes

Sources: kaggu, daily4, kaguujje3
`);
}
