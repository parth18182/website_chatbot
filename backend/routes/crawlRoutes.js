import express from 'express';
import { crawlWebsite } from '../controllers/crawlController.js';

const router = express.Router();

router.post('/', crawlWebsite);

export default router;