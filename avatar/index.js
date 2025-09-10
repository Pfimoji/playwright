import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
app.use(cors()); // allow frontend to call backend

// Helper: scroll page to load lazy content
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

// Wait until the page is "stable" (no DOM changes) for N ms
async function waitForStability(page, stableTime = 1000, maxWait = 5000) {
  const startTime = Date.now();
  let lastHeight = await page.evaluate(() => document.body.scrollHeight);

  while (Date.now() - startTime < maxWait) {
    await page.waitForTimeout(stableTime);
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (newHeight === lastHeight) break; // page is stable
    lastHeight = newHeight;
  }
}

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  const cookiesStr = req.query.cookies || "";

  if (!url) return res.status(400).send("Missing url parameter");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Apply cookies for authenticated pages
  if (cookiesStr) {
    const cookies = cookiesStr.split("; ").map((c) => {
      const [name, ...rest] = c.split("=");
      return {
        name,
        value: rest.join("="),
        domain: "playwright-4coz.onrender.com", // adjust to your domain
        path: "/",
      };
    });
    await context.addCookies(cookies);
  }

  try {
    // Navigate to the target URL
    await page.goto(url, { waitUntil: "networkidle" });

    // Scroll the page to trigger lazy-loading
    await autoScroll(page);

    // Wait until page DOM stabilizes (no more changes)
    await waitForStability(page, 1000, 7000);

    // Capture full page
    const buffer = await page.screenshot({ fullPage: true });

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Screenshot failed:", err);
    res.status(500).send("Screenshot failed");
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
