import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();

// Enable CORS for all routes
app.use(cors());

// Screenshot endpoint
app.get("/screenshot", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing url parameter");
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });

    const buffer = await page.screenshot({ fullPage: false });

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Screenshot failed:", err);
    res.status(500).send("Screenshot failed");
  } finally {
    await browser.close();
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
