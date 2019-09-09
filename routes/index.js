import { Router } from 'express';
import api from './api/index';

const router = Router();

// API

router.use('/api', api);

// Test route
router.get('/test', (req, res, next) => {
  console.log('test rout!');
  res.sendStatus(200);
});

// Others
router.use((req, res) => {
  res.status(404);
  res.send('Page not found!!!');
  res.end();
});

export default router;
