# Product Scraper & TTS Generator

This project is a backend assessment tool that acts as a pipeline to:

1.  **Scrape** product details from a target website.
2.  **Generate** summaries using OpenAI (LLM).
3.  **Convert** summaries to audio using ElevenLabs (Text-to-Speech).

## Features

- **Data Persistence**: Scraped products and generated summaries are saved to local JSON files (`products.json`, `summaries.json`).
- **Smart Caching**: To save on API costs and processing time, the system checks for existing local files before initiating new scraping or generation requests.
  - If `products.json` exists, it skips scraping.
  - If `summaries.json` exists, it skips LLM generation.
- **Automated Pipeline**: Seamlessly connects scraping, AI summarization, and TTS.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm
- **OpenAI API Key**
- **ElevenLabs API Key**

## Setup

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd ss-backend-assessment
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your API keys:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
    ```

## Usage

To start the development server (which runs the pipeline):

```bash
npm run dev
```

### How to Refresh Data

Because the system prefers local data:

- To **re-scrape products**, delete `products.json`.
- To **regenerate summaries**, delete `summaries.json`.
- To **start fresh**, delete both JSON files.

## Project Structure

- `src/index.ts`: Main entry point orchestrating the flow.
- `src/scraper.ts`: Handles web scraping logic.
- `src/llm.ts`: Connects to OpenAI for summary generation.
- `src/tts.ts`: Connects to ElevenLabs for audio generation.
- `src/storage.ts`: Utilities for reading/writing local JSON files.
- `audio_output/`: Directory where generated MP3 files are saved.
