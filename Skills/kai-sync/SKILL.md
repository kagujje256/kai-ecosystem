---
name: kai-sync
description: KAI multi-space synchronization - syncs learning database between kaggu.zo and connected spaces. Use when setting up KAI on a new space or syncing data between spaces.
compatibility: "Created for Zo Computer"
metadata:
  author: "kaggu.zo.computer"
  shared_with:
    - "daily4.zo"
    - "kaguujje3.zo"
---

# KAI Sync Skill

Synchronizes KAI learning data between multiple Zo Computer spaces.

## Sync Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/kai/status` | GET | Get current sync status |
| `/api/kai/sync` | GET | Pull all data since timestamp |
| `/api/kai/sync` | POST | Push new data to merge |

## Usage

### Pull from kaggu.zo (Primary)

```bash
curl -s https://kaguujje3.zo.space/api/kai/sync
```

### Push to kaggu.zo

```bash
curl -X POST https://kaguujje3.zo.space/api/kai/sync \
  -H "Content-Type: application/json" \
  -d '{"sessions": [...], "patterns": [...], "knowledge": [...]}'
```

## View Sync Status

Open: https://kaguujje3.zo.space/kai-sync

---

*Part of the KAGUJJE ecosystem*
