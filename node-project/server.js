// importando os módulos necessários
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import config from './config/app.js';
import indexRoutes from './routes/index.js';
import serialService from './services/serialService.js';

console.log('Iniciando o servidor...');

// Cria uma aplicação Express (servidor web)
const app = express();
const server = http.createServer(app); // Cria o servidor HTTP
const io = new Server(server); // Passa o servidor para o Socket.IO

app.use(express.static('public')); //arquivos estáticos da pasta 'public'

// Monta as rotas
app.use('/', indexRoutes);

// Inicializa o serviço de comunicação serial com io e config
serialService.initSerialService(io, config.serial);

// Inicia o servidor na porta especificada
const PORT = config.port; // Usa a porta do ambiente ou 3000
server.listen(PORT, () => {
    console.log(`Server está sendo executado na porta ${PORT}`);
});