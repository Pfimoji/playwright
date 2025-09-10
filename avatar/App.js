import express from "express";
import { chromium } from "playwright";

const app = express();

// Existing routes here...

// Add the screenshot route
app.get("/screenshot", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing url parameter");
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the URL provided by frontend
    await page.goto(url, { waitUntil: "networkidle" });

    // Capture only the visible viewport
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

// Start the server (adjust port if needed)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
