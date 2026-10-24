# LexiTrade AI — Product Requirements Document

## 1. Product Overview

**Product Name:** LexiTrade AI  
**Tagline:** From Regulatory News to Explainable Practice Trades  
**Category:** Autonomous Agents, Web3 Market Intelligence, Legal Tech  
**Target Bounty:** RYO-CHAN Autonomous Agents — BLI Legal Tech Hackathon 2

LexiTrade AI is an AI-assisted autonomous agent that analyzes cryptocurrency regulatory news, connects the news to verifiable market evidence, and produces transparent simulated trading decisions.

The system is designed to make its decisions inspectable and repeatable. Each analysis records the available evidence, timestamps, decision rules, risk parameters, and resulting paper trade.

LexiTrade AI does not execute real trades or guarantee profitable predictions.

## 2. Problem Statement

Cryptocurrency market participants often struggle to distinguish verified regulatory developments from unverified claims and understand how those developments relate to market conditions.

AI-generated trading recommendations can also be difficult to evaluate when their supporting evidence, decision criteria, and risk parameters are unclear.

LexiTrade AI addresses these problems by connecting regulatory news analysis with market evidence and an auditable paper-trading workflow.

## 3. Product Goals

1. Analyze cryptocurrency regulatory news and identify its potential market implications.
2. Connect news analysis to verifiable market data.
3. Generate a trading decision using explicit and repeatable rules.
4. Simulate practice trades with defined entry, stop-loss, take-profit, and position-sizing rules.
5. Preserve a decision trail that allows users to inspect how a result was produced.
6. Provide a practical demonstration of an autonomous agent using AI and Web3 market intelligence.

## 4. Target Users

- Web3 developers experimenting with autonomous agents.
- Crypto market researchers interested in regulatory developments.
- Users who want to evaluate trading strategies without risking real funds.

## 5. Core User Flow

1. The user submits a cryptocurrency regulatory news claim and its source URL, when available.
2. The system retrieves or records the source information and analyzes the claim.
3. The system evaluates the verification status and identifies relevant assets.
4. The system retrieves market evidence from an accessible, documented data provider.
5. The analysis component produces structured sentiment, potential impact, uncertainty, and supporting evidence.
6. A deterministic decision engine evaluates the evidence against explicit trading rules and risk limits.
7. The system produces `BUY` or `NO TRADE` for the initial MVP.
8. If all required conditions are satisfied, the system creates a simulated paper trade.
9. The system stores the analysis, evidence, rules, decision, and subsequent simulation results.
10. The user reviews the result through the dashboard and analysis history.

## 6. Functional Requirements

### 6.1 News Input and Verification

Users must be able to submit a news claim and, where available, its source URL.

The system must distinguish between:

- `VERIFIED`: Supported by an accessible, credible source.
- `UNVERIFIED`: Insufficient evidence to confirm the claim.
- `CONFLICTING`: Credible sources provide materially inconsistent information.
- `UNAVAILABLE`: The source or required verification service cannot be accessed.

Verification status must be supported by recorded source evidence. An LLM-generated assessment alone is not sufficient to label a claim as verified.

The system should record the source URL, publication time when available, retrieval time, and relevant supporting information.

### 6.2 Regulatory and Sentiment Analysis

The system analyzes:

- The main regulatory claim.
- Relevant jurisdiction and affected entities, when identifiable.
- Potentially affected crypto assets.
- Potential market implications.
- Sentiment: `BULLISH`, `BEARISH`, `NEUTRAL`, or `UNCERTAIN`.
- Legal or regulatory risk: `LOW`, `MEDIUM`, `HIGH`, or `UNKNOWN`.
- Confidence and uncertainty, without presenting estimates as objective probabilities unless calibrated.

The system must distinguish factual findings from interpretations and predictions.

### 6.3 Market Evidence

The system retrieves market data from an accessible provider.

Potential fields include:

- Asset identifier.
- Current or latest available price.
- Price changes over supported intervals.
- Trading volume or other supported market indicators.
- Observation timestamp.
- Provider and source reference.

The actual fields depend on the selected provider.

The system must not fabricate market data or describe stale data as real-time data. Missing or insufficient evidence must be visible to the user.

RYO-CHAN may be used as a market-intelligence provider if access is available and the integration is appropriate. Direct RYO-CHAN API or MCP integration is not assumed to be mandatory based solely on the currently available bounty description.

### 6.4 Decision Engine

The initial MVP supports:

- `BUY`: A long paper trade satisfies all required evidence and risk conditions.
- `NO TRADE`: Evidence is insufficient, contradictory, stale, or fails the strategy's conditions.

The engine must use explicit, versioned rules rather than allowing an LLM to independently execute trades.

The system must not open a trade when:

- News verification fails a required condition.
- Required market evidence is missing or too old.
- Market and news signals fail the configured strategy.
- Risk limits would be exceeded.
- The system encounters a critical data or calculation error.

`SELL` may be introduced later as a simulated exit or closing action. Short-selling is outside the initial MVP unless separately implemented and tested.

### 6.5 Paper Trading

Paper trading uses virtual funds only.

A simulated position may contain:

- Asset.
- Direction.
- Entry price.
- Position size.
- Stop-loss and take-profit.
- Opening timestamp.
- Decision and evidence references.
- Current or closing price.
- Realized or unrealized P/L, where applicable.
- Trade status.

Position sizing and loss limits must be determined by explicit rules.

The simulation must document how prices are selected and how stop-loss and take-profit conditions are evaluated. Results must not be represented as real exchange fills.

### 6.6 Evidence and Decision Trail

Each completed analysis must retain:

- Original news claim and source.
- Verification status and supporting sources.
- Analysis timestamp.
- Market data, provider, and observation timestamp.
- Missing or conflicting evidence.
- Structured AI analysis and uncertainty.
- Strategy and rule version.
- Risk parameters.
- Final decision and its recorded explanation.
- Paper-trade parameters, if a trade was opened.
- Subsequent simulation outcomes.

The trail must allow a reviewer to understand the decision without relying on hidden LLM reasoning.

Where practical, replaying a decision with the same recorded evidence and rule version should reproduce the same deterministic decision-engine output.

## 7. Non-Functional Requirements

### Reliability
- Validate inputs and external responses.
- Handle provider timeouts and unavailable data.
- Fail safely when required evidence is missing.
- Avoid duplicate paper trades from repeated requests.

### Security
- Keep API keys and provider credentials on the server.
- Store secrets in environment variables.
- Validate external inputs.
- Never request private wallet keys because real trading is outside the MVP.

### Usability
- Display verification status, market evidence, decision, and risk parameters clearly.
- Make uncertainty and missing data visible.
- Provide an analysis history and trade history.

### Auditability
- Preserve source references, timestamps, and rule versions.
- Record calculation inputs and outputs.
- Clearly separate facts, model-generated interpretations, and deterministic decisions.

## 8. MVP Scope

### Must Have
- Manual news input.
- Source references and verification status.
- Regulatory and sentiment analysis.
- Market data from a real, accessible source.
- Rule-based `BUY` or `NO TRADE` decisions.
- Risk validation.
- Virtual paper trading.
- Persistent decision trail.
- Dashboard and history.
- Tests for decision rules and risk constraints.
- A demonstrable end-to-end workflow.

### Out of Scope for the Initial MVP
- Real-money trading.
- Exchange order execution.
- Multi-KOL monitoring across up to 20 accounts.
- Discord and Telegram integrations.
- Multi-agent bull/bear debates.
- Smart contracts and on-chain settlement.
- Wallet connection.
- Advanced portfolio optimization.
- Unsupported claims of predictive accuracy.

## 9. Success Criteria

The MVP is considered successful when a user can submit a regulatory news claim, inspect its verification status, review market evidence, obtain a rule-validated decision, simulate an eligible trade, and inspect the saved decision trail.

The demo must show both a valid trade scenario and a `NO TRADE` scenario caused by insufficient or conflicting evidence.

## 10. Assumptions and Open Questions

- The currently available bounty description does not explicitly require direct RYO-CHAN API or MCP integration.
- Any additional sponsor requirements must be checked before submission.
- The market-data provider and access method must be selected and tested.
- The news-verification source must be selected and tested.
- LLM provider, database, deployment platform, and operating costs remain implementation decisions.
- Any future blockchain-based integrity feature is optional and must not be confused with proof that the underlying news is true.
