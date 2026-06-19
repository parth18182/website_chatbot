import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
    url: { 
        type: String, 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    embedding: { 
        type: [Number], 
        required: true 
    }
}, { timestamps: true });

export default mongoose.model('DocumentChunk', chunkSchema);