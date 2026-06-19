import axios from 'axios';
import robotsParser from 'robots-parser';
import { CohereClient } from 'cohere-ai';
import { scrapePageContent, extractInternalLinks } from '../utils/scraper.js';
import { chunkText } from '../utils/chunker.js';
import DocumentChunk from '../models/DocumentChunk.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const crawlWebsite = async (req, res) => {
    const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const baseUrl = new URL(url).origin;
        let robots = null;
        try {
            const { data: robotsTxt } = await axios.get(`${baseUrl}/robots.txt`);
            robots = robotsParser(`${baseUrl}/robots.txt`, robotsTxt);
        } catch (e) {
            console.log("No robots.txt found. Proceeding.");
        }

        const maxPages = 5;
        const visited = new Set();

        const queue = [url];
        let totalChunksSaved = 0;

        while (queue.length > 0 && visited.size < maxPages) {
            const currentUrl = queue.shift();

            if (visited.has(currentUrl)) continue;
            if (robots && !robots.isAllowed(currentUrl, 'Bot')) continue;

            console.log(`Crawling and Indexing with Cohere: ${currentUrl}`);
            visited.add(currentUrl);

            const result = await scrapePageContent(currentUrl);

            if (result && result.cleanText) {
                const chunks = chunkText(result.cleanText, 1000, 200);

                if (chunks.length > 0) {
                    const embedResponse = await cohere.embed({
                        texts: chunks,
                        model: 'embed-english-v3.0',
                        inputType: 'search_document',
                    });

                    const dbDocuments = chunks.map((chunk, index) => ({
                        url: currentUrl,
                        text: chunk,
                        embedding: embedResponse.embeddings[index]
                    }));

                    await DocumentChunk.insertMany(dbDocuments);
                    totalChunksSaved += chunks.length;
                    console.log(`Successfully saved ${chunks.length} text chunks to MongoDB.`);
                }

                const newLinks = extractInternalLinks(result.html, currentUrl);
                newLinks.forEach(link => {
                    if (!visited.has(link) && !queue.includes(link)) queue.push(link);
                });
            }
            await delay(1000);
        }

        return res.status(200).json({
            message: "Crawl and Cohere Indexing successful",
            pagesCrawled: visited.size,
            totalChunksSaved: totalChunksSaved
        });

    } catch (error) {
        console.error("Crawl controller error:", error);
        return res.status(500).json({ error: "Failed to process the URL." });
    }
};