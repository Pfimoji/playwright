import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { chromium } from "playwright";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/screenshot", async (req, res) => {
  const { url, updates } = req.body;

  if (!url) return res.status(400).send("Missing url");

  let browser;
  try {
    browser = await chromium.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle" });

    // ✅ Apply all DOM updates
    if (Array.isArray(updates)) {
      await page.evaluate((updates) => {
        updates.forEach(({ selector, property, value }) => {
          const el = document.querySelector(selector);
          if (el) el.style[property] = value;
        });
      }, updates);
    }

    const buffer = await page.screenshot({ fullPage: true });
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Screenshot failed:", err);
    res.status(500).send("Screenshot failed");
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
