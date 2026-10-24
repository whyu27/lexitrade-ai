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
- [ ] Build the news-input interface.
- [ ] Accept a claim and optional source URL.
- [ ] Retrieve source content using a permitted and technically supported method.
- [ ] Record source metadata and retrieval time.
- [ ] Implement verification states: VERIFIED, UNVERIFIED, CONFLICTING, and UNAVAILABLE.
- [ ] Identify relevant assets and regulatory context.
- [ ] Produce structured sentiment, potential impact, uncertainty, and legal-risk assessments.
- [ ] Separate source-backed facts from AI-generated interpretations.
- [ ] Handle inaccessible pages and conflicting sources.

### Deliverables
A structured news-analysis service with traceable evidence.

### Exit Criteria
The application does not mark a claim as verified based solely on an LLM's assertion.

## Phase 4 — Deterministic Decision Engine

### Tasks
- [ ] Define the initial strategy and its explicit conditions.
- [ ] Define supported signals and their required evidence.
- [ ] Define configurable risk limits.
- [ ] Implement BUY and NO TRADE outcomes.
- [ ] Require valid, sufficiently fresh market evidence.
- [ ] Reject decisions when mandatory verification or data conditions fail.
- [ ] Assign a version to each strategy configuration.
- [ ] Record which rules passed or failed.
- [ ] Write unit tests for positive, negative, and edge cases.

### Deliverables
A deterministic decision engine that produces reproducible outcomes from the same inputs and rule version.

### Exit Criteria
The engine never opens a paper trade when mandatory evidence or risk conditions fail.

## Phase 5 — Paper Trading Engine

### Tasks
- [ ] Define the virtual starting balance.
- [ ] Implement entry-price selection using documented market data.
- [ ] Implement position sizing.
- [ ] Implement stop-loss and take-profit calculations.
- [ ] Validate position and loss limits.
- [ ] Store simulated trades.
- [ ] Evaluate exits using subsequent market observations.
- [ ] Calculate P/L, fees, and other costs only when explicitly modeled.
- [ ] Prevent duplicate trade creation.
- [ ] Record trade lifecycle events.

### Deliverables
A simulated trading engine that uses virtual funds and records its assumptions.

### Exit Criteria
A user can open a permitted paper trade, inspect its parameters, and review its subsequent simulated outcome.

## Phase 6 — Evidence and Decision Trail

### Tasks
- [ ] Define persistent models for analyses, evidence, decisions, and paper trades.
- [ ] Link each decision to its supporting evidence.
- [ ] Store timestamps and strategy versions.
- [ ] Record the decision outcome and rule evaluation results.
- [ ] Store trade opening and closing events.
- [ ] Implement analysis-history and trade-history retrieval.
- [ ] Support inspection of individual records.
- [ ] Test that historical records remain available after application restarts.

### Deliverables
A persistent, inspectable decision trail.

### Exit Criteria
A reviewer can trace a simulated trade back to its news claim, market observations, and decision rules.

## Phase 7 — Dashboard

### Tasks
- [ ] Build the main dashboard.
- [ ] Add the news-analysis input form.
- [ ] Display verification status and source references.
- [ ] Display market observations and timestamps.
- [ ] Display sentiment, uncertainty, and potential impact.
- [ ] Display the final decision and rule results.
- [ ] Display paper-trade parameters and current status.
- [ ] Build analysis-history and trade-history views.
- [ ] Add clear loading, error, and empty states.

### Deliverables
A usable interface that demonstrates the complete workflow.

## Phase 8 — Testing and Hardening

### Tasks
- [ ] Test market-data parsing and validation.
- [ ] Test news-verification states.
- [ ] Test decision rules and risk limits.
- [ ] Test paper-trade calculations.
- [ ] Test persistence and record relationships.
- [ ] Test provider failure and stale-data handling.
- [ ] Test the end-to-end workflow.
- [ ] Verify that secrets are not exposed to the client.
- [ ] Verify that no real trades can be executed.
- [ ] Prepare one eligible-trade scenario and one NO TRADE scenario.

### Deliverables
A tested MVP with documented limitations.

## Phase 9 — Deployment and Submission

### Tasks
- [ ] Deploy the application.
- [ ] Configure server-side environment variables.
- [ ] Verify production data-provider access.
- [ ] Test the complete workflow in the deployed environment.
- [ ] Prepare a README with setup and architecture instructions.
- [ ] Document the evidence sources and decision strategy.
- [ ] Record a short demo showing the end-to-end workflow.
- [ ] Verify the official submission format and deadline.
- [ ] Submit the project and required links.

### Deliverables
A working demo, source repository, technical documentation, and submission materials.

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
