import "dotenv/config";
import { scrapeProducts } from "./scraper.js";
import { saveProducts, saveSummaries, saveTTS } from "./storage.js";
import { generateSummaries } from "./llm.js";
import { convertSummariesToTTS } from "./tts.js";

// step 1: scrape products
const products = await scrapeProducts({ noOfProducts: 1 });

// step 2: save products
saveProducts({ products });

// step 3: generate product summaries and save in files
const summaries = await generateSummaries({ products });
saveSummaries({ summaries });

// step 4: generate tts and save in files
await convertSummariesToTTS({ summaries });
