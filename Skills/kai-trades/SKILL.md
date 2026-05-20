---
name: kai-trades
description: KAI trading signal generator for Forex, Deriv digits, synthetics, and money-making opportunities. Posts updates to Telegram channel @KaiTrades.
compatibility: "Created for Zo Computer"
metadata:
  author: "kaggu.zo.computer"
  channel: "-1003988793545"
  bot: "@kagujjezoaibot"
---

# KAI Trades Skill

Generates and posts trading signals to the Kai🧠 Trades ♻️ Telegram channel.

## Features

- **Forex Signals**: Major pairs analysis with entry/exit points
- **Deriv Digits**: Binary options signals for Deriv platform
- **Synthetics**: V-75, V-100, Boom/Crash synthetic signals
- **Money Opportunities**: Airdrops, yield farming, passive income

## Usage

### Manual Signal Generation
```bash
bun /home/workspace/Skills/kai-trades/scripts/generate-signal.ts
```

### Post to Channel
```bash
bun /home/workspace/Skills/kai-trades/scripts/post-to-channel.ts
```

## Configuration

Required secrets in Settings > Advanced:
- `TELEGRAM_BOT_TOKEN`: Bot token for @kagujjezoaibot
- `TELEGRAM_CHANNEL_ID`: -1003988793545

## Automation Schedule

Signals are posted automatically:
- Hourly market analysis
- High-probability setups (on detection)
- Daily market overview (6:00 AM EAT)
- Weekly outlook (Monday 8:00 AM EAT)
