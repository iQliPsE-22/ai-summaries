import puppeteer, { Page, Browser } from "puppeteer";
import type { product } from "../types/product.js";

// --- Configuration & Selectors ---
const CONFIG = {
  baseUrl: "https://www.ebay.com/sch/i.html?_nkw=mechanical+keyboard",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 800 },
  selectors: {
    searchResultLink: ".s-card__link",
    // Arrays allow us to support multiple variations (A/B testing)
    title: [
      ".x-item-title__mainTitle",
      "h1.x-item-title__mainTitle",
      "#vi-lkhdr-itmTitl",
    ],
    price: [".x-price-primary", ".prcIsum"],
    descriptionMeta: 'meta[name="description"]',
    descriptionText: ".ux-textspans",
  },
  timeouts: {
    pageLoad: 60000,
    selector: 6000,
  },
};

// --- Helpers ---

const randomDelay = (min = 1000, max = 3000) =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)),
  );

// ------------------
//  Extracts clean, valid product URLs from the search results page.
//  -------------------------
async function extractProductLinks(
  page: Page,
  limit: number,
): Promise<string[]> {
  await page.waitForSelector(CONFIG.selectors.searchResultLink, {
    timeout: CONFIG.timeouts.selector,
  });

  const links = await page.evaluate(
    (selector, limit) => {
      const validLinks: string[] = [];
      const elements = document.querySelectorAll(selector);

      for (const el of elements) {
        const href = el.getAttribute("href");
        // Filter out ads, redirects, and irrelevant links
        if (
          href &&
          href.startsWith("http") &&
          !href.includes("ebay.com/trx") &&
          href.includes("/itm/")
        ) {
          validLinks.push(href);
        }
        if (validLinks.length >= limit) break;
      }
      return validLinks;
    },
    CONFIG.selectors.searchResultLink,
    limit + 5,
  ); // Fetch a buffer to handle duplicates

  return [...new Set(links)].slice(0, limit);
}

/**
 * Navigates to a single product page and extracts details.
 */
async function scrapeSingleProduct(
  page: Page,
  url: string,
): Promise<product | null> {
  try {
    console.log(`[INFO] Scraping: ${url}`);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: CONFIG.timeouts.pageLoad,
    });
    await randomDelay(1500, 3000); // Mimic human reading time

    // Wait for critical element (Title) to ensure render
    // We join selectors with comma to wait for ANY of the valid title classes
    const titleSelector = CONFIG.selectors.title.join(",");
    await page
      .waitForSelector(titleSelector, { timeout: CONFIG.timeouts.selector })
      .catch(() =>
        console.warn(
          "[WARN] Title selector timeout, attempting extraction anyway...",
        ),
      );

    // Extract Data
    const data = await page.evaluate((selectors) => {
      // Helper to find first matching element from a list of selectors
      const getText = (selectorList: string[]) => {
        const el = document.querySelector(selectorList.join(","));
        return el ? (el as HTMLElement).innerText.trim() : null;
      };

      const name = getText(selectors.title) || "No Title";
      const price = getText(selectors.price) || "No Price";

      // Description Strategy: Meta Tag -> Text Span -> Fallback
      let description = "";
      const meta = document.querySelector(selectors.descriptionMeta);
      if (meta) {
        description = (meta as HTMLMetaElement).content;
      } else {
        const textSpan = document.querySelector(selectors.descriptionText);
        if (textSpan) description = (textSpan as HTMLElement).innerText.trim();
      }

      return { name, price, description };
    }, CONFIG.selectors);

    // Validation: If no title, the page probably blocked us or failed to load
    if (data.name === "No Title") {
      console.warn("[WARN] Failed to extract title. Skipping.");
      return null;
    }

    // Fallback Description Logic
    let finalDescription = data.description;
    if (
      !finalDescription ||
      finalDescription.length < 20 ||
      finalDescription === "No Description"
    ) {
      finalDescription = `Product: ${data.name}. Price: ${data.price}. Please check the link for full details.`;
    }

    return {
      name: data.name,
      price: data.price,
      description: finalDescription,
      url,
    };
  } catch (error) {
    console.error(
      `[ERROR] Error on page ${url}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

// --- Main Function ---

export async function scrapeProducts({
  noOfProducts,
}: {
  noOfProducts: number;
}): Promise<product[]> {
  console.log("[INFO] Launching Scraper (Puppeteer)...");

  let browser: Browser | null = null;
  const products: product[] = [];

  try {
    browser = await puppeteer.launch({
      headless: false, // Keep false for debugging/demo
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);
    await page.setUserAgent(CONFIG.userAgent);

    // 1. Get Links
    console.log(`[INFO] Navigating to search: ${CONFIG.baseUrl}`);
    await page.goto(CONFIG.baseUrl, { waitUntil: "domcontentloaded" });

    // Fetch a large pool of items to handle skips/failures
    const candidateLinks = await extractProductLinks(page, noOfProducts * 4);
    console.log(
      `[INFO] Found ${candidateLinks.length} potential items. Needed: ${noOfProducts}`,
    );

    // 2. Scrape Items until quota is met
    for (const link of candidateLinks) {
      if (products.length >= noOfProducts) {
        console.log(`[INFO] Quota reached (${noOfProducts} items). Stopping.`);
        break;
      }

      const product = await scrapeSingleProduct(page, link);
      if (product) {
        products.push(product);
        console.log(
          `[INFO] Extracted ${products.length}/${noOfProducts}: ${product.name.substring(0, 30)}...`,
        );
      }
    }

    if (products.length < noOfProducts) {
      console.warn(
        `[WARN] Only managed to scrape ${products.length} out of ${noOfProducts} requested products.`,
      );
    }

    console.log(
      `[INFO] Scraping complete. Collected ${products.length} items.`,
    );
    return products;
  } catch (error) {
    console.error("[ERROR] Critical Scraper Error:", error);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}
