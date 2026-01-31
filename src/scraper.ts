import axios from "axios";
import * as cheerio from "cheerio";
import type { product } from "../types/product.js";

const BASE_URL = "https://books.toscrape.com";

export async function scrapeProducts({
  noOfProducts,
}: {
  noOfProducts: number;
}) {
  console.log("Connection to website...");
  try {
    const { data: mainPageHtml } = await axios.get(BASE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });
    const $ = cheerio.load(mainPageHtml);
    const productLinks: string[] = [];

    $(".product_pod h3 a")
      .slice(0, noOfProducts)
      .each((_, element) => {
        const relativeLink = $(element).attr("href");
        if (relativeLink) {
          const fullUrl = relativeLink.startsWith("catalogue")
            ? `${BASE_URL}/${relativeLink}`
            : `${BASE_URL}/catalogue/${relativeLink}`;

          productLinks.push(fullUrl);
        }
      });
    const products: product[] = [];
    for (const link of productLinks) {
      const { data: productHtml } = await axios.get(link);
      const $ = cheerio.load(productHtml);
      const name = $(".product_main h1").text().trim();
      const price = $(".product_main .price_color").text().trim();
      const description = $("#product_description").next("p").text().trim(); //grabing p next to product_description as the description p is not inside the product_description div
      const url = link;
      products.push({ name, price, description, url });
    }
    // console.log(products);
    console.log("Scraping completed");
    return products;
  } catch (error) {
    console.error(error);
    return [];
  }
}
