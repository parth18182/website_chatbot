import { CohereClient } from 'cohere-ai';
import DocumentChunk from '../models/DocumentChunk.js';

export const chatWithWebsite = async (req, res) => {
  const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
  const { question, url } = req.body;

  if (!question || !url) {
    return res.status(400).json({ error: "Question and URL are required" });
  }

  try {
    console.log(`Received question: "${question}" for URL: ${url}`);
    const embedResponse = await cohere.embed({
      texts: [question],
      model: 'embed-english-v3.0',
      inputType: 'search_query', 
    });
    const questionVector = embedResponse.embeddings[0];
    const rawChunks = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: questionVector,
          numCandidates: 150,
          limit: 30 
        }
      }
    ]);

    const cleanUrl = url.replace(/\/$/, "");
    
    const filteredChunks = rawChunks.filter(chunk => {
      if (!chunk || !chunk.url) return false; 
      return chunk.url.startsWith(cleanUrl);
    });

    const topChunks = filteredChunks.slice(0, 8);

    if (topChunks.length === 0) {
      return res.status(200).json({
        answer: "I don't know based on the provided website because no relevant data from this site was found.",
        sources: []
      });
    }

    const contextText = topChunks.map(chunk => chunk.text).join("\n\n");
    const uniqueSources = [...new Set(topChunks.map(chunk => chunk.url))];

    const prompt =
      "You are an expert AI assistant. Answer the user's question accurately using the provided website context fragments.\n" +
      "Look closely at definitions, text layout, and summaries. If the context absolutely does not contain information to answer the question, reply with: 'I don't know based on the provided website.'\n" +
      "Do not invent external facts.\n\n" +
      `--- CONTEXT FRAGMENTS ---\n${contextText}\n--- END CONTEXT ---\n\n` +
      `Question: ${question}`;

    const chatResponse = await cohere.chat({
      model: 'command-r-08-2024',
      message: prompt,
      temperature: 0.0
    });

    return res.status(200).json({
      answer: chatResponse.text,
      sources: uniqueSources
    });

  } catch (error) {
    console.error("Chat controller error:", error);
    return res.status(500).json({ error: "An error occurred while processing your question." });
  }
};