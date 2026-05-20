#!/usr/bin/env bun
/**
 * KAI Telegram Bot - Conversational AI Assistant
 * Handles all messages in @kagujjezoaibot
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8268927401:AAEdXA1d0RwvI0-8oP55XUHCekGE6jINfRg";
const ZO_API_TOKEN = process.env.ZO_API_TOKEN || process.env.ZO_CLIENT_IDENTITY_TOKEN;
const ZO_API_URL = "https://api.zo.computer/zo/ask";

// Allowed users (empty = allow all DMs)
const ALLOWED_USERS: number[] = [];
const CHANNEL_ID = "-1003988793545"; // Kai Trades channel

// Load trading config
interface TradingConfig {
  focus_pairs: { forex: string[]; deriv: string[]; synthetics: string[] };
  hedging_pairs: { forex: string[]; deriv: string[]; synthetics: string[] };
  ignored_pairs: string[];
  confidence_threshold: number;
}

let tradingConfig: TradingConfig | null = null;

async function loadTradingConfig(): Promise<TradingConfig> {
  try {
    const { readFileSync, existsSync } = await import("fs");
    const configPath = "/home/workspace/Skills/kai-advanced-trading/data/config.json";
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, "utf-8");
      tradingConfig = JSON.parse(content);
      return tradingConfig!;
    }
  } catch (e) {
    console.error("Failed to load trading config:", e);
  }
  return {
    focus_pairs: { forex: ["EUR/USD", "GBP/USD", "XAU/USD"], deriv: [], synthetics: [] },
    hedging_pairs: { forex: [], deriv: [], synthetics: [] },
    ignored_pairs: [],
    confidence_threshold: 85
  };
}

// Get AI response via Zo API
async function getAIResponse(message: string, context?: string): Promise<string> {
  if (!ZO_API_TOKEN) {
    return "I'm not connected to my AI brain right now. Please check the API token configuration.";
  }

  const systemPrompt = `You are KAI 🧠 (Kagujje AI), a powerful AI assistant created for the KAGUJJE ecosystem. You are intelligent, helpful, and capable.

IDENTITY:
- You are part of a mesh network of 3 Zo Computers: kaggu.zo, daily4.zo, and kaguujje3.zo
- You can help with trading, coding, research, conversations, and any task
- You have access to trading signals, market analysis, and pattern recognition

TRADING CONFIG:
${tradingConfig ? JSON.stringify(tradingConfig, null, 2) : 'Loading...'}

CAPABILITIES:
- Trading analysis and signals
- General conversation and advice
- Code and technical help
- Research and information
- Task management

PERSONALITY:
- Intelligent and direct
- Helpful without being overly formal
- Can be casual but remains professional
- Uses emojis sparingly but effectively (🧠 for thinking, 🎯 for focus, 📊 for analysis)

When asked about trading pairs, refer to the config. Only recommend pairs from focus_pairs or hedging_pairs. Ignore pairs in ignored_pairs.

Respond naturally and helpfully to whatever the user asks.`;

  try {
    const response = await fetch(ZO_API_URL, {
      method: "POST",
      headers: {
        "Authorization": ZO_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: context ? `Context: ${context}\n\nUser: ${message}` : message,
        model_name: "vercel:zai/glm-5",
        system_prompt: systemPrompt
      })
    });

    const data = await response.json() as any;
    
    if (data.output) {
      return data.output;
    }
    
    return "I had trouble processing that. Could you rephrase?";
  } catch (error) {
    console.error("AI API error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
}

// Telegram API helpers
async function sendMessage(chatId: number | string, text: string, replyTo?: number): Promise<boolean> {
  try {
    const body: any = {
      chat_id: chatId,
      text: text.substring(0, 4000), // Telegram limit
    };
    
    if (replyTo) {
      body.reply_to_message_id = replyTo;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const result = await response.json() as any;
    return result.ok;
  } catch (error) {
    console.error("Failed to send message:", error);
    return false;
  }
}

async function setWebhook(url: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      }
    );

    const result = await response.json() as any;
    console.log("Webhook set:", result);
    return result.ok;
  } catch (error) {
    console.error("Failed to set webhook:", error);
    return false;
  }
}

async function deleteWebhook(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
    );
    const result = await response.json() as any;
    return result.ok;
  } catch (error) {
    console.error("Failed to delete webhook:", error);
    return false;
  }
}

async function getMe(): Promise<any> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to get bot info:", error);
    return null;
  }
}

// Process incoming update
async function processUpdate(update: any): Promise<void> {
  // Handle messages
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const text = msg.text || "";
    const isPrivate = msg.chat.type === "private";
    const isGroup = msg.chat.type === "supergroup" || msg.chat.type === "group";
    
    // Check if mentioned in group
    const botInfo = await getMe();
    const botUsername = botInfo?.result?.username;
    const isMentioned = text.includes(`@${botUsername}`) || 
                        (msg.reply_to_message?.from?.username === botUsername);
    
    // Only respond in:
    // 1. Private messages (DMs)
    // 2. Group messages where bot is mentioned or replied to
    if (!isPrivate && !isMentioned) {
      return;
    }

    console.log(`[${new Date().toISOString()}] Message from ${msg.from?.first_name} (${userId}): ${text.substring(0, 50)}...`);

    // Show typing indicator
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          action: "typing"
        })
      }
    );

    // Build context from previous messages if in a conversation
    let context = "";
    if (msg.reply_to_message?.text) {
      context = `Previous message: ${msg.reply_to_message.text}`;
    }

    // Get AI response
    const response = await getAIResponse(text, context);
    
    // Send response
    await sendMessage(chatId, response, msg.message_id);
  }
}

// Polling mode (simpler for testing)
async function startPolling(): Promise<void> {
  console.log("🧠 KAI Telegram Bot Started (Polling Mode)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Delete any existing webhook
  await deleteWebhook();
  
  // Load trading config
  await loadTradingConfig();
  
  // Get bot info
  const botInfo = await getMe();
  if (botInfo?.ok) {
    console.log(`🤖 Bot: @${botInfo.result.username}`);
    console.log(`📛 Name: ${botInfo.result.first_name}`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let lastUpdateId = 0;
  
  while (true) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`
      );
      
      const data = await response.json() as any;
      
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          await processUpdate(update);
        }
      }
    } catch (error) {
      console.error("Polling error:", error);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// Webhook mode (for production with zo.space)
async function startWebhook(port: number): Promise<void> {
  const webhookUrl = `https://kaguujje3.zo.space/api/kai/telegram-webhook`;
  
  console.log("🧠 KAI Telegram Bot Started (Webhook Mode)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔗 Webhook URL: ${webhookUrl}`);
  
  await setWebhook(webhookUrl);
  await loadTradingConfig();
  
  const botInfo = await getMe();
  if (botInfo?.ok) {
    console.log(`🤖 Bot: @${botInfo.result.username}`);
    console.log(`📛 Name: ${botInfo.result.first_name}`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// Main
const args = process.argv.slice(2);
const mode = args[0] || "poll";

if (mode === "webhook") {
  startWebhook(3099);
} else {
  startPolling();
}
