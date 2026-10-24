import { createClient, type Client } from "@libsql/client";
import type {
  Analysis,
  Evidence,
  Decision,
  PaperTrade,
} from "../schemas";

let clientInstance: Client | null = null;

export function getDb(): Client {
  if (!clientInstance) {
    const url = process.env.DATABASE_URL || "file:lexitrade.db";
    clientInstance = createClient({ url });
  }
  return clientInstance;
}

let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;

  const db = getDb();

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      claim TEXT NOT NULL,
      source_url TEXT,
      created_at TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      regulatory_risk TEXT NOT NULL,
      summary TEXT NOT NULL,
      uncertainty_notes TEXT NOT NULL,
      affected_assets TEXT NOT NULL,
      jurisdiction TEXT
    );

    CREATE TABLE IF NOT EXISTS evidences (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      source_url TEXT,
      observed_at TEXT,
      retrieved_at TEXT NOT NULL,
      payload TEXT NOT NULL,
      FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      strategy_version TEXT NOT NULL,
      outcome TEXT NOT NULL,
      evaluated_at TEXT NOT NULL,
      evidence_ids TEXT NOT NULL,
      rule_results TEXT NOT NULL,
      rejection_reasons TEXT NOT NULL,
      FOREIGN KEY(analysis_id) REFERENCES analyses(id)
    );

    CREATE TABLE IF NOT EXISTS paper_trades (
      id TEXT PRIMARY KEY,
      decision_id TEXT NOT NULL,
      asset TEXT NOT NULL,
      direction TEXT NOT NULL,
      entry_price REAL NOT NULL,
      position_size REAL NOT NULL,
      stop_loss REAL NOT NULL,
      take_profit REAL NOT NULL,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      exit_price REAL,
      pnl REAL,
      status TEXT NOT NULL,
      FOREIGN KEY(decision_id) REFERENCES decisions(id)
    );
  `);

  initialized = true;
}

// Database helper functions
export async function saveAnalysis(analysis: Analysis): Promise<void> {
  await initDb();
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO analyses (
      id, claim, source_url, created_at, verification_status, sentiment, regulatory_risk, summary, uncertainty_notes, affected_assets, jurisdiction
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      analysis.id,
      analysis.claim,
      analysis.sourceUrl ?? null,
      analysis.createdAt,
      analysis.verificationStatus,
      analysis.sentiment,
      analysis.regulatoryRisk,
      analysis.summary,
      JSON.stringify(analysis.uncertaintyNotes),
      JSON.stringify(analysis.affectedAssets),
      analysis.jurisdiction ?? null,
    ],
  });
}

export async function saveEvidence(evidence: Evidence): Promise<void> {
  await initDb();
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO evidences (
      id, analysis_id, type, provider, source_url, observed_at, retrieved_at, payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      evidence.id,
      evidence.analysisId,
      evidence.type,
      evidence.provider,
      evidence.sourceUrl ?? null,
      evidence.observedAt ?? null,
      evidence.retrievedAt,
      JSON.stringify(evidence.payload),
    ],
  });
}

export async function saveDecision(decision: Decision): Promise<void> {
  await initDb();
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO decisions (
      id, analysis_id, strategy_version, outcome, evaluated_at, evidence_ids, rule_results, rejection_reasons
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      decision.id,
      decision.analysisId,
      decision.strategyVersion,
      decision.outcome,
      decision.evaluatedAt,
      JSON.stringify(decision.evidenceIds),
      JSON.stringify(decision.ruleResults),
      JSON.stringify(decision.rejectionReasons),
    ],
  });
}

export async function savePaperTrade(trade: PaperTrade): Promise<void> {
  await initDb();
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO paper_trades (
      id, decision_id, asset, direction, entry_price, position_size, stop_loss, take_profit, opened_at, closed_at, exit_price, pnl, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      trade.id,
      trade.decisionId,
      trade.asset,
      trade.direction,
      trade.entryPrice,
      trade.positionSize,
      trade.stopLoss,
      trade.takeProfit,
      trade.openedAt,
      trade.closedAt ?? null,
      trade.exitPrice ?? null,
      trade.pnl ?? null,
      trade.status,
    ],
  });
}

export async function updatePaperTrade(trade: {
  id: string;
  closedAt: string;
  exitPrice: number;
  pnl: number;
  status: "CLOSED" | "CANCELLED";
}): Promise<void> {
  await initDb();
  const db = getDb();
  await db.execute({
    sql: `UPDATE paper_trades SET closed_at = ?, exit_price = ?, pnl = ?, status = ? WHERE id = ?`,
    args: [trade.closedAt, trade.exitPrice, trade.pnl, trade.status, trade.id],
  });
}

export async function getAnalyses(): Promise<Analysis[]> {
  await initDb();
  const db = getDb();
  const res = await db.execute("SELECT * FROM analyses ORDER BY created_at DESC");
  return res.rows.map((row) => ({
    id: row.id as string,
    claim: row.claim as string,
    sourceUrl: (row.source_url as string | null) ?? undefined,
    createdAt: row.created_at as string,
    verificationStatus: row.verification_status as Analysis["verificationStatus"],
    sentiment: row.sentiment as Analysis["sentiment"],
    regulatoryRisk: row.regulatory_risk as Analysis["regulatoryRisk"],
    summary: row.summary as string,
    uncertaintyNotes: JSON.parse((row.uncertainty_notes as string) || "[]"),
    affectedAssets: JSON.parse((row.affected_assets as string) || "[]"),
    jurisdiction: (row.jurisdiction as string | null) ?? undefined,
  }));
}

export async function getAnalysisById(id: string): Promise<{
  analysis: Analysis | null;
  evidences: Evidence[];
  decision: Decision | null;
  paperTrade: PaperTrade | null;
}> {
  await initDb();
  const db = getDb();

  const aRes = await db.execute({
    sql: "SELECT * FROM analyses WHERE id = ?",
    args: [id],
  });
  if (aRes.rows.length === 0) {
    return { analysis: null, evidences: [], decision: null, paperTrade: null };
  }

  const row = aRes.rows[0];
  const analysis: Analysis = {
    id: row.id as string,
    claim: row.claim as string,
    sourceUrl: (row.source_url as string | null) ?? undefined,
    createdAt: row.created_at as string,
    verificationStatus: row.verification_status as Analysis["verificationStatus"],
    sentiment: row.sentiment as Analysis["sentiment"],
    regulatoryRisk: row.regulatory_risk as Analysis["regulatoryRisk"],
    summary: row.summary as string,
    uncertaintyNotes: JSON.parse((row.uncertainty_notes as string) || "[]"),
    affectedAssets: JSON.parse((row.affected_assets as string) || "[]"),
    jurisdiction: (row.jurisdiction as string | null) ?? undefined,
  };

  const eRes = await db.execute({
    sql: "SELECT * FROM evidences WHERE analysis_id = ? ORDER BY retrieved_at ASC",
    args: [id],
  });
  const evidences: Evidence[] = eRes.rows.map((e) => ({
    id: e.id as string,
    analysisId: e.analysis_id as string,
    type: e.type as Evidence["type"],
    provider: e.provider as string,
    sourceUrl: (e.source_url as string | null) ?? undefined,
    observedAt: (e.observed_at as string | null) ?? undefined,
    retrievedAt: e.retrieved_at as string,
    payload: JSON.parse((e.payload as string) || "{}"),
  }));

  const dRes = await db.execute({
    sql: "SELECT * FROM decisions WHERE analysis_id = ?",
    args: [id],
  });
  let decision: Decision | null = null;
  let paperTrade: PaperTrade | null = null;

  if (dRes.rows.length > 0) {
    const d = dRes.rows[0];
    decision = {
      id: d.id as string,
      analysisId: d.analysis_id as string,
      strategyVersion: d.strategy_version as string,
      outcome: d.outcome as Decision["outcome"],
      evaluatedAt: d.evaluated_at as string,
      evidenceIds: JSON.parse((d.evidence_ids as string) || "[]"),
      ruleResults: JSON.parse((d.rule_results as string) || "[]"),
      rejectionReasons: JSON.parse((d.rejection_reasons as string) || "[]"),
    };

    const tRes = await db.execute({
      sql: "SELECT * FROM paper_trades WHERE decision_id = ?",
      args: [decision.id],
    });
    if (tRes.rows.length > 0) {
      const t = tRes.rows[0];
      paperTrade = {
        id: t.id as string,
        decisionId: t.decision_id as string,
        asset: t.asset as string,
        direction: "LONG",
        entryPrice: Number(t.entry_price),
        positionSize: Number(t.position_size),
        stopLoss: Number(t.stop_loss),
        takeProfit: Number(t.take_profit),
        openedAt: t.opened_at as string,
        closedAt: (t.closed_at as string | null) ?? undefined,
        exitPrice: t.exit_price !== null ? Number(t.exit_price) : undefined,
        pnl: t.pnl !== null ? Number(t.pnl) : undefined,
        status: t.status as PaperTrade["status"],
      };
    }
  }

  return { analysis, evidences, decision, paperTrade };
}

export async function getPaperTrades(): Promise<PaperTrade[]> {
  await initDb();
  const db = getDb();
  const res = await db.execute("SELECT * FROM paper_trades ORDER BY opened_at DESC");
  return res.rows.map((t) => ({
    id: t.id as string,
    decisionId: t.decision_id as string,
    asset: t.asset as string,
    direction: "LONG",
    entryPrice: Number(t.entry_price),
    positionSize: Number(t.position_size),
    stopLoss: Number(t.stop_loss),
    takeProfit: Number(t.take_profit),
    openedAt: t.opened_at as string,
    closedAt: (t.closed_at as string | null) ?? undefined,
    exitPrice: t.exit_price !== null ? Number(t.exit_price) : undefined,
    pnl: t.pnl !== null ? Number(t.pnl) : undefined,
    status: t.status as PaperTrade["status"],
  }));
}
