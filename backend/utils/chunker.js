/**
 * Splits a large string of text into smaller chunks with overlap.
 * @param {string} text - The full text from the webpage
 * @param {number} chunkSize - Max characters per chunk (default: 1000)
 * @param {number} overlap - Number of characters to overlap (default: 200)
 */
export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
    if (!text) return [];
    
    const chunks = [];
    let i = 0;
    
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += (chunkSize - overlap); // Move forward, but step back a bit for overlap
    }
    
    return chunks;
};