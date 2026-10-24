import type { MarketDataProvider } from "./types";
import { resolveAsset } from "./types";
import type { MarketObservation } from "../schemas";

export class CoinPaprikaAdapter implements MarketDataProvider {
  readonly name = "CoinPaprika";
  private baseUrl: string;

  constructor(baseUrl = "https://api.coinpaprika.com/v1") {
    this.baseUrl = baseUrl;
  }

  async getMarketObservation(asset: string): Promise<MarketObservation> {
    const assetInfo = resolveAsset(asset);
    if (!assetInfo) {
      throw new Error(`Unsupported or unresolvable asset: ${asset}`);
    }

    const coinId = assetInfo.paprikaId;
    const url = `${this.baseUrl}/tickers/${coinId}`;

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
          `CoinPaprika API returned HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const retrievedAt = new Date().toISOString();

      const usdQuote = data.quotes?.USD;
      if (!usdQuote) {
        throw new Error(`USD quote missing in CoinPaprika response for ${coinId}`);
      }

      const price = Number(usdQuote.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid price received from CoinPaprika: ${usdQuote.price}`);
      }

      const observedAt = data.last_updated
        ? new Date(data.last_updated).toISOString()
        : retrievedAt;

      const priceChangePercent = Number(usdQuote.percent_change_24h) || 0;
      const volume = Number(usdQuote.volume_24h) || 0;

      return {
        asset: assetInfo.symbol,
        price,
        observedAt,
        retrievedAt,
        provider: this.name,
        metrics: {
          symbol: data.symbol,
          priceChangePercent,
          volume,
          marketCap: Number(usdQuote.market_cap) || 0,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`CoinPaprika API timed out while fetching ${coinId}`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
