# KAGUJJE Ecosystem Mesh Network

Three interconnected Zo Computers sharing a unified AI ecosystem.

## Network Topology

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │              KAI SYNC MESH NETWORK                          │
                    └─────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
│   KAGGU (1)       │        │   DAILY4 (2)      │        │   KAGUJJE3 (3)    │
│   Primary Hub     │◄──────►│   Secondary       │◄──────►│   New Node        │
│                   │        │                   │        │                   │
│ kaggu.zo.computer │        │ daily4.zo.computer│        │kaguujje3.zo.space│
│                   │        │                   │        │                   │
│ • 83 AI Sessions  │        │ • Sync Node       │        │ • Sync Node       │
│ • 34 Patterns     │        │ • Learning DB     │        │ • Learning DB     │
│ • 33 Knowledge    │        │ • Mirror          │        │ • Mirror          │
│ • Primary DB      │        │                   │        │                   │
└─────────┬─────────┘        └─────────┬─────────┘        └─────────┬─────────┘
          │                            │                            │
          │                            │                            │
          └────────────────────────────┴────────────────────────────┘
                              MCP CROSS-CONNECT
```

## Access Tokens

| Computer | Token | Role |
|----------|-------|------|
| kaggu (1) | `zo_sk_y_bxlT7XzZfxYyIdChqXxStyMmg1YIhgGllor3gh_nc` | Primary Hub |
| daily4 (2) | `zo_sk_LPz6Ag9IYJ1cgMIUISBajLmQMn1XtQX6_uRzyyyDj10` | Secondary Node |
| kaguujje3 (3) | `zo_sk_RTly_rRjGS8-WWbXCLF6ptM2aAP-CKvCgFGrtFOuDdw` | New Node |

## Sync Endpoints

| Computer | Sync URL |
|----------|----------|
| kaggu | https://kaggu.zo.space/api/kai/sync |
| daily4 | https://daily4.zo.space/api/kai/sync |
| kaguujje3 | https://kaguujje3.zo.space/api/kai/sync |

## Mesh Operations

### Broadcast to All Nodes
```bash
POST /api/kai/sync
{
  "action": "broadcast",
  "source": "kaggu",
  "data": { ... }
}
```

### Sync from Primary
```bash
GET /api/kai/sync?source=kaggu
```

### Mesh Status
```bash
GET /api/kai/mesh/status
```

## MCP Configuration (for External Clients)

Use this config to connect to ALL three computers simultaneously:

```json
{
  "mcpServers": {
    "kaggu-primary": {
      "url": "https://api.zo.computer/mcp",
      "headers": {
        "Authorization": "Bearer zo_sk_y_bxlT7XzZfxYyIdChqXxStyMmg1YIhgGllor3gh_nc"
      }
    },
    "daily4-secondary": {
      "url": "https://api.zo.computer/mcp",
      "headers": {
        "Authorization": "Bearer zo_sk_LPz6Ag9IYJ1cgMIUISBajLmQMn1XtQX6_uRzyyyDj10"
      }
    },
    "kaguujje3-node": {
      "url": "https://api.zo.computer/mcp",
      "headers": {
        "Authorization": "Bearer zo_sk_RTly_rRjGS8-WWbXCLF6ptM2aAP-CKvCgFGrtFOuDdw"
      }
    }
  }
}
```

## Shared Resources

- **Learning Database**: Synced across all nodes
- **Brand Infrastructure**: kagujje.com architecture
- **AI Models**: KAI multi-model ecosystem
- **Skills**: kai-sync, kagujje-manager
- **Bots**: Telegram @kagujjezo, WhatsApp KagujjeBot

## Coordination Rules

1. **kaggu (1)** is the primary source of truth
2. All nodes sync from kaggu every 6 hours
3. New learning sessions are pushed to kaggu first
4. In case of conflict, kaggu wins
5. All nodes can read from each other via MCP
