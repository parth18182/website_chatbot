import { CohereClient } from 'cohere-ai';
import DocumentChunk from '../models/DocumentChunk.js';

export const chatWithWebsite = async (req, res) => {
  const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    console.log(`Received question: "${question}"`);

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
          numCandidates: 100,
          limit: 4
        }
      }
    ]);

    if (rawChunks.length === 0) {
      return res.status(200).json({
        answer: "I don't know based on the provided website because no matching data was indexed.",
        sources: []
      });
    }

    const contextText = rawChunks.map(chunk => chunk.text).join("\n\n");
    const uniqueSources = [...new Set(rawChunks.map(chunk => chunk.url))];

    const prompt =
      "You are a helpful AI assistant. Answer the user's question using ONLY the provided website context below.\n" +
      "If the context does not contain the answer, reply exactly with: 'I don't know based on the provided website.'\n" +
      "Do not make up facts, guess, or bring in outside knowledge.\n\n" +
      `--- CONTEXT ---\n${contextText}\n--- END CONTEXT ---\n\n` +
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