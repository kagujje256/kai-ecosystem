# KAI Infrastructure

Multi-model AI ecosystem for continuous learning across all available models.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                        ZO COMPUTER (Control Plane)                                    │
│                                                                                       │
│   ┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────┐           │
│   │    NVIDIA        │    │         KIRO         │    │      ZO AI       │           │
│   │    NIM API       │    │         CLI/IDE      │    │      NATIVE      │           │
│   │                  │    │                       │    │                  │           │
│   │ • GLM-5          │    │ • Claude             │    │ • GLM-5          │           │
│   │ • DeepSeek       │    │ • DeepSeek           │    │   (default)      │           │
│   │ • Llama 4        │    │ • MiniMax            │    │                  │           │
│   │ • MiniMax        │    │ • Qwen               │    │                  │           │
│   │ • Qwen           │    │ • GLM-5              │    │                  │           │
│   └────────────────┬─┘    └──────────┬───────────┘    └────────┬─────────┘           │
│                    │                  │                         │                      │
│                    └──────────────────┼─────────────────────────┘                      │
│                                        ▼                                              │
│                    ┌───────────────────────────────────┐                              │
│                    │           KAI                    │                              │
│                    │        (Learning Hub)            │                              │
│                    │                                  │                              │
│                    │ • Aggregates                     │                              │
│                    │   responses                      │                              │
│                    │ • Learns from                    │                              │
│                    │   every model                    │                              │
│                    │ • Stores in                      │                              │
│                    │   knowledge DB                   │                              │
│                    └──────────────────────────────────┘                              │
│                                        │                                              │
│                    ┌───────────────────┼───────────────────┐                         │
│                    ▼                   ▼                   ▼                         │
│   ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐           │
│   │     Telegram         │  │     Teldrive     │  │       Learning       │           │
│   │     (Channel)        │  │     (Storage)    │  │        Database      │           │
│   │                      │  │                  │  │                      │           │
│   │ • Notifications      │  │ • Files          │  │ • Sessions           │           │
│   │ • Alerts            │  │ • Chunks         │  │ • Learnings          │           │
│   │ • Commands          │  │ • Backups        │  │ • Patterns           │           │
│   └──────────────────────┘  └──────────────────┘  └──────────────────────┘           │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Model Providers

### 1. NVIDIA NIM API (Primary Multi-Model Access)

**Endpoint:** `https://integrate.api.nvidia.com/v1` (OpenAI-compatible)

**Available Models:**
| Model | Context | Cost | Best For |
|-------|---------|------|----------|
| `google/gemma-3-27b-it` | 128K | Low | General tasks |
| `meta/llama-4-scout-17b-16e-instruct` | 128K | Low | Coding |
| `deepseek-ai/deepseek-r1` | 128K | Low | Reasoning |
| `minimax/m2.5` | 200K | Low | Frontend/coding |
| `qwen/qwen3-coder` | 256K | Very Low | Long coding sessions |
| `zhipu/glm-5` | 200K | Low | Repo-scale work |

### 2. Kiro (AWS AI IDE/CLI)

**Installation:**
```bash
curl -fsSL https://cli.kiro.dev/install | bash
```

**Features:**
- Spec-driven development
- Multi-model support (Claude, DeepSeek, GLM-5, MiniMax, Qwen)
- Agent skills system
- Headless CI/CD pipelines

**Account:** nomad.dxb2@gmail.com (signed in via GitHub)

### 3. Zo Native AI

**Default Model:** GLM-5 (vercel:zai/glm-5)

## Connected Spaces

| Space | Role | Sync Status |
|-------|------|-------------|
| kaggu.zo.computer | Primary | ✅ Source |
| daily4.zo.computer | Secondary | 🔄 Synced |
| kaguujje3.zo.computer | Sync Target | ✅ Connected |

## Learning Stats (from kaggu.zo.computer)

- **Sessions:** 83
- **Patterns:** 34
- **Knowledge:** 33

---

*Synced from kaggu.zo.computer on 2026-05-08*
