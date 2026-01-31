# Product Scraper & TTS Generator

This project is a backend assessment tool that acts as a pipeline to:

1.  **Scrape** product details from a target website.
2.  **Generate** summaries using OpenAI (LLM).
3.  **Convert** summaries to audio using ElevenLabs (Text-to-Speech).

## Features

- **Data Persistence**: Scraped products and generated summaries are saved to local JSON files (`products.json`, `summaries.json`).
- **Automated Pipeline**: Seamlessly connects scraping, AI summarization, and TTS in a linear process.

## 🚀 How to Run the Script

1.  **Start the development server**:

    ```bash
    npm run dev
    ```

    This command compiles the TypeScript code and runs the pipeline.

2.  **Verify Output**:
    - Check `products.json` for scraped data.
    - Check `summaries.json` for generated summaries.
    - Check `audio_output/` folder for the generated MP3 files.

## 🌐 Scraped Website

The script scrapes data from:
**[https://www.ebay.com/sch/i.html?\_nkw=mechanical+keyboard](https://www.ebay.com/sch/i.html?_nkw=mechanical+keyboard)**

It extracts:

- **Name**: Product title
- **Price**: Product price
- **Description**: Short description or placeholder
- **URL**: Direct link to the product page

## 🛠 Design Choices

### 1. Puppeteer for Scraping (Bot Avoidance & Dynamic Content)

Switched to **Puppeteer** to handle dynamic content and potential bot detection mechanisms on e-commerce sites like eBay. It allows for:

- Mimicking real user behavior (User-Agent, delays).
- Handling dynamic DOM rendering.
- Accessing iframes (for descriptions).

### 2. Modular Architecture

The code is split into distinct modules for better maintainability:

- `scraper.ts`: Contains Puppeteer extraction logic.
- `llm.ts`: Isolates OpenAI interaction.
- `tts.ts`: Isolates ElevenLabs interaction.
- `storage.ts`: Centralizes file I/O operations.

### 3. Type Safety

TypeScript is used throughout to ensure data integrity, particularly for the Product and Summary interfaces passed between modules.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (Node Package Manager)
- **Git** (for version control)
- **API Keys**: You will need valid API keys for:
  - [OpenAI](https://platform.openai.com/) (for summarization)
  - [ElevenLabs](https://elevenlabs.io/) (for text-to-speech)

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

3.  **Configure Environment**:
    Create a `.env` file in the root directory and add your keys:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
    ```

## Project Structure

- `src/index.ts`: Main entry point orchestrating the flow.
- `src/scraper.ts`: Handles web scraping logic.
- `src/llm.ts`: Connects to OpenAI for summary generation.
- `src/tts.ts`: Connects to ElevenLabs for audio generation.
- `src/storage.ts`: Utilities for reading/writing local JSON files.
- `audio_output/`: Directory where generated MP3 files are saved.
