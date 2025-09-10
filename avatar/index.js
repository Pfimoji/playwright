import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
app.use(cors()); // allow frontend to call backend

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  const cookiesStr = req.query.cookies || "";

  if (!url) return res.status(400).send("Missing url parameter");

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Apply cookies from frontend
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
    // Navigate to the exact URL
    await page.goto(url, { waitUntil: "networkidle" });

    // Capture the full scrollable page
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
