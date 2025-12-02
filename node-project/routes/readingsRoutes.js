import express from 'express';
import Reading from '../models/readings.js';

const router = express.Router();

// Rota para buscar o histórico de leituras (fluxo e volume)
router.get('/history', async (req, res) => {
    try {
        // Implementar filtros se necessário (ex: por data, por quantidade)
        const readings = await Reading.find().sort({ timestamp: -1 }); // Ordena do mais recente para o mais antigo
        res.json(readings);
    } catch (error) {
        console.error('Erro ao buscar histórico de leituras:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

export default router;
