# LexiTrade AI — Implementation Plan

## Overview

This plan builds LexiTrade AI incrementally, prioritizing the complete autonomous-agent workflow over additional features.

The core workflow is:

**News claim → Verification → Market evidence → Decision engine → Risk validation → Paper trade or NO TRADE → Decision trail**

The implementation must use real, traceable evidence and must never invent market observations.

## Phase 0 — Validate Requirements and Data Access

### Tasks
- [x] Review the official BLI Legal Tech Hackathon 2 submission requirements.
- [x] Review any additional RYO-CHAN sponsor requirements that become available.
- [x] Confirm whether direct RYO-CHAN integration is required, recommended, or optional.
- [x] Identify an accessible market-data provider.
- [x] Test that provider's data retrieval method and inspect its response schema.
- [x] Identify a credible news-verification source or retrieval method.
- [x] Check API access requirements, rate limits, and potential costs.

### Findings & Selections
- **Bounty Focus:** DoraHacks BLI Legal Tech Hackathon 2 — Autonomous Agents (RYO-CHAN) track. Prioritizes transparent, deterministic decision processes, auditable evidence trails, and compliance-driven automation without hallucination. Direct RYO-CHAN API/MCP is optional and supported via modular adapter pattern.
- **Primary Market Data Provider:** Binance Spot Public API (`api.binance.com/api/v3/ticker/24hr`). Free, zero-auth, 1200 weight/min, sub-second latency.
- **Fallback Market Data Provider:** CoinPaprika Public API (`api.coinpaprika.com/v1/tickers/{asset}`). Free, zero-auth.
- **News Verification Strategy:** Server-side URL scraper with content/meta extractor + LLM claim verification against fetched text. Explicit statuses: `VERIFIED`, `UNVERIFIED`, `CONFLICTING`, `UNAVAILABLE`.
- **Persistence & LLM:** Local SQLite for full auditability; LLM configured via environment variable with structured JSON output.

### Deliverables
- Confirmed project scope.
- Selected initial market-data provider (Binance Spot + CoinPaprika fallback).
- Selected initial news-source strategy.
- Documented integration requirements and constraints.

### Exit Criteria
The project has at least one tested way to retrieve traceable market evidence and a feasible way to check submitted news claims. — **COMPLETED**

## Phase 1 — Project Setup

### Tasks
- [x] Create a Next.js project with TypeScript.
- [x] Configure Tailwind CSS.
- [x] Establish the source-code structure.
- [x] Configure environment variables.
- [x] Add request validation with Zod.
- [x] Select and configure a persistent database (SQLite via LibSQL).
- [x] Add a basic health endpoint.
- [x] Configure linting and testing (Vitest).

### Deliverables
- A running Next.js 16 App Router application with TypeScript and Tailwind CSS.
- Persistent SQLite layer with full schema for analyses, evidence, decisions, and paper trades.
- Request/response runtime validation using Zod.
- Working `/api/health` endpoint verifying database and server status.
- Automated unit testing with Vitest (`tests/database.test.ts`).

## Phase 2 — Market Evidence Integration

### Tasks
- [x] Implement a market-data adapter.
- [x] Retrieve supported market observations for a selected asset.
- [x] Normalize provider responses into an internal schema.
- [x] Record provider name, observation timestamp, and retrieval timestamp.
- [x] Validate prices and other numeric values.
- [x] Handle timeouts, rate limits, and missing data.
- [x] Implement a configurable freshness threshold.
- [x] Add tests using recorded sample responses and real live fetch.

### Deliverables
- Modular market provider adapters: `BinanceAdapter` (primary spot) and `CoinPaprikaAdapter` (fallback).
- `MarketDataService` with automatic fallback, strict positive price validation, and freshness threshold checks.
- API route `GET /api/market/[asset]` with support for `maxAgeSec` and `allowStale` query params.
- Full test suite in `tests/market.test.ts` verifying normalization, stale data rejection, fallback, and live Binance Spot retrieval.

### Exit Criteria
The application can retrieve actual market data from the selected provider and correctly reject invalid or stale observations. — **COMPLETED**

## Phase 3 — News Verification and Regulatory Analysis

### Tasks
- [x] Build the news-input interface (API routes `/api/analyze`, `/api/analyses`, `/api/analyses/[id]`).
- [x] Accept a claim and optional source URL.
- [x] Retrieve source content using a permitted and technically supported method (`NewsVerifier` with Cheerio).
- [x] Record source metadata and retrieval time.
- [x] Implement verification states: VERIFIED, UNVERIFIED, CONFLICTING, and UNAVAILABLE.
- [x] Identify relevant assets and regulatory context.
- [x] Produce structured sentiment, potential impact, uncertainty, and legal-risk assessments.
- [x] Separate source-backed facts from AI-generated interpretations.
- [x] Handle inaccessible pages and conflicting sources.

### Deliverables
- `NewsVerifier` engine with automated HTML scraping, conflict polarity detection, and explicit verification statuses (`VERIFIED`, `UNVERIFIED`, `CONFLICTING`, `UNAVAILABLE`).
- `RegulatoryAnalyzer` supporting dual modes: deterministic heuristic NLP rule engine (zero-dependency, offline-ready) and LLM-structured JSON generation (Gemini / OpenAI).
- Endpoints: `POST /api/analyze`, `GET /api/analyses`, and `GET /api/analyses/[id]`.
- Full test suite in `tests/verification-analysis.test.ts` verifying all 4 verification states, conflict detection, entity resolution, and sentiment analysis.

### Exit Criteria
The application does not mark a claim as verified based solely on an LLM's assertion. — **COMPLETED**

## Phase 4 — Deterministic Decision Engine

### Tasks
- [x] Define the initial strategy and its explicit conditions (Strategy `v1.0.0` Regulatory Momentum).
- [x] Define supported signals and their required evidence (6 explicit rules).
- [x] Define configurable risk limits (max position, stop-loss, take-profit).
- [x] Implement BUY and NO TRADE outcomes.
- [x] Require valid, sufficiently fresh market evidence.
- [x] Reject decisions when mandatory verification or data conditions fail.
- [x] Assign a version to each strategy configuration.
- [x] Record which rules passed or failed with audit explanations.
- [x] Write unit tests for positive, negative, and edge cases.

### Deliverables
- `DecisionEngine` evaluating 6 explicit rules (`RULE_VERIFIED_NEWS`, `RULE_BULLISH_SENTIMENT`, `RULE_ACCEPTABLE_REGULATORY_RISK`, `RULE_VALID_MARKET_EVIDENCE`, `RULE_MARKET_TREND_STABILITY`, `RULE_RISK_LIMITS`).
- Output: Reproducible `BUY` or `NO_TRADE` with recorded rule results and rejection explanations.
- Comprehensive test suite in `tests/decision-engine.test.ts`.

### Exit Criteria
The engine never opens a paper trade when mandatory evidence or risk conditions fail. — **COMPLETED**

## Phase 5 — Paper Trading Engine

### Tasks
- [x] Define the virtual starting balance ($100,000 virtual balance).
- [x] Implement entry-price selection using documented market data.
- [x] Implement position sizing (10% max allocation, asset-based unit calculation).
- [x] Implement stop-loss and take-profit calculations (3% SL, 6% TP, 2:1 R/R ratio).
- [x] Validate position and loss limits in `RiskValidator`.
- [x] Store simulated trades in SQLite database.
- [x] Evaluate exits using subsequent market observations (`STOP_LOSS_HIT`, `TAKE_PROFIT_HIT`).
- [x] Calculate P/L, fees, and other costs only when explicitly modeled.
- [x] Prevent duplicate trade creation.
- [x] Record trade lifecycle events (`OPEN`, `CLOSED`, `CANCELLED`).

### Deliverables
- `RiskValidator` and `PaperTradingEngine` with automated exit evaluation and manual trade closing.
- Endpoints: `GET /api/trades` and `POST /api/trades/[id]/close`.
- Test suite in `tests/paper-trading.test.ts` verifying position sizing, SL/TP calculation, and exits.

### Exit Criteria
A user can open a permitted paper trade, inspect its parameters, and review its subsequent simulated outcome. — **COMPLETED**

## Phase 6 — Evidence and Decision Trail

### Tasks
- [x] Define persistent models for analyses, evidence, decisions, and paper trades.
- [x] Link each decision to its supporting evidence via foreign keys and JSON arrays.
- [x] Store timestamps and strategy versions.
- [x] Record the decision outcome and rule evaluation results.
- [x] Store trade opening and closing events.
- [x] Implement analysis-history and trade-history retrieval.
- [x] Support inspection of individual records via `/api/analyses/[id]`.
- [x] Test that historical records remain available after application restarts.

### Deliverables
- SQLite schema with foreign-key relationships connecting `analyses`, `evidences`, `decisions`, and `paper_trades`.
- Complete auditable data trail queryable via `getAnalysisById` and API endpoints.

### Exit Criteria
A reviewer can trace a simulated trade back to its news claim, market observations, and decision rules. — **COMPLETED**

## Phase 7 — Dashboard

### Tasks
- [x] Build the main dashboard layout and responsive navigation.
- [x] Add the news-analysis input form with 3 interactive demo presets.
- [x] Display verification status and source references (`VerificationCard`).
- [x] Display market observations and timestamps (`MarketCard`).
- [x] Display sentiment, uncertainty, and potential impact (`RegulatoryCard`).
- [x] Display the final decision and rule results checklist (`DecisionCard`).
- [x] Display paper-trade parameters and current status (`PaperTradeCard`).
- [x] Build analysis-history and trade-history views (`AnalysesLedgerView`, `TradesHistoryView`, `InspectModal`).
- [x] Add clear loading, error, and empty states.

### Deliverables
- Full interactive web interface matching Web3/FinTech aesthetic.
- One-click testing presets covering both valid `BUY` and safety-triggered `NO TRADE` scenarios.
- Live inspection modal linking back to persistent SQLite evidence.

## Phase 8 — Testing and Hardening

### Tasks
- [x] Test market-data parsing and validation (`tests/market.test.ts`).
- [x] Test news-verification states (`tests/verification-analysis.test.ts`).
- [x] Test decision rules and risk limits (`tests/decision-engine.test.ts`).
- [x] Test paper-trade calculations (`tests/paper-trading.test.ts`).
- [x] Test persistence and record relationships (`tests/database.test.ts`).
- [x] Test provider failure and stale-data handling (`tests/market.test.ts`).
- [x] Test the end-to-end workflow (`tests/e2e-workflow.test.ts`).
- [x] Verify that secrets are not exposed to the client.
- [x] Verify that no real trades can be executed (strictly simulated practice execution).
- [x] Prepare one eligible-trade scenario and one NO TRADE scenario (interactive presets on dashboard).

### Deliverables
- Comprehensive automated test suite with 32 passed unit & E2E tests.
- Hardened pipeline with safety halts, input validation, and fallback mechanisms.

### Exit Criteria
All unit, integration, and E2E tests pass reliably without errors. — **COMPLETED**

## Phase 9 — Deployment and Submission

### Tasks
- [x] Build and verify optimized production bundle (`next build` with 0 errors).
- [x] Configure server-side environment variables (`.env.example`, `.env.local`).
- [x] Verify production data-provider access (Binance Spot & CoinPaprika).
- [x] Prepare a comprehensive README with setup, architecture diagrams, and usage guidelines.
- [x] Document the evidence sources and decision strategy.
- [x] Deploy the application to Vercel / self-hosted node (Live at https://lexitrade-ai.vercel.app/).
- [ ] Submit the project and required links to DoraHacks.

### Deliverables
- Working autonomous agent application ready for local demonstration and cloud deployment.
- Complete documentation and auditable evidence ledger.

## Optional Enhancements — Only After the MVP Works

- Direct RYO-CHAN API or MCP integration, if appropriate or required.
- Additional market-data providers.
- More advanced regulatory-source retrieval.
- Additional trading strategies.
- A stronger integrity mechanism for stored decision records.
- On-chain proof of record integrity, if it adds meaningful value.

These enhancements must not delay the core MVP.

## Definition of Done

LexiTrade AI is ready for its initial demonstration when a user can:

1. Submit a cryptocurrency regulatory news claim.
2. Inspect its verification status and source evidence.
3. Review actual market observations and their timestamps.
4. Receive a decision produced by explicit rules.
5. Open a paper trade when all conditions are satisfied, or receive NO TRADE otherwise.
6. Inspect the saved decision trail and subsequent simulation results.

The demonstration must clearly distinguish verified facts, AI-generated assessments, deterministic rules, and simulated outcomes.
