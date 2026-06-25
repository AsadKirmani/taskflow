import express from 'express';
import { searchTasks } from './search.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/search', authMiddleware, searchTasks);

export default router;