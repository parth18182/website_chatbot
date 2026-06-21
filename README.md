# Chat with a Website — Crawl + RAG Application

A full-stack Retrieval-Augmented Generation (RAG) application that allows users to scrape a target website page, index its semantic content into a vector database, and chat with an AI assistant that provides grounded, cited answers based on the indexed source material.

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* Lucide Icons

### Backend

* Node.js
* Express
* Axios
* Cheerio
* LangChain

### AI & Embeddings

* Cohere (`embed-english-v3.0`)
* Cohere (`command-r-08-2024 LLM`)

### Database / Vector Store

* MongoDB Atlas (Vector Search Index)

## 🚀 How to Run the Project

### 1. Prerequisites

You will need:

* A Cohere API Key (free tier works great).
* A MongoDB Atlas account with a cluster running.

### 2. Set Up MongoDB Atlas Vector Search

You must create a Vector Search Index on your target collection.

1. In your MongoDB Atlas Dashboard, navigate to **Search → Create Search Index**.
2. Select **JSON Editor** and choose your database collection.
3. Paste the following configuration:

```json
{
  "fields": [
    {
      "numDimensions": 1024,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    },
    {
      "path": "url",
      "type": "filter"
    }
  ]
}
```

4. Name the index `vector_index` and click **Create**.

### 3. Environment Variables

Create a file named `.env` inside your `/backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
COHERE_API_KEY=your_cohere_api_key
```

### 4. Installation & Local Startup

Open two terminal windows to run the servers in parallel.

#### Terminal 1 (Backend)

```bash
cd backend
npm install
npm run dev
```

#### Terminal 2 (Frontend)

```bash
cd frontend
npm install
npm run dev
```

Navigate to:

```text
http://localhost:5173
```

to interact with the application.

## 🧠 System Architecture & Strategy

### 1. Crawling Strategy

* To maximize noise reduction, our crawler utilizes `axios` to retrieve the static HTML of the requested webpage and parses the DOM tree using `cheerio`.
* **Boilerplate Stripping:** We explicitly extract and destroy noise elements such as `<script>`, `<style>`, `<nav>`, and `<footer>` tags.
* **Targeted Selection:** We focus strictly on meaningful semantic tag hierarchies (like `<article>`, `<main>`, `<p>`, and header elements `<h1>`-`<h6>`) to isolate the actual written content from cookie banners or navigation blocks.

### 2. Chunking & Embedding Strategy

* Raw text is sliced into manageable pieces using LangChain’s `RecursiveCharacterTextSplitter`.
* **Configuration:** Chunk Size is set to `1000` characters with a `200` character overlap.
* **Reasoning:** A 1000-character block is large enough to contain fully realized thoughts and context, while the 200-character overlap prevents structural concepts from getting cleanly split in half at chunk boundaries.
* **Vectors:** Chunks are vectorized using Cohere's `embed-english-v3.0` model, generating highly descriptive 1024-dimension vectors.

### 3. Retrieval & In-Scope Security

When a user asks a question:

1. The question is vectorized using Cohere.
2. A mathematical vector search queries MongoDB Atlas using cosine similarity to gather candidate chunks.
3. **In-Scope Filtering:** To ensure strict boundaries and prevent "site bleeding" (e.g., retrieving answers from a previously scraped site-A.com when searching on site-B.com), we run a backend memory filter ensuring the retrieved chunk's saved metadata `url` matches the active user-provided base URL.

### 4. Keeping Answers Grounded (Anti-Hallucination)

To keep responses factual and cited:

* We feed the AI the filtered context fragments alongside a strict prompt instruction:

> "If the context absolutely does not contain information to answer the question, reply with: 'I don't know based on the provided website.' Do not invent external facts."

* We enforce a temperature of `0.0` to reduce the model's creativity and force deterministic outputs.
* We pull unique source URLs directly from the database metadata and deliver them alongside the text so the frontend can generate dynamic, hyperlinked citations.

## 💡 Limitations & Future Improvements

As requested, here is a transparent look at current limitations and how I would engineer fixes for a production environment:

### Single-Page vs. Deep Crawling

**Current:** The app only scrapes the specific URL provided. It doesn't crawl the whole domain.

**Fix:** Implement a queue system (like BullMQ) to recursively crawl links, actively parse `robots.txt` to ensure politeness, and enforce a strict crawl depth limit.

### JavaScript-Heavy Sites (SPAs)

**Current:** `axios` and `cheerio` only fetch static HTML. If a site relies on client-side React/Angular, the text will be missed.

**Fix:** Swap to a headless browser like Puppeteer or Playwright to render the full DOM before extraction.

### Retrieval on Long Pages

**Current:** On massive pages, pure vector search can sometimes miss exact keyword matches.

**Fix:** Implement hybrid search, combining MongoDB Vector Search with keyword-based lexical search (like BM25) for higher precision.

### Stateless Chat

**Current:** The bot evaluates each question in isolation and doesn't remember previous messages.

**Fix:** Pass the `chat_history` array from the frontend into the Cohere API to enable contextual follow-up questions.
