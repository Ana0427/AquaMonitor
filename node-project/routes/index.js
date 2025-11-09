import { Router } from 'express';
import { join } from 'path';
const router = Router();

// Rota raiz
router.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

export default router;