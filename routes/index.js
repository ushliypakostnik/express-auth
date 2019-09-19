import { Router } from 'express';
import api from './api/index';

const router = Router();

// API

router.use('/api', api);

// Test route
router.get('/test', (req, res, next) => {
  console.log('test rout!', req.headers);
  res.send(req.t('test'));
});

// Others
router.use((req, res) => {
  res.status(404);
  res.send(req.t('page404'));
  res.end();
});

export default router;
