#!/usr/bin/env bun
/**
 * KAI Straico Integration - Multi-Model AI Gateway
 * 
 * Provides unified access to 80+ AI models via Straico API
 * Powers the entire KAI ecosystem with intelligent capabilities
 */

const STRAICO_API_KEY = process.env.STRAICO_API_KEY || "tY-Tr12BEgNnV6DGMTsBaWekDA8At8hU4CVVVcocnc8Bopj2Uuh";
const STRAICO_BASE_URL = "https://api.straico.com/v1";

// Model presets for different use cases
const MODEL_PRESETS = {
  coding: "anthropic/claude-sonnet-4.5",
  reasoning: "anthropic/claude-3.7-sonnet:thinking",
  creative: "deepseek/deepseek-r1",
  fast: "amazon/nova-lite-v1",
  cheap: "amazon/nova-micro-v1",
  uncensored: "deepseek/deepseek-r1:nitro",
  chat: "google/gemini-2.5-flash-lite",
  trading: "anthropic/claude-sonnet-4.5",
  content: "deepseek/deepseek-chat-v3.2"
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  preset?: keyof typeof MODEL_PRESETS;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Chat completion with any Straico model
 */
export async function chat(
  messages: ChatMessage[] | string,
  options: ChatOptions = {}
): Promise<string> {
  const model = options.preset 
    ? MODEL_PRESETS[options.preset] 
    : (options.model || MODEL_PRESETS.fast);
  
  const messageArray = typeof messages === "string" 
    ? [{ role: "user" as const, content: messages }]
    : messages;
  
  if (options.systemPrompt && messageArray[0]?.role !== "system") {
    messageArray.unshift({ role: "system", content: options.systemPrompt });
  }
  
  try {
    const response = await fetch(`${STRAICO_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRAICO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: messageArray,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Straico API error: ${error}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Straico chat error:", error);
    throw error;
  }
}

/**
 * Generate image with DALL-E 3, Flux, Ideogram, etc.
 */
export async function generateImage(
  prompt: string,
  options: {
    model?: string;
    size?: "square" | "landscape" | "portrait";
    style?: string;
  } = {}
): Promise<{ url: string; revisedPrompt?: string }> {
  const model = options.model || "ideogram/V_2A";
  const size = options.size || "square";
  
  try {
    const response = await fetch(`${STRAICO_BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRAICO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        n: 1
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Straico image error: ${error}`);
    }
    
    const data = await response.json();
    return {
      url: data.data[0]?.url || "",
      revisedPrompt: data.data[0]?.revised_prompt
    };
  } catch (error) {
    console.error("Straico image error:", error);
    throw error;
  }
}

/**
 * Generate video from image
 */
export async function generateVideo(
  imageUrl: string,
  options: {
    model?: string;
    duration?: number;
  } = {}
): Promise<{ url: string }> {
  const model = options.model || "fal-ai/kling-video/v2.1/master/image-to-video";
  
  try {
    const response = await fetch(`${STRAICO_BASE_URL}/videos/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRAICO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        image_url: imageUrl,
        duration: options.duration || 5
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Straico video error: ${error}`);
    }
    
    const data = await response.json();
    return { url: data.url || "" };
  } catch (error) {
    console.error("Straico video error:", error);
    throw error;
  }
}

/**
 * Text-to-speech with ElevenLabs
 */
export async function generateSpeech(
  text: string,
  options: {
    model?: string;
    voice?: string;
  } = {}
): Promise<{ audioUrl: string }> {
  const model = options.model || "eleven_v3";
  
  try {
    const response = await fetch(`${STRAICO_BASE_URL}/audio/speech`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRAICO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: text,
        voice: options.voice || "default"
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Straico audio error: ${error}`);
    }
    
    const data = await response.json();
    return { audioUrl: data.url || "" };
  } catch (error) {
    console.error("Straico audio error:", error);
    throw error;
  }
}

/**
 * Get available models
 */
export async function getModels(): Promise<any> {
  try {
    const response = await fetch(`${STRAICO_BASE_URL}/models`, {
      headers: {
        "Authorization": `Bearer ${STRAICO_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Get models error:", error);
    throw error;
  }
}

/**
 * Quick helpers for common tasks
 */
export const quick = {
  async code(prompt: string): Promise<string> {
    return chat(prompt, { preset: "coding" });
  },
  
  async analyze(text: string): Promise<string> {
    return chat(`Analyze this:\n\n${text}`, { preset: "reasoning" });
  },
  
  async summarize(text: string): Promise<string> {
    return chat(`Summarize:\n\n${text}`, { preset: "fast" });
  },
  
  async translate(text: string, targetLang: string): Promise<string> {
    return chat(`Translate to ${targetLang}:\n\n${text}`, { preset: "fast" });
  },
  
  async creative(prompt: string): Promise<string> {
    return chat(prompt, { preset: "creative" });
  },
  
  async uncensored(prompt: string): Promise<string> {
    return chat(prompt, { preset: "uncensored" });
  }
};

// Export for use across ecosystem
export default {
  chat,
  generateImage,
  generateVideo,
  generateSpeech,
  getModels,
  quick,
  MODEL_PRESETS
};

console.log("🧠 KAI Straico Integration Ready");
console.log("Available presets:", Object.keys(MODEL_PRESETS));