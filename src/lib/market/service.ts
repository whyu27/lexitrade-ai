import type { MarketDataProvider } from "./types";
import { BinanceAdapter } from "./binance-adapter";
import { CoinPaprikaAdapter } from "./coinpaprika-adapter";
import type { MarketObservation, Evidence } from "../schemas";

export class StaleMarketDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaleMarketDataError";
  }
}

export class MarketDataService {
  private providers: MarketDataProvider[];
  private defaultMaxAgeSec: number;

  constructor(
    providers?: MarketDataProvider[],
    defaultMaxAgeSec?: number
  ) {
    this.providers = providers && providers.length > 0
      ? providers
      : [new BinanceAdapter(), new CoinPaprikaAdapter()];

    this.defaultMaxAgeSec = defaultMaxAgeSec ?? (
      parseInt(process.env.MARKET_DATA_FRESHNESS_SEC || "600", 10) || 600
    );
  }

  async getMarketObservation(
    asset: string,
    options?: { maxAgeSec?: number; allowStale?: boolean }
  ): Promise<MarketObservation> {
    const maxAgeSec = options?.maxAgeSec ?? this.defaultMaxAgeSec;
    const errors: string[] = [];
    let lastStaleError: StaleMarketDataError | null = null;

    for (const provider of this.providers) {
      try {
        const observation = await provider.getMarketObservation(asset);

        // Validate price
        if (typeof observation.price !== "number" || observation.price <= 0 || isNaN(observation.price)) {
          throw new Error(`Provider ${provider.name} returned invalid non-positive price: ${observation.price}`);
        }

        // Validate observation timestamp
        const observedTime = new Date(observation.observedAt).getTime();
        if (isNaN(observedTime)) {
          throw new Error(`Provider ${provider.name} returned unparseable observedAt timestamp: ${observation.observedAt}`);
        }

        // Freshness validation
        const now = Date.now();
        const ageSec = (now - observedTime) / 1000;

        // Tolerant of 30s future clock skew
        if (ageSec < -30) {
          throw new Error(`Provider ${provider.name} returned timestamp in the future: ${observation.observedAt}`);
        }

        if (ageSec > maxAgeSec && !options?.allowStale) {
          throw new StaleMarketDataError(
            `Market data for ${asset} from ${provider.name} is stale (${Math.round(ageSec)}s old, threshold: ${maxAgeSec}s)`
          );
        }

        return observation;
      } catch (err: unknown) {
        if (err instanceof StaleMarketDataError) {
          lastStaleError = err;
        }
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`[${provider.name}]: ${msg}`);
      }
    }

    if (lastStaleError) {
      throw lastStaleError;
    }

    throw new Error(
      `Failed to retrieve market evidence for ${asset} from all available providers:\n${errors.join("\n")}`
    );
  }

  createMarketEvidence(
    analysisId: string,
    observation: MarketObservation
  ): Evidence {
    return {
      id: `ev-market-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      analysisId,
      type: "MARKET_OBSERVATION",
      provider: observation.provider,
      observedAt: observation.observedAt,
      retrievedAt: observation.retrievedAt,
      payload: {
        asset: observation.asset,
        price: observation.price,
        metrics: observation.metrics ?? {},
      },
    };
  }
}

// Singleton instance for convenience
let defaultServiceInstance: MarketDataService | null = null;

export function getMarketDataService(): MarketDataService {
  if (!defaultServiceInstance) {
    defaultServiceInstance = new MarketDataService();
  }
  return defaultServiceInstance;
}
