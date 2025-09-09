const express = require("express");
const cors = require("cors"); // ✅ import CORS
const { chromium } = require("playwright");

const app = express();

// ✅ Allow cross-origin requests from any domain (or specify your React app URL)
app.use(cors());

const PORT = process.env.PORT || 3000;
const FIGMA_SITE_URL = "https://pecan-kindle-00378129.figma.site";

app.get("/", (req, res) => {
  res.send(
    `<h1>Playwright Screenshot API</h1>
     <p>Visit <a href="/screenshot">/screenshot</a> to capture the Figma site.</p>`
  );
});

app.get("/screenshot", async (req, res) => {
  try {
    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(FIGMA_SITE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", "attachment; filename=figma.png");
    res.send(screenshot);
  } catch (err) {
    console.error(err);
    res.status(500).send("Screenshot failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
