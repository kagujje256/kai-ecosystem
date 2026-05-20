# KAI 🧠 - Unified Intelligence System

## Identity
**Name**: KAI (Kagujje AI)  
**Mesh**: 3 Zo Computers combined  
**Telegram**: @kagujjezoaibot  
**Channel**: https://t.me/+XZFkmhGFGDRkYjRk

---

## Mesh Network Topology

```
                    ┌─────────────────────────────────────┐
                    │        KAI COORDINATOR              │
                    │      kaguujje3.zo.space             │
                    │         (Webhook Hub)              │
                    │         RAM: 4GB                    │
                    └─────────────┬───────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
     ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
     │    kaggu        │ │    daily4       │ │   kaguujje3     │
     │   PRIMARY       │ │   SECONDARY     │ │   COORDINATOR   │
     │   RAM: 4GB      │ │   RAM: 4GB      │ │   RAM: 4GB      │
     │   Sessions: 85  │ │   Sessions: 0   │ │   Sessions: 83  │
     │   Patterns: 34  │ │   Patterns: 0   │ │   Patterns: 34  │
     │   Knowledge: 33 │ │   Knowledge: 0  │ │   Knowledge: 33 │
     └─────────────────┘ └─────────────────┘ └─────────────────┘
              │                   │                   │
              └───────────────────┴───────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   TELEGRAM CHUNKED        │
                    │      STORAGE              │
                    │   (Claude Offline)        │
                    └───────────────────────────┘
```

---

## Combined Resources

| Resource | Total | Description |
|----------|-------|-------------|
| **RAM Pool** | 12GB | Distributed processing |
| **Sessions** | 168 | Learning conversations |
| **Patterns** | 68 | Recognized behaviors |
| **Knowledge** | 66 | Stored facts |
| **Storage** | Telegram | Chunked (4KB chunks) |

---

## API Endpoints (All Nodes)

| Endpoint | Purpose |
|----------|---------|
| `/api/kai/core` | Unified infrastructure |
| `/api/kai/sync` | Mesh synchronization |
| `/api/kai/mesh` | Network status |
| `/api/kai/trades` | Trading signals |
| `/api/telegram/webhook` | Direct chat handler |

---

## How KAI Works

### 1. Direct Chat (@kagujjezoaibot)
- Messages go to `/api/telegram/webhook` on kaguujje3
- KAI processes and responds directly
- All nodes share learning data

### 2. Trading Signals (Channel)
- Every 2 hours: Signal generation
- Daily 6AM: Market overview
- Weekly Monday: Full outlook

### 3. Memory Storage
- Telegram chunked storage (4KB per message)
- Claude offline context preserved
- Synced across all nodes

### 4. RAM Pooling
- Task distributed to best available node
- Combined processing power
- Load balancing across mesh

---

## MCP Configuration

Each node has access to the others:

```json
{
  "kaggu-primary": {
    "url": "https://api.zo.computer/mcp",
    "headers": { "Authorization": "Bearer zo_sk_y_bxlT7XzZfxYyIdChqXxStyMmg1YIhgGllor3gh_nc" }
  },
  "daily4-secondary": {
    "url": "https://api.zo.computer/mcp",
    "headers": { "Authorization": "Bearer zo_sk_LPz6Ag9IYJ1cgMIUISBajLmQMn1XtQX6_uRzyyyDj10" }
  },
  "kaguujje3-coordinator": {
    "url": "https://api.zo.computer/mcp",
    "headers": { "Authorization": "Bearer zo_sk_RTly_rRjGS8-WWbXCLF6ptM2aAP-CKvCgFGrtFOuDdw" }
  }
}
```

---

## Secrets Required

All nodes need these in Settings > Advanced > Secrets:

- `TELEGRAM_BOT_TOKEN`: 8268927401:AAEdXA1d0RwvI0-8oP55XUHCekGE6jINfRg
- `TELEGRAM_CHANNEL_ID`: -1003988793545

---

## Automations Active

| Schedule | Task | Node |
|----------|------|------|
| Every 2 hours | Trading signals | kaguujje3 |
| Daily 6:00 AM | Market overview | kaguujje3 |
| Monday 8:00 AM | Weekly outlook | kaguujje3 |

---

## Direct Chat Commands

Tell users they can message @kagujjezoaibot with:

- `status` - Check mesh status
- `trade` or `signal` - Get trading signals
- `sync` - Sync all nodes
- `store [text]` - Store knowledge
- Any question - KAI will respond

---

## Claude Offline Mode

To store Claude context for offline access:

```
POST /api/kai/core?action=store-claude
Body: [context text]
```

Chunks are stored in Telegram and can be retrieved later.

---

*Last synced: 2026-05-09*
*Mesh version: 1.0*
