import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { chromium } from "playwright";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Screenshot endpoint
app.post("/screenshot", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).send("Missing url in request body");
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // helps on low-memory servers
        "--disable-gpu",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    // Navigate to the page
    await page.goto(url, {
      waitUntil: "networkidle", // ensures full load
      timeout: 60000,
    });

    // Extra wait for animations / React updates
    await page.waitForTimeout(1500);

    // Take full page screenshot
    const buffer = await page.screenshot({ fullPage: true });

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("❌ Screenshot error:", err);
    res.status(500).send("Failed to capture screenshot");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
