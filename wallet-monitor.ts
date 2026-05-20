#!/usr/bin/env bun
/**
 * KAI Wallet Monitor - Live Balance Tracking
 * Monitors BEP20 & TRC20 wallets for Shardick's earnings
 */

import { readFileSync, writeFileSync, existsSync } from "fs";

const WALLETS_FILE = "/home/workspace/Skills/kai-learning/data/wallets.json";
const WALLETS = {
  BEP20: "0xb0e9e74e720ff587a5097595f2ff5917bbb84838",
  TRC20: "TDUmDLUgXFHcNiGQ6TeCf65pvwqditYi21"
};

interface WalletBalance {
  address: string;
  network: string;
  balance: string;
  usdValue: number;
  lastUpdated: string;
}

// Check BSC balance using public API
async function getBSCBalance(address: string): Promise<string> {
  try {
    // Using public BSC explorer API
    const response = await fetch(`https://api.bscscan.com/api?module=account&action=balance&address=${address}&tag=latest&apikey=YourApiKeyToken`);
    const data = await response.json() as any;
    
    if (data.status === "1") {
      const wei = BigInt(data.result);
      const bnb = Number(wei) / 1e18;
      return bnb.toFixed(6);
    }
    return "0.000000";
  } catch (error) {
    return "ERROR";
  }
}

// Check TRON balance
async function getTRONBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`https://apilist.tronscanapi.com/api/account?address=${address}`);
    const data = await response.json() as any;
    
    if (data.balance) {
      const sun = BigInt(data.balance);
      const trx = Number(sun) / 1e6;
      return trx.toFixed(6);
    }
    return "0.000000";
  } catch (error) {
    return "ERROR";
  }
}

// Check USDT (BEP20) balance
async function getUSDTBalance(address: string): Promise<string> {
  try {
    // USDT contract on BSC
    const usdtContract = "0x55d398326f99059fF775485246999027B3197955";
    const response = await fetch(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${usdtContract}&address=${address}&tag=latest`);
    const data = await response.json() as any;
    
    if (data.status === "1") {
      const balance = Number(data.result) / 1e18;
      return balance.toFixed(2);
    }
    return "0.00";
  } catch (error) {
    return "ERROR";
  }
}

// Monitor all wallets
async function monitorWallets(): Promise<void> {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧠 KAI WALLET MONITOR");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Check BSC
  console.log("📊 BEP20 Wallet:");
  console.log(`   Address: ${WALLETS.BEP20}`);
  const bscBalance = await getBSCBalance(WALLETS.BEP20);
  const usdtBalance = await getUSDTBalance(WALLETS.BEP20);
  console.log(`   BNB: ${bscBalance}`);
  console.log(`   USDT: ${usdtBalance}`);
  console.log("");
  
  // Check TRON
  console.log("📊 TRC20 Wallet:");
  console.log(`   Address: ${WALLETS.TRC20}`);
  const tronBalance = await getTRONBalance(WALLETS.TRC20);
  console.log(`   TRX: ${tronBalance}`);
  console.log("");
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Wallet check complete");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Save to file
  const data = {
    timestamp: new Date().toISOString(),
    wallets: {
      bep20: {
        address: WALLETS.BEP20,
        bnb: bscBalance,
        usdt: usdtBalance
      },
      trc20: {
        address: WALLETS.TRC20,
        trx: tronBalance
      }
    }
  };
  
  writeFileSync(WALLETS_FILE, JSON.stringify(data, null, 2));
}

// Run monitor
monitorWallets().catch(console.error);
