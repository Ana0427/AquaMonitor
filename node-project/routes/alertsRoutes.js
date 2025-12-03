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

router.patch('/resolve-all', async (req, res) => {
    try {
        await Alert.updateMany(
            { isResolved: false },
            { isResolved: true, endTime: new Date() }
        );
        res.json({ message: 'Todos os alertas foram resolvidos' });
    } catch (error) {
        console.error('Erro ao resolver todos os alertas:', error);
        res.status(500).json({ message: 'Erro ao resolver todos os alertas' });
    }
});

// PATCH: Resolver um alerta (DEPOIS da rota /resolve-all)
router.patch('/:id', async (req, res) => {
    try {
        const { isResolved } = req.body;
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { isResolved, endTime: new Date() },
            { new: true }
        );
        res.json(alert);
    } catch (error) {
        console.error('Erro ao resolver alerta:', error);
        res.status(500).json({ message: 'Erro ao resolver alerta' });
    }
});

// DELETE: Deletar um alerta
router.delete('/:id', async (req, res) => {
    try {
        await Alert.findByIdAndDelete(req.params.id);
        res.json({ message: 'Alerta deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar alerta:', error);
        res.status(500).json({ message: 'Erro ao deletar alerta' });
    }
});

router.delete('/delete-all', async (req, res) => {
    try {
        await Alert.deleteMany({});
        res.json({ message: 'Todos os alertas foram apagados' });
    } catch (error) {
        console.error('Erro ao apagar todos os alertas:', error);
        res.status(500).json({ message: 'Erro ao apagar todos os alertas' });
    }
});

export default router;
