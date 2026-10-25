import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function smoothScroll(page, targetY, durationMs = 1000) {
  await page.evaluate(
    async ({ targetY, durationMs }) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();
      return new Promise((resolve) => {
        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / durationMs, 1);
          // Ease in out quad
          const ease =
            progress < 0.5
              ? 2 * progress * progress
              : -1 + (4 - 2 * progress) * progress;
          window.scrollTo(0, startY + diff * ease);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    },
    { targetY, durationMs }
  );
  await page.waitForTimeout(400);
}

async function run() {
  console.log("🎬 Starting LexiTrade AI Full HD Automated Walkthrough Recording...");
  const outputDir = path.resolve("./demo-video");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: "msedge",
    headless: false,
    args: ["--window-size=1920,1080", "--start-maximized"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // 1. Open live application
  console.log("📍 [1/8] Opening LexiTrade AI Terminal...");
  await page.goto("https://lexitrade-ai.vercel.app/", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2500);

  // 2. Open Architecture & Specs Modal
  console.log("📍 [2/8] Opening Architecture & Bounty Specs modal...");
  const specsButton = page.locator("button:has-text('Specs')").first();
  if (await specsButton.isVisible()) {
    await specsButton.hover();
    await page.waitForTimeout(500);
    await specsButton.click();
    await page.waitForTimeout(3500);
    // Close modal via Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
  }

  // 3. Scenario 1: Spot Bitcoin ETF Approval (BUY scenario)
  console.log("📍 [3/8] Executing Scenario 1: ETF Approval (Eligible BUY)...");
  const preset1 = page.locator("button:has-text('01. ETF Approval')").first();
  if (await preset1.isVisible()) {
    await preset1.hover();
    await page.waitForTimeout(600);
    await preset1.click();
    await page.waitForTimeout(1000);
  }

  // Click Submit (RUN PIPELINE)
  const runPipelineBtn = page.locator("button:has-text('RUN PIPELINE')").first();
  await runPipelineBtn.hover();
  await page.waitForTimeout(500);
  await runPipelineBtn.click();

  // Wait for processing & cards to populate
  console.log("⏳ Waiting for Gemini 3.5 Flash & Deterministic Decision Engine...");
  await page.waitForResponse(
    (res) => res.url().includes("/api/analyze") && res.status() === 200,
    { timeout: 30000 }
  );
  await page.waitForTimeout(2000);

  // 4. Smoothly scroll through the results
  console.log("📍 [4/8] Reviewing verification, market evidence, decision, and simulated trade...");
  await smoothScroll(page, 400, 1200);
  await page.waitForTimeout(2500);

  await smoothScroll(page, 750, 1200);
  await page.waitForTimeout(3000);

  await smoothScroll(page, 1100, 1200);
  await page.waitForTimeout(3000);

  await smoothScroll(page, 0, 1000);
  await page.waitForTimeout(1500);

  // 5. Switch to Positions tab
  console.log("📍 [5/8] Navigating to Positions tab...");
  const positionsTab = page.locator("button:has-text('Positions')").first();
  if (await positionsTab.isVisible()) {
    await positionsTab.hover();
    await page.waitForTimeout(400);
    await positionsTab.click();
    await page.waitForTimeout(2500);

    // Close one active position to demonstrate PnL simulation
    const closeTradeBtn = page.locator("button:has-text('Close')").first();
    if (await closeTradeBtn.isVisible()) {
      await closeTradeBtn.hover();
      await page.waitForTimeout(600);
      await closeTradeBtn.click();
      await page.waitForTimeout(2500);
    }
  }

  // 6. Switch to Audit Ledger tab
  console.log("📍 [6/8] Navigating to Audit Ledger tab...");
  const ledgerTab = page.locator("button:has-text('Audit Ledger')").first();
  if (await ledgerTab.isVisible()) {
    await ledgerTab.hover();
    await page.waitForTimeout(400);
    await ledgerTab.click();
    await page.waitForTimeout(2000);

    // Click on the first row in ledger to open the Inspect Modal
    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.isVisible()) {
      await firstRow.hover();
      await page.waitForTimeout(600);
      await firstRow.click();
      console.log("🔍 Opened Audit Trail Inspector Modal (SHA-256 Chaining)...");
      await page.waitForTimeout(4000);

      // Close modal
      const closeBtn = page.locator("div.fixed button:has(svg)").first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
      await page.waitForTimeout(1000);
    }
  }

  // 7. Scenario 2: Safety Halt / NO TRADE demo
  console.log("📍 [7/8] Demonstrating Scenario 2: Social Media Rumor (Safety Halt)...");
  const terminalTab = page.locator("button:has-text('Terminal')").first();
  await terminalTab.click();
  await page.waitForTimeout(1000);

  const preset2 = page.locator("button:has-text('02. Social Media Rumor')").first();
  if (await preset2.isVisible()) {
    await preset2.hover();
    await page.waitForTimeout(500);
    await preset2.click();
    await page.waitForTimeout(1000);

    const submitBtn2 = page.locator("button:has-text('RUN PIPELINE')").first();
    await submitBtn2.hover();
    await page.waitForTimeout(400);
    await submitBtn2.click();

    await page.waitForResponse(
      (res) => res.url().includes("/api/analyze") && res.status() === 200,
      { timeout: 30000 }
    );
    await page.waitForTimeout(1500);

    await smoothScroll(page, 550, 1000);
    await page.waitForTimeout(3000);
  }

  // 8. Scroll back up to Hero / Header
  console.log("📍 [8/8] Finishing up walkthrough...");
  await smoothScroll(page, 0, 800);
  await page.waitForTimeout(2000);

  console.log("Closing browser and finalizing video stream...");
  await page.close();
  await context.close();
  await browser.close();

  const webmPath = path.join(outputDir, "lexitrade-walkthrough.webm");

  // Find the newly recorded video file and copy to canonical name
  const videoFiles = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith("page@") && f.endsWith(".webm"))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(outputDir, f)).mtimeMs,
      size: fs.statSync(path.join(outputDir, f)).size,
    }))
    .filter((f) => f.size > 500000)
    .sort((a, b) => b.time - a.time);

  if (videoFiles.length > 0) {
    const latestWebm = path.join(outputDir, videoFiles[0].name);
    fs.copyFileSync(latestWebm, webmPath);
    console.log(`🎉 Master Walkthrough Video Ready (Full HD 1080p): ${webmPath}`);
  }
}

run().catch((err) => {
  console.error("Recording error:", err);
  process.exit(1);
});
