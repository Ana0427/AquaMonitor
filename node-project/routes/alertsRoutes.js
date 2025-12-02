import express from 'express';
import Alert from '../models/alerts.js';

const router = express.Router();

// Rota para buscar o histórico de alertas
router.get('/history', async (req, res) => {
    try {
        // Implementar filtros se necessário (ex: por data, por tipo)
        const alerts = await Alert.find().sort({ timestamp: -1 }); // Ordena do mais recente para o mais antigo
        res.json(alerts);
    } catch (error) {
        console.error('Erro ao buscar histórico de alertas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

export default router;