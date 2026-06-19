/**
 * @param {string} text 
 * @param {number} chunkSize 
 * @param {number} overlap
 */
export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
    if (!text) return [];
    
    const chunks = [];
    let i = 0;
    
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += (chunkSize - overlap); 
    }
    
    return chunks;
};