import express from 'express';
import { searchTasks } from './search.controller';

const router = express.Router();

router.get('/search', searchTasks);

export default router;