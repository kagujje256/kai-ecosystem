# KaiPay - Mobile Money Payment Gateway

## 🎯 OVERVIEW

KaiPay is a complete mobile money payment collection and disbursement system for **Uganda** and **Kenya**, similar to MarzPay.

### ✅ FEATURES

- **Collection**: Pull money from customer's mobile money account (USSD PIN prompt)
- **Disbursement**: Send money to customer's mobile money account
- **Multi-Provider**: MTN, Airtel (Uganda), M-Pesa, Airtel (Kenya)
- **Real-time Webhooks**: Instant payment notifications
- **Custom Brand**: KaiPay - A Kagujje Innovation

---

## 🌐 LIVE DASHBOARD

**URL**: https://kaguujje3.zo.space/kaipay

---

## 📱 SUPPORTED PROVIDERS

### UGANDA 🇺🇬
| Provider | Code | Collection | Disbursement |
|----------|------|------------|--------------|
| MTN Mobile Money | MTN_UG | ✅ | ✅ |
| Airtel Money | AIRTEL_UG | ✅ | ✅ |

### KENYA 🇰🇪
| Provider | Code | Collection | Disbursement |
|----------|------|------------|--------------|
| M-Pesa | MPESA_KE | ✅ | ✅ |
| Airtel Money | AIRTEL_KE | ✅ | ✅ |

---

## 🔌 API ENDPOINTS

### Base URL
```
https://kaguujje3.zo.space/api/kaipay
```

### 1. Collection (Pull Money)

**POST /api/kaipay/collect**

Request:
```json
{
  "amount": 10000,
  "phone": "0772123456",
  "country": "UG",
  "reference": "ORDER_12345",
  "description": "Payment for order #12345",
  "callback_url": "https://your-website.com/webhook"
}
```

Response:
```json
{
  "success": true,
  "message": "Collection request initiated",
  "transaction": {
    "id": "KP_COLL_1234567890_abc123",
    "status": "processing",
    "amount": 10000,
    "currency": "UGX",
    "phone": "+256772123456",
    "provider": "MTN Mobile Money",
    "fee": 250,
    "net_amount": 9750
  }
}
```

### 2. Disbursement (Send Money)

**POST /api/kaipay/disburse**

Request:
```json
{
  "amount": 50000,
  "phone": "0772123456",
  "country": "UG",
  "reference": "PAYOUT_001",
  "description": "Withdrawal payment"
}
```

### 3. Check Status

**GET /api/kaipay/collect?action=status&id=KP_COLL_xxx**

### 4. List Transactions

**GET /api/kaipay/collect?action=list**

### 5. Get Config

**GET /api/kaipay/collect?action=config**

---

## 💰 FEES

| Country | Collection Fee | Disbursement Fee |
|---------|---------------|------------------|
| Uganda | 2.5% | 2.5% |
| Kenya | 2.0% | 2.0% |

---

## 🔧 INTEGRATION OPTIONS

### Option 1: MarzPay (Recommended - Easiest)

MarzPay already has integrations with MTN, Airtel, and M-Pesa.

**Setup:**
1. Register at https://wallet.wearemarz.com
2. Get API Key and Secret
3. Add to Zo secrets:
   - `MARZPAY_API_KEY`
   - `MARZPAY_API_SECRET`
4. Uncomment MarzPay code in `/api/kaipay/collect`

**Benefits:**
- ✅ No need for separate MTN/Airtel integrations
- ✅ Single API for all providers
- ✅ Already has merchant accounts
- ✅ Instant activation

### Option 2: Direct MTN MoMo API

**Uganda:**
1. Register at https://momodeveloper.mtn.com
2. Subscribe to Collection API ($50/month)
3. Subscribe to Disbursement API ($50/month)
4. Create API User and get credentials
5. Add to Zo secrets:
   - `MTN_COLLECTION_SUBSCRIPTION_KEY`
   - `MTN_DISBURSEMENT_SUBSCRIPTION_KEY`
   - `MTN_API_USER`
   - `MTN_API_KEY`

**Kenya:**
- MTN Kenya has different API endpoints
- Requires Kenyan business registration

### Option 3: Direct Airtel Money API

1. Contact Airtel Business
2. Sign merchant agreement
3. Get Client ID and Client Secret
4. Add to Zo secrets:
   - `AIRTEL_CLIENT_ID`
   - `AIRTEL_CLIENT_SECRET`

### Option 4: M-Pesa (Safaricom)

1. Register at https://developer.safaricom.co.ke
2. Create Lipa Na M-Pesa Online app
3. Get credentials:
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_PASSKEY`
   - `MPESA_SHORTCODE`

---

## 🚀 QUICK START (Using MarzPay)

1. **Get MarzPay Account**
   - Visit: https://wallet.wearemarz.com
   - Register with your email
   - Complete KYC (if required)

2. **Add Credentials to Zo**
   - Go to: Settings > Advanced
   - Add secrets:
     ```
     MARZPAY_API_KEY=your_key
     MARZPAY_API_SECRET=your_secret
     ```

3. **Test Collection**
   ```bash
   curl -X POST https://kaguujje3.zo.space/api/kaipay/collect \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 1000,
       "phone": "0772123456",
       "country": "UG",
       "reference": "TEST_001",
       "description": "Test payment"
     }'
   ```

4. **Customer Receives USSD Prompt**
   - Customer enters PIN
   - Payment processed
   - Webhook sent to your server

---

## 💼 BUSINESS USE CASES

### 1. E-commerce Checkout
```typescript
// Your e-commerce site
const response = await fetch("https://kaguujje3.zo.space/api/kaipay/collect", {
  method: "POST",
  body: JSON.stringify({
    amount: cartTotal,
    phone: customerPhone,
    country: "UG",
    reference: `ORDER_${orderId}`,
    description: `Payment for order #${orderId}`
  })
});
```

### 2. Freelancer/Service Payments
- Collect payments for services
- Automatic invoicing
- Instant confirmation

### 3. Micro-Lending / SACCO
- Collect loan repayments
- Disburse loans to borrowers
- Track all transactions

### 4. Subscription Services
- Monthly fee collection
- Automatic recurring billing
- Failed payment retry

### 5. P2P Payment Platform
- Users send money to each other
- Platform takes fee
- Instant disbursement

---

## 📊 TRANSACTION LIMITS

### Uganda
| Provider | Min | Max | Daily Limit |
|----------|-----|-----|-------------|
| MTN | 500 UGX | 5,000,000 UGX | 15,000,000 UGX |
| Airtel | 500 UGX | 4,000,000 UGX | 10,000,000 UGX |

### Kenya
| Provider | Min | Max | Daily Limit |
|----------|-----|-----|-------------|
| M-Pesa | 10 KES | 150,000 KES | 300,000 KES |
| Airtel | 10 KES | 140,000 KES | 280,000 KES |

---

## 🎯 NEXT STEPS

1. ✅ **System is LIVE** - Dashboard and API are operational
2. ⏳ **Choose Integration** - MarzPay (easiest) or Direct APIs
3. ⏳ **Add Credentials** - Get API keys and add to Zo secrets
4. ⏳ **Start Accepting Payments** - Integrate with your business

---

## 📞 SUPPORT

- **Email**: shardickkasiba@gmail.com
- **Telegram**: @dicksonkagujje
- **Dashboard**: https://kaguujje3.zo.space/kaipay

---

## 🏷️ BRAND

**KaiPay** - A Kagujje Innovation

Part of the KAI Ecosystem - Autonomous Money Generation System

---

*Created: 2026-05-09*
*Version: 1.0.0*