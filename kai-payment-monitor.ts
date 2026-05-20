#!/usr/bin/env bun
/**
 * KAI Payment Verification System
 * Real-time blockchain payment checker
 */

const BEP20_WALLET = "0xb0e9e74e720ff587a5097595f2ff5917bbb84838";
const TRC20_WALLET = "TDUmDLUgXFHcNiGQ6TeCf65pvwqditYi21";

// Blockchain APIs (free tiers)
const APIS = {
  bscscan: "https://api.bscscan.com/api",
  tronscan: "https://apilist.tronscanapi.com/api"
};

interface Payment {
  txHash: string;
  amount: number;
  token: string;
  chain: "BEP20" | "TRC20";
  timestamp: number;
  confirmed: boolean;
}

let detectedPayments: Payment[] = [];

// Check BSC for USDT payments
async function checkBSCPayments(): Promise<Payment[]> {
  try {
    const response = await fetch(
      `${APIS.bscscan}?module=account&action=tokentx&contractaddress=0x55d398326f99059fF775485246999027B3197955&address=${BEP20_WALLET}&page=1&offset=10&sort=desc`
    );
    const data = await response.json();
    
    if (data.status === "1" && data.result) {
      return data.result.map((tx: any) => ({
        txHash: tx.hash,
        amount: parseFloat(tx.value) / 1e18,
        token: "USDT",
        chain: "BEP20" as const,
        timestamp: parseInt(tx.timeStamp) * 1000,
        confirmed: tx.confirmations > 3
      }));
    }
  } catch (error) {
    console.log("BSC API error:", error);
  }
  
  return [];
}

// Check TRON for USDT payments
async function checkTRONPayments(): Promise<Payment[]> {
  try {
    const response = await fetch(
      `${APIS.tronscan}/transaction?sort=-timestamp&count=true&limit=10&start=0&address=${TRC20_WALLET}`
    );
    const data = await response.json();
    
    if (data.data) {
      return data.data
        .filter((tx: any) => tx.tokenInfo?.symbol === "USDT")
        .map((tx: any) => ({
          txHash: tx.hash,
          amount: parseFloat(tx.amount) / 1e6,
          token: "USDT",
          chain: "TRC20" as const,
          timestamp: tx.timestamp,
          confirmed: tx.confirmed
        }));
    }
  } catch (error) {
    console.log("TRON API error:", error);
  }
  
  return [];
}

// Main monitoring loop
async function monitorPayments() {
  console.log("💳 KAI Payment Monitor Started");
  console.log(`📊 Monitoring wallets:`);
  console.log(`  BEP20: ${BEP20_WALLET}`);
  console.log(`  TRC20: ${TRC20_WALLET}`);
  
  // Check every 30 seconds
  setInterval(async () => {
    const [bscPayments, tronPayments] = await Promise.all([
      checkBSCPayments(),
      checkTRONPayments()
    ]);
    
    const allPayments = [...bscPayments, ...tronPayments];
    
    // New payments detected
    const newPayments = allPayments.filter(p => 
      !detectedPayments.find(dp => dp.txHash === p.txHash)
    );
    
    if (newPayments.length > 0) {
      detectedPayments.push(...newPayments);
      
      console.log(`\n💰 NEW PAYMENTS DETECTED:`);
      newPayments.forEach(p => {
        console.log(`  ${p.amount} USDT (${p.chain}) - ${p.confirmed ? '✅ Confirmed' : '⏳ Pending'}`);
        console.log(`  TX: ${p.txHash}`);
      });
      
      // TODO: Trigger order fulfillment
    }
  }, 30000);
  
  // Initial check
  const [bsc, tron] = await Promise.all([
    checkBSCPayments(),
    checkTRONPayments()
  ]);
  detectedPayments = [...bsc, ...tron];
  
  console.log(`\n📊 Recent payments loaded: ${detectedPayments.length}`);
  console.log("👀 Monitoring for new payments...\n");
}

monitorPayments();
