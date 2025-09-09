const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your Figma published site
const FIGMA_SITE_URL = "https://pecan-kindle-00378129.figma.site";

app.get("/", (req, res) => {
  res.send(
    `<h1>Playwright Screenshot API</h1>
     <p>Go to <a href="/screenshot">/screenshot</a> to get a live screenshot of the Figma site.</p>`
  );
});

app.get("/screenshot", async (req, res) => {
  try {
    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });
    const page = await browser.newPage();
    await page.goto(FIGMA_SITE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000); // optional wait for full render

    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=figma-screenshot.png"
    );
    res.send(screenshot);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to capture screenshot");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
