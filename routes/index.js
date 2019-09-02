import { Router } from 'express';
import api from './api/index';

const router = Router();

// API

router.use('/api', api);

// Test route
router.get('/test', (req, res) => {
  res.sendStatus(200);
});

// Others
router.use((req, res) => {
  res.status(404);
  res.send('Page not found!!!');
});

export default router;
