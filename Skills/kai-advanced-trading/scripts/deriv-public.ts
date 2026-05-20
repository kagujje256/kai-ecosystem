#!/usr/bin/env bun
/**
 * KAI Deriv Public Analyzer
 * Uses public Deriv data for pattern detection - NO AUTH REQUIRED
 */

const DERIV_WS = 'wss://ws.derivws.com/websockets/v3?app_id=1089';

interface Pattern {
  type: 'boom_spike' | 'crash_drop' | 'digit_pattern' | 'reversal';
  confidence: number;
  description: string;
  entry?: number;
  target?: number;
}

class DerivPublicAnalyzer {
  private ws: WebSocket | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(DERIV_WS);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
    });
  }

  async analyzeSymbol(symbol: string, durationSec: number = 30): Promise<{
    ticks: number;
    patterns: Pattern[];
    prediction: string;
  }> {
    return new Promise((resolve) => {
      const collectedTicks: number[] = [];
      
      this.ws!.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
      
      const handler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.msg_type === 'tick' && data.tick?.quote) {
          collectedTicks.push(data.tick.quote);
          if (collectedTicks.length % 10 === 0) {
            console.log(`   ${symbol}: ${data.tick.quote.toFixed(4)} (${collectedTicks.length})`);
          }
        }
      };
      
      this.ws!.addEventListener('message', handler);
      
      setTimeout(() => {
        this.ws!.removeEventListener('message', handler);
        const patterns = this.detectPatterns(collectedTicks, symbol);
        const prediction = this.generatePrediction(patterns);
        resolve({ ticks: collectedTicks.length, patterns, prediction });
      }, durationSec * 1000);
    });
  }

  private detectPatterns(ticks: number[], symbol: string): Pattern[] {
    const patterns: Pattern[] = [];
    if (ticks.length < 10) return patterns;
    
    // BOOM spike detection
    if (symbol.includes('BOOM')) {
      let spikeCount = 0;
      for (let i = 1; i < ticks.length; i++) {
        if (ticks[i] - ticks[i-1] > 0.05) spikeCount++;
      }
      if (spikeCount > 2) {
        patterns.push({
          type: 'boom_spike',
          confidence: Math.min(spikeCount * 15, 85),
          description: `${spikeCount} spikes detected. BOOM pattern active.`,
          entry: ticks[ticks.length - 1],
          target: ticks[ticks.length - 1] + 0.5
        });
      }
    }
    
    // CRASH drop detection
    if (symbol.includes('CRASH')) {
      let dropCount = 0;
      for (let i = 1; i < ticks.length; i++) {
        if (ticks[i] - ticks[i-1] < -0.05) dropCount++;
      }
      if (dropCount > 2) {
        patterns.push({
          type: 'crash_drop',
          confidence: Math.min(dropCount * 20, 90),
          description: `${dropCount} sudden drops. CRASH pattern active.`
        });
      }
    }
    
    // Digit pattern
    const lastDigits = ticks.slice(-20).map(t => Math.floor(t * 10) % 10);
    const digitCounts: Record<number, number> = {};
    lastDigits.forEach(d => digitCounts[d] = (digitCounts[d] || 0) + 1);
    const sorted = Object.entries(digitCounts).sort((a, b) => b[1] - a[1]);
    patterns.push({
      type: 'digit_pattern',
      confidence: 60,
      description: `Hot: ${sorted[0]?.[0]}, Cold: ${sorted[sorted.length-1]?.[0]}`
    });
    
    return patterns;
  }

  private generatePrediction(patterns: Pattern[]): string {
    if (patterns.length === 0) return 'No pattern detected';
    const top = patterns.sort((a, b) => b.confidence - a.confidence)[0];
    return `🎯 ${top.description} (${top.confidence}%)`;
  }

  async getSymbols(): Promise<string[]> {
    return new Promise((resolve) => {
      this.ws!.send(JSON.stringify({ active_symbols: 'brief' }));
      const handler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.msg_type === 'active_symbols') {
          this.ws!.removeEventListener('message', handler);
          const synths = (data.active_symbols || [])
            .filter((s: any) => s.symbol?.includes('BOOM') || s.symbol?.includes('CRASH') || s.symbol?.includes('VOL'))
            .map((s: any) => s.symbol);
          resolve(synths);
        }
      };
      this.ws!.addEventListener('message', handler);
    });
  }

  disconnect() { this.ws?.close(); }
}

// CLI
const [cmd, symbol] = process.argv.slice(2);

async function main() {
  const analyzer = new DerivPublicAnalyzer();
  await analyzer.connect();
  
  if (cmd === 'symbols') {
    const symbols = await analyzer.getSymbols();
    console.log('\n🎲 SYNTHETICS:', symbols.join(', '));
  }
  
  if (cmd === 'analyze' && symbol) {
    console.log(`\n📊 Analyzing ${symbol}...`);
    const result = await analyzer.analyzeSymbol(symbol, 15);
    console.log(`\n${result.prediction}`);
  }
  
  analyzer.disconnect();
}

main().catch(console.error);
