import fs from "fs";
import type { product } from "../types/product.js";

export function saveProducts({ products }: { products: product[] }) {
  try {
    console.log("Saving products to products.json");
    fs.writeFileSync("products.json", JSON.stringify(products));
    console.log("Products saved successfully");
  } catch (error) {
    console.error(error);
  }
}

export async function saveSummaries({ summaries }: { summaries: any }) {
  try {
    console.log("Saving summaries to summaries.json");
    fs.writeFileSync("summaries.json", JSON.stringify(summaries));
    console.log("Summaries saved successfully");
  } catch (error) {
    console.error(error);
  }
}

export async function getProducts(): Promise<product[]> {
  try {
    const products = fs.readFileSync("./products.json", "utf-8");
    console.log("Products loaded successfully");
    return JSON.parse(products);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSummaries(): Promise<string[]> {
  try {
    const summaries = fs.readFileSync("./summaries.json", "utf-8");
    console.log("Summaries loaded successfully");
    return JSON.parse(summaries);
  } catch (error) {
    console.error(error);
    return [];
  }
}
