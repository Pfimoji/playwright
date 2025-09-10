// backend/screenshot.js
import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
app.use(cors());
app.use(express.json()); // for POST requests with JSON body

/**
 * POST /screenshot
 * body: { url: string, actions: [{ type: 'click' | 'hover' | 'input', selector: string, value?: string }] }
 */
app.post("/screenshot", async (req, res) => {
  const { url, actions = [] } = req.body;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle" });

    // Wait for your main container to render dynamic content
    await page.waitForSelector("#container");

    // Perform interactive actions before screenshot
    for (const action of actions) {
      const el = await page.$(action.selector);
      if (!el) continue;

      if (action.type === "click") {
        await el.click();
      } else if (action.type === "hover") {
        await el.hover();
      } else if (action.type === "input" && action.value !== undefined) {
        await el.fill(action.value);
      }
      await page.waitForTimeout(200); // small delay after each action
    }

    // Full page screenshot
    const buffer = await page.screenshot({ fullPage: true });

    await browser.close();
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to capture screenshot");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
