import { OpenAI } from "openai";
import type { product } from "../types/product.js";
import { saveSummaries } from "./storage.js";

export async function generateProductSummary({
  product,
}: {
  product: product;
}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY is not set!");
    }
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: `Generate a one line product summary with title and price included in the summary for the following product for audio narration: ${JSON.stringify(product)}`,
        },
      ],
    });
    const summary = response.choices[0]?.message?.content;
    return summary || "No summary generated";
  } catch (error) {
    console.error(error);
    return "No summary generated";
  }
}

export async function generateSummaries({ products }: { products: product[] }) {
  try {
    const summaries: string[] = [];
    for (const product of products) {
      console.log("Generating product summaries for", product.name);
      const summary = await generateProductSummary({ product });
      console.log("Summary generated for", summary);
      summaries.push(summary);
    }
    return summaries;
  } catch (error) {
    console.error(error);
    return [];
  }
}
