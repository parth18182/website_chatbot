import express from 'express';
import { chatWithWebsite } from '../controllers/chatController.js';

const router = express.Router();

router.post('/', chatWithWebsite);

export default router;