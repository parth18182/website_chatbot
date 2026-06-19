import axios from 'axios';
import robotsParser from 'robots-parser';
import { scrapePageContent, extractInternalLinks } from '../utils/scraper.js';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const crawlWebsite = async (req, res) => {
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
            console.log("No robots.txt found or accessible. Proceeding with crawl.");
        }

        const maxPages = 5; 
        const visited = new Set();
        const queue = [url];
        const scrapedData = [];

        while (queue.length > 0 && visited.size < maxPages) {
            const currentUrl = queue.shift();

            if (visited.has(currentUrl)) continue;

            if (robots && !robots.isAllowed(currentUrl, 'Bot')) {
                console.log(`Skipping (Blocked by robots.txt): ${currentUrl}`);
                continue;
            }

            console.log(`Crawling: ${currentUrl}`);
            visited.add(currentUrl);

            const result = await scrapePageContent(currentUrl);
            
            if (result && result.cleanText) {
                scrapedData.push({
                    url: currentUrl,
                    text: result.cleanText
                });

                const newLinks = extractInternalLinks(result.html, currentUrl);
                newLinks.forEach(link => {
                    if (!visited.has(link) && !queue.includes(link)) {
                        queue.push(link);
                    }
                });
            }

            await delay(1000);
        }

        return res.status(200).json({
            message: "Crawl successful",
            pagesCrawled: visited.size,
            data: scrapedData
        });

    } catch (error) {
        console.error("Crawl controller error:", error);
        return res.status(500).json({ error: "Failed to process the URL." });
    }
};