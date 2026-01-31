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

const products = await scrapeProducts({ noOfProducts: 5 });
saveProducts({ products });

//----------------------------
//  step 2: generate product summaries and save in files
// ------------------------
const fetchedProducts = await getProducts();
const summaries = await generateSummaries({ products: fetchedProducts });
saveSummaries({ summaries });

//-------------------------
//  step 3: generate tts and save in files
// ------------------------
const fetchedSummaries = await getSummaries();
await convertSummariesToTTS({ summaries: fetchedSummaries });
