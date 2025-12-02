import { Router } from 'express';
import { join } from 'path';
import readingsRoutes from './readingsRoutes.js';
import alertsRoutes from './alertsRoutes.js';
const router = Router();

// Rota para histórico de leituras
router.use('/api/readings', readingsRoutes);

// Rota para histórico de alertas
router.use('/api/alerts', alertsRoutes);

// Rota raiz
router.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

export default router;