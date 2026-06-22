import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapePageContent = async (url) => {
    try {
        const { data } = await axios.get(url);
        // console.log('data-------------', data)
        const $ = cheerio.load(data);

        // console.log('$------------', $('button'))

        $('script, style, noscript, iframe, nav, footer, header, aside').remove();

        const cleanText = $('body').text().replace(/\s+/g, ' ').trim();

        return { html: data, cleanText };
    } catch (error) {
        console.error(`Failed to scrape ${url}:`, error.message);
        return null;
    }
};

export const extractInternalLinks = (html, baseUrl) => {
    const $ = cheerio.load(html);
    const links = new Set();
    const base = new URL(baseUrl);
    // console.log('base',base)

    $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
            try {
                const urlObj = new URL(href, baseUrl);
                // console.log('urlObj',urlObj)
                if (urlObj.hostname === base.hostname) {
                    urlObj.hash = '';
                    links.add(urlObj.href);
                }
            } catch (err) {
            }
        }
    });

    return Array.from(links);
};