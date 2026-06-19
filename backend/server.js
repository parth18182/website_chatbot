import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crawlRoutes from './routes/crawlRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import connectDB from './database/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/crawl', crawlRoutes)
app.use('/api/chat', chatRoutes); 

app.listen(PORT, () => {
  connectDB()
  console.log(`Server is running on port ${PORT}`);
});