import type { MarketDataProvider } from "./types";
import { resolveAsset } from "./types";
import type { MarketObservation } from "../schemas";

export class BinanceAdapter implements MarketDataProvider {
  readonly name = "Binance Spot";
  private baseUrl: string;

  constructor(baseUrl = "https://api.binance.com") {
    this.baseUrl = baseUrl;
  }

  async getMarketObservation(asset: string): Promise<MarketObservation> {
    const assetInfo = resolveAsset(asset);
    if (!assetInfo) {
      throw new Error(`Unsupported or unresolvable asset: ${asset}`);
    }

    const symbol = assetInfo.binanceSymbol;
    const url = `${this.baseUrl}/api/v3/ticker/24hr?symbol=${symbol}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Binance API returned HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const retrievedAt = new Date().toISOString();

      const lastPrice = parseFloat(data.lastPrice);
      if (isNaN(lastPrice) || lastPrice <= 0) {
        throw new Error(`Invalid lastPrice received from Binance: ${data.lastPrice}`);
      }

      const closeTimeMs = Number(data.closeTime);
      const observedAt = !isNaN(closeTimeMs) && closeTimeMs > 0
        ? new Date(closeTimeMs).toISOString()
        : retrievedAt;

      const priceChangePercent = parseFloat(data.priceChangePercent) || 0;
      const volume = parseFloat(data.volume) || 0;
      const quoteVolume = parseFloat(data.quoteVolume) || 0;
      const highPrice = parseFloat(data.highPrice) || 0;
      const lowPrice = parseFloat(data.lowPrice) || 0;

      return {
        asset: assetInfo.symbol,
        price: lastPrice,
        observedAt,
        retrievedAt,
        provider: this.name,
        metrics: {
          symbol: data.symbol,
          priceChangePercent,
          volume,
          quoteVolume,
          highPrice,
          lowPrice,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Binance API timed out while fetching ${symbol}`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
