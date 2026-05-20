# KAI Fund Transfer System - Setup Guide

## 🎯 OVERVIEW

KAI can now **automatically transfer funds** from exchanges to your wallets!

**Target Wallets:**
- BEP20: `0xb0e9e74e720ff587a5097595f2ff5917bbb84838`
- TRC20: `TDUmDLUgXFHcNiGQ6TeCf65pvwqditYi21`

**Features:**
✅ Auto-transfer when balance > $10
✅ Manual transfer via command
✅ Multi-exchange support
✅ Real-time notifications
✅ Transfer history tracking

---

## 📋 STEP-BY-STEP SETUP

### 1. BINANCE SETUP

**Step 1: Create API Key**
1. Go to: https://www.binance.com/en/my/settings/api-management
2. Click "Create API"
3. Label: "KAI Auto Transfer"
4. Select: "System generated"

**Step 2: Configure Permissions**
✅ Enable Reading
✅ Enable Spot & Margin Trading
✅ **Enable Withdrawals** (IMPORTANT!)
❌ Disable Perpetuals (safer)

**Step 3: Security**
- Enable IP whitelist (optional but recommended)
- Add your Zo Computer IP if needed

**Step 4: Save Keys**
Copy API Key and Secret Key

**Step 5: Add to Zo**
1. Go to: [Settings > Advanced](/?t=settings&s=advanced)
2. Add secrets:
   - `BINANCE_API_KEY` = your_api_key
   - `BINANCE_API_SECRET` = your_secret_key
3. Save

---

### 2. BYBIT SETUP

**Step 1: Create API Key**
1. Go to: https://www.bybit.com/app/user/api-management
2. Click "Create New API Key"
3. Type: "Read-Write"
4. Label: "KAI Transfer"

**Step 2: Permissions**
✅ Read
✅ Trade
✅ **Withdraw** (IMPORTANT!)
❌ Transfer (not needed)

**Step 3: Save Keys**
Copy API Key and Secret Key

**Step 4: Add to Zo**
1. Go to: [Settings > Advanced](/?t=settings&s=advanced)
2. Add secrets:
   - `BYBIT_API_KEY` = your_api_key
   - `BYBIT_API_SECRET` = your_secret_key

---

### 3. DERIV SETUP

**Step 1: Create API Token**
1. Go to: https://app.deriv.com/account/api-token
2. Click "Create Token"
3. Label: "KAI Auto Transfer"

**Step 2: Permissions**
✅ Read
✅ Trade
✅ **Payments** (for withdrawals)
✅ Trading information

**Step 3: Save Token**
Copy the API token

**Step 4: Add to Zo**
1. Go to: [Settings > Advanced](/?t=settings&s=advanced)
2. Add secret:
   - `DERIV_API_TOKEN` = your_token

---

### 4. KUCOIN SETUP (Optional)

**Step 1: Create API Key**
1. Go to: https://www.kucoin.com/account/api
2. Click "Create API"
3. Version: "V2"
4. Label: "KAI Transfer"

**Step 2: Permissions**
✅ General
✅ Trade
✅ **Transfer** (includes withdrawals)

**Step 3: Save Keys**
Copy API Key, Secret, and Passphrase

**Step 4: Add to Zo**
1. Go to: [Settings > Advanced](/?t=settings&s=advanced)
2. Add secrets:
   - `KUCOIN_API_KEY` = your_api_key
   - `KUCOIN_API_SECRET` = your_secret
   - `KUCOIN_API_PASSPHRASE` = your_passphrase

---

## 🚀 USING THE TRANSFER SYSTEM

### Check Status
```bash
curl "https://kaguujje3.zo.space/api/kai/transfer?action=status"
```

### Manual Transfer
```bash
curl -X POST "https://kaguujje3.zo.space/api/kai/transfer?action=transfer" \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "binance",
    "token": "USDT",
    "amount": 100,
    "to_wallet": "TRC20"
  }'
```

### Batch Transfer
```bash
curl -X POST "https://kaguujje3.zo.space/api/kai/transfer?action=batch-transfer" \
  -H "Content-Type: application/json" \
  -d '{
    "transfers": [
      {"exchange": "binance", "token": "USDT", "amount": 50},
      {"exchange": "bybit", "token": "USDC", "amount": 100}
    ]
  }'
```

---

## ⚙️ AUTO-TRANSFER SETTINGS

**Default Settings:**
- Minimum transfer: $10
- Target tokens: USDT, USDC, BNB, TRX
- Auto-enabled: Yes

**How Auto-Transfer Works:**
1. KAI checks exchange balances every hour
2. If balance > $10 for target tokens
3. Automatically transfers to your wallet
4. Sends Telegram notification

**Network Selection:**
- USDT → TRC20 (lower fees, ~$1)
- USDC → BEP20 (BSC, ~$0.10)
- BNB → BEP20 (native)
- TRX → TRC20 (native)

---

## 🔒 SECURITY RECOMMENDATIONS

### ⚠️ IMPORTANT SECURITY TIPS:

1. **Start Small**
   - Test with small amounts first ($10-50)
   - Verify transfers work correctly
   - Then increase amounts

2. **IP Whitelist**
   - Enable IP restriction on API keys
   - Only allow Zo Computer IPs
   - Contact support for Zo IP addresses

3. **Separate Accounts**
   - Consider using sub-accounts
   - Limit funds in trading accounts
   - Keep majority in cold storage

4. **Monitor Regularly**
   - Check transfer history daily
   - Set up alerts for large transfers
   - Review exchange activity logs

5. **API Key Rotation**
   - Rotate keys every 3-6 months
   - Immediately revoke if compromised
   - Use separate keys for different purposes

---

## 📊 TRANSFER FEES

| Network | Fee | Speed | Best For |
|---------|-----|-------|----------|
| TRC20 | ~$1 | 1-3 min | USDT transfers |
| BEP20 | ~$0.10 | 3-5 min | BNB, BSC tokens |
| ERC20 | ~$5-50 | 1-5 min | Not recommended |

**Recommendation:** Use TRC20 for USDT (lowest fees)

---

## 📱 NOTIFICATIONS

**KAI will notify you when:**
✅ Transfer initiated
✅ Transfer completed
✅ Transfer failed (with error)
✅ Balance threshold reached
✅ API key issues detected

**Notification channels:**
- Telegram DM
- Telegram Channel
- SMS (for important alerts)

---

## 🐛 TROUBLESHOOTING

### "API keys not configured"
- Double-check secret names in Settings
- Ensure no extra spaces in keys
- Verify keys are active on exchange

### "Transfer failed"
- Check withdrawal permissions enabled
- Verify sufficient balance + fees
- Check if 2FA is required

### "Insufficient funds"
- Account may have minimum balance requirements
- Check if funds are in correct wallet (Spot vs Futures)

### "Network error"
- Try different network (TRC20 vs BEP20)
- Check exchange status page
- Wait and retry

---

## 📈 TRANSFER HISTORY

**View History:**
```bash
curl "https://kaguujje3.zo.space/api/kai/transfer?action=status" | jq '.recent_transfers'
```

**History includes:**
- Timestamp
- Exchange
- Token & Amount
- Destination wallet
- Transaction hash
- Status (pending/completed/failed)

---

## 🎯 NEXT STEPS

1. ✅ **Set up at least ONE exchange** (Binance recommended)
2. ✅ **Test with small amount** ($10-50)
3. ✅ **Verify transfer received** in your wallet
4. ✅ **Enable auto-transfer** for passive income
5. ✅ **Monitor daily** for first week
6. ✅ **Increase amounts** once confident

---

## 💡 PRO TIPS

**Best Practices:**
1. Enable 2FA on all exchanges
2. Use hardware wallet for large amounts
3. Diversify across multiple exchanges
4. Keep some funds for trading fees
5. Monitor gas/network fees before transferring

**Optimization:**
- Transfer larger amounts to save on fees
- Use TRC20 for USDT whenever possible
- Transfer during low gas periods
- Consider stablecoin swaps for better rates

---

## 🆘 SUPPORT

**If you need help:**
1. Check exchange status pages
2. Review API documentation
3. Contact exchange support
4. Ask KAI for assistance

**KAI can help with:**
- Checking balances
- Suggesting optimal transfer times
- Calculating fees
- Setting up alerts
- Troubleshooting errors

---

**Your funds will now automatically flow to your wallets! 🧠💰**
