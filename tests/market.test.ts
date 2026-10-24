import { describe, it, expect, vi } from "vitest";
import {
  BinanceAdapter,
  CoinPaprikaAdapter,
  MarketDataService,
  StaleMarketDataError,
  type MarketDataProvider,
} from "../src/lib/market";
import type { MarketObservation } from "../src/lib/schemas";

describe("Market Evidence Integration", () => {
  it("should correctly parse and normalize Binance API responses", async () => {
    const mockBinanceData = {
      symbol: "BTCUSDT",
      lastPrice: "81250.50000000",
      priceChangePercent: "2.450",
      volume: "12345.67800000",
      quoteVolume: "1003456789.00000000",
      highPrice: "82000.00000000",
      lowPrice: "79000.00000000",
      closeTime: 1729770000000,
    };

    const adapter = new BinanceAdapter();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockBinanceData,
    } as unknown as Response);

    const obs = await adapter.getMarketObservation("BTC");
    expect(obs.asset).toBe("BTC");
    expect(obs.price).toBe(81250.5);
    expect(obs.provider).toBe("Binance Spot");
    expect(obs.observedAt).toBe(new Date(1729770000000).toISOString());
    expect(obs.metrics?.priceChangePercent).toBe(2.45);
    expect(obs.metrics?.volume).toBe(12345.678);
  });

  it("should correctly parse and normalize CoinPaprika API responses", async () => {
    const mockPaprikaData = {
      id: "btc-bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      last_updated: "2026-10-24T12:00:00Z",
      quotes: {
        USD: {
          price: 81200.75,
          volume_24h: 15000000000,
          percent_change_24h: 2.15,
          market_cap: 1600000000000,
        },
      },
    };

    const adapter = new CoinPaprikaAdapter();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPaprikaData,
    } as unknown as Response);

    const obs = await adapter.getMarketObservation("BTC");
    expect(obs.asset).toBe("BTC");
    expect(obs.price).toBe(81200.75);
    expect(obs.provider).toBe("CoinPaprika");
    expect(obs.observedAt).toBe("2026-10-24T12:00:00.000Z");
    expect(obs.metrics?.priceChangePercent).toBe(2.15);
  });

  it("should reject stale market data based on freshness threshold", async () => {
    const staleTime = new Date(Date.now() - 600 * 1000).toISOString(); // 10 minutes ago
    const mockProvider: MarketDataProvider = {
      name: "MockStaleProvider",
      getMarketObservation: async () => ({
        asset: "BTC",
        price: 80000,
        observedAt: staleTime,
        retrievedAt: new Date().toISOString(),
        provider: "MockStaleProvider",
      }),
    };

    const service = new MarketDataService([mockProvider], 300); // 300s max age

    await expect(service.getMarketObservation("BTC")).rejects.toThrow(
      StaleMarketDataError
    );

    // Should pass if allowStale is explicitly true
    const allowed = await service.getMarketObservation("BTC", {
      allowStale: true,
    });
    expect(allowed.price).toBe(80000);
  });

  it("should fallback to secondary provider when primary fails", async () => {
    const failingProvider: MarketDataProvider = {
      name: "FailingProvider",
      getMarketObservation: async () => {
        throw new Error("Connection timed out");
      },
    };

    const workingProvider: MarketDataProvider = {
      name: "BackupProvider",
      getMarketObservation: async () => ({
        asset: "BTC",
        price: 80500,
        observedAt: new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
        provider: "BackupProvider",
      }),
    };

    const service = new MarketDataService([failingProvider, workingProvider]);
    const obs = await service.getMarketObservation("BTC");

    expect(obs.provider).toBe("BackupProvider");
    expect(obs.price).toBe(80500);
  });

  it("should reject invalid negative or zero prices", async () => {
    const invalidPriceProvider: MarketDataProvider = {
      name: "BadPriceProvider",
      getMarketObservation: async () => ({
        asset: "BTC",
        price: -50,
        observedAt: new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
        provider: "BadPriceProvider",
      }),
    };

    const service = new MarketDataService([invalidPriceProvider]);
    await expect(service.getMarketObservation("BTC")).rejects.toThrow(
      /invalid non-positive price/i
    );
  });

  it("should successfully fetch real live market observation from Binance Spot", async () => {
    const adapter = new BinanceAdapter();
    const obs = await adapter.getMarketObservation("BTC");

    expect(obs.asset).toBe("BTC");
    expect(obs.price).toBeGreaterThan(0);
    expect(obs.provider).toBe("Binance Spot");
    expect(new Date(obs.observedAt).getTime()).toBeGreaterThan(0);
    expect(new Date(obs.retrievedAt).getTime()).toBeGreaterThan(0);
    expect(obs.metrics?.volume).toBeDefined();
  });
});
