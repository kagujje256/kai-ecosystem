#!/usr/bin/env bun
/**
 * KaiPay - Mobile Money Payment Gateway
 * Collection & Disbursement for Uganda and Kenya
 * 
 * Brand: KaiPay - KAI Payment Gateway
 * Owner: Kagujje
 * 
 * Features:
 * - Pull money from mobile money accounts (after PIN authorization)
 * - Disburse funds to mobile money accounts
 * - Support for MTN, Airtel (Uganda) and M-PESA, Airtel (Kenya)
 * - Real-time webhooks
 * - Transaction tracking
 */

import fs from "fs";
import crypto from "crypto";

// Load configuration
const CONFIG = JSON.parse(fs.readFileSync("/home/workspace/kaipay-config.json", "utf-8"));

// Transaction database
interface Transaction {
  id: string;
  type: "collection" | "disbursement";
  status: "pending" | "processing" | "successful" | "failed" | "timeout";
  amount: number;
  currency: string;
  phone: string;
  country: string;
  provider: string;
  reference: string;
  description: string;
  callback_url?: string;
  created_at: string;
  updated_at: string;
  provider_reference?: string;
  failure_reason?: string;
  fee: number;
  net_amount: number;
}

// Webhook payload
interface WebhookPayload {
  event: string;
  transaction_id: string;
  status: string;
  amount: number;
  currency: string;
  phone: string;
  provider: string;
  reference: string;
  timestamp: string;
  signature: string;
}

class KaiPay {
  private transactions: Map<string, Transaction> = new Map();
  private merchants: Map<string, any> = new Map();
  private config: any;

  constructor(config: any = CONFIG) {
    this.config = config;
    this.loadTransactions();
    this.loadMerchants();
  }

  /**
   * COLLECTION: Pull money from customer's mobile money account
   * Customer must authorize with PIN on their device
   */
  async collectMoney(params: {
    amount: number;
    phone: string;
    country: "UG" | "KE";
    reference: string;
    description: string;
    callback_url?: string;
  }): Promise<Transaction> {
    const { amount, phone, country, reference, description, callback_url } = params;

    // Validate amount
    const limits = this.getLimits(country, "collection");
    if (amount < limits.min || amount > limits.max) {
      throw new Error(`Amount must be between ${limits.min} and ${limits.max} ${this.getCurrency(country)}`);
    }

    // Detect provider
    const provider = this.detectProvider(phone, country);
    if (!provider) {
      throw new Error("Unable to detect mobile money provider from phone number");
    }

    // Calculate fees
    const fee = this.calculateFee(amount, country, "collection");
    const netAmount = amount - fee;

    // Create transaction
    const transaction: Transaction = {
      id: this.generateId(),
      type: "collection",
      status: "pending",
      amount,
      currency: this.getCurrency(country),
      phone: this.formatPhone(phone, country),
      country,
      provider,
      reference,
      description,
      callback_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fee,
      net_amount: netAmount
    };

    this.transactions.set(transaction.id, transaction);
    this.saveTransactions();

    // Initiate collection with provider
    try {
      const result = await this.initiateCollection(transaction);
      transaction.status = "processing";
      transaction.provider_reference = result.provider_reference;
      this.saveTransactions();
    } catch (error: any) {
      transaction.status = "failed";
      transaction.failure_reason = error.message;
      this.saveTransactions();
      throw error;
    }

    return transaction;
  }

  /**
   * DISBURSEMENT: Send money to customer's mobile money account
   */
  async disburseMoney(params: {
    amount: number;
    phone: string;
    country: "UG" | "KE";
    reference: string;
    description: string;
    callback_url?: string;
  }): Promise<Transaction> {
    const { amount, phone, country, reference, description, callback_url } = params;

    // Validate amount
    const limits = this.getLimits(country, "disbursement");
    if (amount < limits.min || amount > limits.max) {
      throw new Error(`Amount must be between ${limits.min} and ${limits.max} ${this.getCurrency(country)}`);
    }

    // Detect provider
    const provider = this.detectProvider(phone, country);
    if (!provider) {
      throw new Error("Unable to detect mobile money provider from phone number");
    }

    // Calculate fees
    const fee = this.calculateFee(amount, country, "disbursement");
    const totalAmount = amount + fee;

    // Create transaction
    const transaction: Transaction = {
      id: this.generateId(),
      type: "disbursement",
      status: "pending",
      amount,
      currency: this.getCurrency(country),
      phone: this.formatPhone(phone, country),
      country,
      provider,
      reference,
      description,
      callback_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fee,
      net_amount: amount
    };

    this.transactions.set(transaction.id, transaction);
    this.saveTransactions();

    // Initiate disbursement with provider
    try {
      const result = await this.initiateDisbursement(transaction);
      transaction.status = "processing";
      transaction.provider_reference = result.provider_reference;
      this.saveTransactions();
    } catch (error: any) {
      transaction.status = "failed";
      transaction.failure_reason = error.message;
      this.saveTransactions();
      throw error;
    }

    return transaction;
  }

  /**
   * Get transaction status
   */
  getTransaction(transactionId: string): Transaction | undefined {
    return this.transactions.get(transactionId);
  }

  /**
   * Get all transactions
   */
  getAllTransactions(filter?: {
    status?: string;
    type?: string;
    country?: string;
    limit?: number;
  }): Transaction[] {
    let transactions = Array.from(this.transactions.values());

    if (filter) {
      if (filter.status) {
        transactions = transactions.filter(t => t.status === filter.status);
      }
      if (filter.type) {
        transactions = transactions.filter(t => t.type === filter.type);
      }
      if (filter.country) {
        transactions = transactions.filter(t => t.country === filter.country);
      }
      if (filter.limit) {
        transactions = transactions.slice(0, filter.limit);
      }
    }

    return transactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Handle webhook from provider
   */
  async handleWebhook(payload: any): Promise<void> {
    const transaction = this.transactions.get(payload.transaction_id);
    if (!transaction) {
      console.error(`Transaction not found: ${payload.transaction_id}`);
      return;
    }

    transaction.status = payload.status;
    transaction.updated_at = new Date().toISOString();
    
    if (payload.status === "successful") {
      console.log(`✅ Transaction ${transaction.id} successful`);
    } else if (payload.status === "failed") {
      transaction.failure_reason = payload.failure_reason;
      console.error(`❌ Transaction ${transaction.id} failed: ${payload.failure_reason}`);
    }

    this.saveTransactions();

    // Send webhook to merchant
    if (transaction.callback_url) {
      await this.sendMerchantWebhook(transaction);
    }
  }

  // Private methods

  private async initiateCollection(transaction: Transaction): Promise<{ provider_reference: string }> {
    /**
     * MARZPAY INTEGRATION (Easiest for Uganda)
     * 
     * To use MarzPay:
     * 1. Sign up at wallet.wearemarz.com
     * 2. Get API key and secret
     * 3. Set in environment: MARZPAY_API_KEY, MARZPAY_API_SECRET
     * 
     * Endpoint: POST https://wallet.wearemarz.com/api/v1/collect-money
     * 
     * Example:
     * const response = await fetch("https://wallet.wearemarz.com/api/v1/collect-money", {
     *   method: "POST",
     *   headers: {
     *     "Authorization": `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
     *     "Content-Type": "application/json"
     *   },
     *   body: JSON.stringify({
     *     amount: transaction.amount,
     *     phone_number: transaction.phone,
     *     country: transaction.country,
     *     reference: transaction.reference,
     *     description: transaction.description,
     *     callback_url: this.config.webhooks.collection_callback
     *   })
     * });
     */

    /**
     * MTN MOMO API (Direct integration)
     * 
     * To use MTN MoMo:
     * 1. Sign up at momodeveloper.mtn.com
     * 2. Subscribe to Collection API
     * 3. Get subscription key, API user, API key
     * 
     * Endpoint: POST https://momodeveloper.mtn.com/collection/v2_0/requesttopay
     * 
     * Example:
     * const response = await fetch("https://momodeveloper.mtn.com/collection/v2_0/requesttopay", {
     *   method: "POST",
     *   headers: {
     *     "X-Reference-Id": transaction.id,
     *     "X-Target-Environment": "production",
     *     "Ocp-Apim-Subscription-Key": subscriptionKey,
     *     "Authorization": `Bearer ${accessToken}`,
     *     "Content-Type": "application/json"
     *   },
     *   body: JSON.stringify({
     *     amount: transaction.amount.toString(),
     *     currency: transaction.currency,
     *     externalId: transaction.reference,
     *     payer: {
     *       partyIdType: "MSISDN",
     *       partyId: transaction.phone.replace("+", "")
     *     },
     *     payerMessage: transaction.description,
     *     payeeNote: transaction.description
     *   })
     * });
     */

    /**
     * AIRTEL MONEY API (Direct integration)
     * 
     * To use Airtel Money:
     * 1. Sign up at developers.airtel.africa
     * 2. Create application with Collection API
     * 3. Get client ID and secret
     * 
     * Endpoint: POST https://openapi.airtel.africa/merchant/v1/payments/
     * 
     * Example:
     * const response = await fetch("https://openapi.airtel.africa/merchant/v1/payments/", {
     *   method: "POST",
     *   headers: {
     *     "X-Country": transaction.country,
     *     "X-Currency": transaction.currency,
     *     "Authorization": `Bearer ${accessToken}`,
     *     "Content-Type": "application/json"
     *   },
     *   body: JSON.stringify({
     *     reference: transaction.reference,
     *     subscriber: {
     *       country: transaction.country,
     *       currency: transaction.currency,
     *       msisdn: transaction.phone.replace("+", "")
     *     },
     *     transaction: {
     *       amount: transaction.amount,
     *       country: transaction.country,
     *       currency: transaction.currency,
     *       id: transaction.id
     *     }
     *   })
     * });
     */

    // Simulated response for now
    console.log(`📱 Collection initiated: ${transaction.phone} - ${transaction.amount} ${transaction.currency}`);
    console.log(`⏳ Waiting for customer to authorize with PIN...`);
    
    return {
      provider_reference: `SIM_${transaction.provider}_${Date.now()}`
    };
  }

  private async initiateDisbursement(transaction: Transaction): Promise<{ provider_reference: string }> {
    /**
     * MARZPAY DISBURSEMENT
     * 
     * Endpoint: POST https://wallet.wearemarz.com/api/v1/send-money
     * 
     * Example:
     * const response = await fetch("https://wallet.wearemarz.com/api/v1/send-money", {
     *   method: "POST",
     *   headers: {
     *     "Authorization": `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
     *     "Content-Type": "application/json"
     *   },
     *   body: JSON.stringify({
     *     amount: transaction.amount,
     *     phone_number: transaction.phone,
     *     country: transaction.country,
     *     reference: transaction.reference,
     *     description: transaction.description,
     *     callback_url: this.config.webhooks.disbursement_callback
     *   })
     * });
     */

    /**
     * MTN MOMO DISBURSEMENT
     * 
     * Endpoint: POST https://momodeveloper.mtn.com/disbursement/v2_0/deposit
     * 
     * Example:
     * const response = await fetch("https://momodeveloper.mtn.com/disbursement/v2_0/deposit", {
     *   method: "POST",
     *   headers: {
     *     "X-Reference-Id": transaction.id,
     *     "X-Target-Environment": "production",
     *     "Ocp-Apim-Subscription-Key": disbursementSubscriptionKey,
     *     "Authorization": `Bearer ${accessToken}`,
     *     "Content-Type": "application/json"
     *   },
     *   body: JSON.stringify({
     *     amount: transaction.amount.toString(),
     *     currency: transaction.currency,
     *     externalId: transaction.reference,
     *     payee: {
     *       partyIdType: "MSISDN",
     *       partyId: transaction.phone.replace("+", "")
     *     },
     *     payerMessage: transaction.description,
     *     payeeNote: transaction.description
     *   })
     * });
     */

    /**
     * AIRTEL MONEY DISBURSEMENT
     * 
     * Endpoint: POST https://openapi.airtel.africa/disbursements/
     * 
     * Requires:
     * - PIN encryption with RSA public key
     * - Public key from GET /v1/rsa/encryption-keys
     */

    console.log(`💸 Disbursement initiated: ${transaction.phone} - ${transaction.amount} ${transaction.currency}`);
    
    return {
      provider_reference: `SIM_DISBURSE_${transaction.provider}_${Date.now()}`
    };
  }

  private detectProvider(phone: string, country: string): string | null {
    const cleanPhone = phone.replace(/\D/g, "");
    const providers = this.config.providers[country === "UG" ? "uganda" : "kenya"];

    for (const [providerName, providerConfig] of Object.entries(providers)) {
      const patterns = (providerConfig as any).patterns;
      for (const pattern of patterns) {
        if (cleanPhone.startsWith(pattern.replace("0", "")) || 
            cleanPhone.startsWith(pattern.replace("0", "256")) ||
            cleanPhone.startsWith(pattern.replace("0", "254"))) {
          return (providerConfig as any).provider_code;
        }
      }
    }

    return null;
  }

  private formatPhone(phone: string, country: string): string {
    const cleanPhone = phone.replace(/\D/g, "");
    const prefix = country === "UG" ? "256" : "254";

    if (cleanPhone.startsWith("0")) {
      return `+${prefix}${cleanPhone.substring(1)}`;
    } else if (cleanPhone.startsWith(prefix)) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith(`+${prefix}`)) {
      return cleanPhone;
    } else {
      return `+${prefix}${cleanPhone}`;
    }
  }

  private getCurrency(country: string): string {
    return country === "UG" ? "UGX" : "KES";
  }

  private getLimits(country: string, type: "collection" | "disbursement"): { min: number; max: number } {
    const countryConfig = this.config.providers[country === "UG" ? "uganda" : "kenya"];
    const firstProvider = Object.values(countryConfig)[0] as any;
    return firstProvider[`${type}_limits`];
  }

  private calculateFee(amount: number, country: string, type: "collection" | "disbursement"): number {
    const feeConfig = this.config.fes[type][country === "UG" ? "uganda" : "kenya"];
    return Math.ceil(amount * (feeConfig.percentage / 100) + feeConfig.fixed);
  }

  private generateId(): string {
    return `KP_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  }

  private async sendMerchantWebhook(transaction: Transaction): Promise<void> {
    const payload: WebhookPayload = {
      event: transaction.type === "collection" ? "payment.received" : "payment.sent",
      transaction_id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      phone: transaction.phone,
      provider: transaction.provider,
      reference: transaction.reference,
      timestamp: new Date().toISOString(),
      signature: this.generateSignature(transaction)
    };

    try {
      const response = await fetch(transaction.callback_url!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-KaiPay-Signature": payload.signature
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`Webhook failed for transaction ${transaction.id}`);
      }
    } catch (error) {
      console.error(`Webhook error for transaction ${transaction.id}:`, error);
    }
  }

  private generateSignature(transaction: Transaction): string {
    const data = `${transaction.id}${transaction.amount}${transaction.currency}${transaction.phone}`;
    return crypto.createHmac("sha256", "kaipay_webhook_secret").update(data).digest("hex");
  }

  private loadTransactions(): void {
    try {
      const filePath = this.config.database.transactions_file;
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        this.transactions = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }

  private saveTransactions(): void {
    try {
      const filePath = this.config.database.transactions_file;
      const data = Object.fromEntries(this.transactions);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error saving transactions:", error);
    }
  }

  private loadMerchants(): void {
    try {
      const filePath = this.config.database.merchants_file;
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        this.merchants = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error("Error loading merchants:", error);
    }
  }
}

// Export
export { KaiPay, Transaction, WebhookPayload };

// Demo/test
if (import.meta.main) {
  const kaipay = new KaiPay();

  console.log("\n" + "═".repeat(60));
  console.log("💳 KaiPay - KAI Payment Gateway");
  console.log("═".repeat(60));
  console.log("\n📱 Mobile Money Payment Collection & Disbursement");
  console.log("🌍 Countries: Uganda, Kenya");
  console.log("📶 Providers: MTN, Airtel, M-PESA");
  console.log("\n" + "═".repeat(60) + "\n");

  // Example: Collection
  console.log("EXAMPLE: Collect 50,000 UGX from customer\n");
  try {
    const collection = await kaipay.collectMoney({
      amount: 50000,
      phone: "0771234567",
      country: "UG",
      reference: "ORDER_12345",
      description: "Payment for trading signals",
      callback_url: "https://example.com/webhook"
    });
    console.log("✅ Collection initiated:");
    console.log(`   Transaction ID: ${collection.id}`);
    console.log(`   Phone: ${collection.phone}`);
    console.log(`   Amount: ${collection.amount} ${collection.currency}`);
    console.log(`   Fee: ${collection.fee} ${collection.currency}`);
    console.log(`   Net: ${collection.net_amount} ${collection.currency}`);
    console.log(`   Status: ${collection.status}\n`);
  } catch (error: any) {
    console.error("❌ Error:", error.message, "\n");
  }

  // Example: Disbursement
  console.log("EXAMPLE: Disburse 100,000 UGX to customer\n");
  try {
    const disbursement = await kaipay.disburseMoney({
      amount: 100000,
      phone: "0709876543",
      country: "UG",
      reference: "PAYOUT_67890",
      description: "Trading profit withdrawal",
      callback_url: "https://example.com/webhook"
    });
    console.log("✅ Disbursement initiated:");
    console.log(`   Transaction ID: ${disbursement.id}`);
    console.log(`   Phone: ${disbursement.phone}`);
    console.log(`   Amount: ${disbursement.amount} ${disbursement.currency}`);
    console.log(`   Fee: ${disbursement.fee} ${disbursement.currency}`);
    console.log(`   Status: ${disbursement.status}\n`);
  } catch (error: any) {
    console.error("❌ Error:", error.message, "\n");
  }

  console.log("═".repeat(60) + "\n");
}