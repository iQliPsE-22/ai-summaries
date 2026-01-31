import "dotenv/config";
import { scrapeProducts } from "./scraper.js";
import {
  getProducts,
  getSummaries,
  saveProducts,
  saveSummaries,
} from "./storage.js";
import { generateSummaries } from "./llm.js";
import { convertSummariesToTTS } from "./tts.js";

//-------------------------
//  step 1: scrape products
// ------------------------

let products = await getProducts();
if (products.length === 0) {
  products = await scrapeProducts({ noOfProducts: 1 });
  saveProducts({ products });
}

//----------------------------
//  step 2: generate product summaries and save in files
// ------------------------

let summaries = await getSummaries();
console.log(summaries);
if (summaries.length === 0) {
  summaries = await generateSummaries({ products });
  saveSummaries({ summaries });
}

//-------------------------
//  step 3: generate tts and save in files
// ------------------------

await convertSummariesToTTS({ summaries });
