import dotenv from 'dotenv'; // Importa o módulo dotenv para carregar variáveis de ambiente

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

export default {
    port: process.env.PORT, // Porta do servidor obtida das variáveis de ambiente
    serial: { // Configurações da porta serial
        path: 'COM7',
        baudRate: 9600,
    }
};