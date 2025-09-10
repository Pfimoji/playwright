import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { chromium } from "playwright";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/screenshot", async (req, res) => {
  const { url, interactions } = req.body;
  if (!url) return res.status(400).send("Missing URL");

  let browser;
  try {
    browser = await chromium.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    if (Array.isArray(interactions)) {
      for (const action of interactions) {
        switch (action.type) {
          case "click":
            try { await page.click(action.selector, { timeout: 3000 }); } catch {}
            break;

          case "style":
            await page.evaluate(({ selector, value }) => {
              const el = document.querySelector(selector);
              if (el) el.setAttribute("style", value);
            }, { selector: action.selector, value: action.value });
            break;

          case "svg-fill":
            await page.evaluate(({ selector, value }) => {
              const el = document.querySelector(selector);
              if (!el) return;
              const fillStyle = getComputedStyle(el).fill;
              if (fillStyle.startsWith("var(")) {
                const varName = fillStyle.match(/var\((--[a-zA-Z0-9-_]+)\)/)[1];
                document.documentElement.style.setProperty(varName, value);
              } else {
                el.setAttribute("fill", value);
              }
            }, { selector: action.selector, value: action.value });
            break;

          case "add-element":
            await page.evaluate(({ parentSelector, html }) => {
              const parent = document.querySelector(parentSelector);
              if (parent) parent.insertAdjacentHTML("beforeend", html);
            }, { parentSelector: action.parentSelector, html: action.html });
            break;

          case "input":
            await page.fill(action.selector, action.value);
            break;

          default:
            console.warn("Unknown action type:", action.type);
        }
      }
    }

    // Wait for animations / style updates
    await page.waitForTimeout(500);

    // Full-page screenshot
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
