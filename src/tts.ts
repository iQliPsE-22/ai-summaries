import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import path from "node:path";
import fs from "fs";
import { Readable } from "stream";

export async function generateTTS({
  summary,
  index,
}: {
  summary: string;
  index: number;
}) {
  const API_KEY = process.env.ELEVENLABS_API_KEY;

  if (!API_KEY) {
    console.log("API key not found");
    return;
  }
  const client = new ElevenLabsClient({
    environment: "https://api.elevenlabs.io",
    apiKey: API_KEY,
  });

  const audioDir = path.join(process.cwd(), "audio_output");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
  }

  const response = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    outputFormat: "mp3_44100_128",
    text: summary,
    modelId: "eleven_multilingual_v2",
  });
  const fileName = `product_${index + 1}.mp3`;
  const filePath = path.join(audioDir, fileName);

  const writer = fs.createWriteStream(filePath);
  Readable.fromWeb(response as any).pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

export async function convertSummariesToTTS({
  summaries,
}: {
  summaries: string[];
}) {
  for (const [index, summary] of summaries.entries()) {
    console.log("Saving audio for product", index + 1);
    await generateTTS({ summary, index });
  }
}
