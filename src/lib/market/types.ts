import type { MarketObservation } from "../schemas";

export interface MarketDataProvider {
  readonly name: string;
  getMarketObservation(asset: string): Promise<MarketObservation>;
}

export interface AssetMapping {
  symbol: string;         // e.g. "BTC"
  binanceSymbol: string;  // e.g. "BTCUSDT"
  paprikaId: string;      // e.g. "btc-bitcoin"
}

export const SUPPORTED_ASSETS: Record<string, AssetMapping> = {
  BTC: {
    symbol: "BTC",
    binanceSymbol: "BTCUSDT",
    paprikaId: "btc-bitcoin",
  },
  ETH: {
    symbol: "ETH",
    binanceSymbol: "ETHUSDT",
    paprikaId: "eth-ethereum",
  },
  SOL: {
    symbol: "SOL",
    binanceSymbol: "SOLUSDT",
    paprikaId: "sol-solana",
  },
  XRP: {
    symbol: "XRP",
    binanceSymbol: "XRPUSDT",
    paprikaId: "xrp-xrp",
  },
  DOGE: {
    symbol: "DOGE",
    binanceSymbol: "DOGEUSDT",
    paprikaId: "doge-dogecoin",
  },
  ADA: {
    symbol: "ADA",
    binanceSymbol: "ADAUSDT",
    paprikaId: "ada-cardano",
  },
  BNB: {
    symbol: "BNB",
    binanceSymbol: "BNBUSDT",
    paprikaId: "bnb-binance-coin",
  },
};

export function resolveAsset(input: string): AssetMapping | null {
  const normalized = input.trim().toUpperCase();
  if (SUPPORTED_ASSETS[normalized]) {
    return SUPPORTED_ASSETS[normalized];
  }
  // Generic fallback for any XYZ pair on Binance
  return {
    symbol: normalized,
    binanceSymbol: `${normalized}USDT`,
    paprikaId: `${normalized.toLowerCase()}-${normalized.toLowerCase()}`,
  };
}
