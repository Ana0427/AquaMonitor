// importando os módulos necessários
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
// Importa os módulos SerialPort e ReadlineParser
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');


// Cria uma aplicação Express (servidor web)
const app = express();
const server = http.createServer(app); // Cria o servidor HTTP
const io = socketIO(server); // Passa o servidor para o Socket.IO

app.use(express.static('public')); //arquivos estáticos da pasta 'public'

// Rota raiz
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/public/index.html');
});

console.log('Hello, Node.js!');


// Configuração da porta serial e do parser de linhas
let port;
let sensorData = {  // Movido para fora do try, inicial global
    fluxo: 0,
    volume: 0
};
try {
    port = new SerialPort({ // Configura a porta serial
        path: 'COM5', 
        baudRate: 9600 
    });

    //Configura o parser para ler linhas terminadas em '\r\n'
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    port.on('open', () => {//Eventos da porta serial
        console.log('Porta serial aberta com sucesso em COM5@9600');
    });

    //Evento de dados recebidos
    parser.on('data', (data) => {
        const dataTrimmed = data.toString().trim(); // Garante string e remove extras
        console.log('=== DADOS RECEBIDOS (RAW):', JSON.stringify(dataTrimmed)); // Log raw com aspas para ver chars hidden

        let updated = false;

        // Parsing flexível para FLUXO com regex (captura variações)
        const fluxoMatch = dataTrimmed.match(/fluxo\s*(de\s*)?:?\s*([\d.,]+)/i);
        if (fluxoMatch) {
            const rawValue = fluxoMatch[2];
            const parsedValue = parseFloat(rawValue.replace(',', '.')); // Trata vírgula como decimal se necessário
            console.log('  -> Tentando parsear FLUXO. Raw extraído:', rawValue, '| Parsed:', parsedValue);
            if (!isNaN(parsedValue)) {
                sensorData.fluxo = parsedValue;
                updated = true;
                console.log('  -> FLUXO ATUALIZADO para:', sensorData.fluxo);
            } else {
                console.log('  -> ERRO: Valor FLUXO não é numérico após parse:', rawValue);
            }
        }

        // Parsing flexível para VOLUME com regex
        const volumeMatch = dataTrimmed.match(/volume\s*(de\s*)?:?\s*([\d.,]+)/i);
        if (volumeMatch) {
            const rawValue = volumeMatch[2];
            const parsedValue = parseFloat(rawValue.replace(',', '.')); // Trata vírgula
            console.log('  -> Tentando parsear VOLUME. Raw extraído:', rawValue, '| Parsed:', parsedValue);
            if (!isNaN(parsedValue)) {
                sensorData.volume = parsedValue;
                updated = true;
                console.log('  -> VOLUME ATUALIZADO para:', sensorData.volume);
            } else {
                console.log('  -> ERRO: Valor VOLUME não é numérico após parse:', rawValue);
            }
        }

        if (!updated) {
            console.log('  -> NENHUMA ATUALIZAÇÃO: Linha não matcha fluxo/volume. Tente ajustar regex se necessário.');
        }

        // Sempre emite os dados atuais
        console.log('Emitindo via Socket.IO:', sensorData);
        io.emit('sensorData', sensorData);  

    });

    // Evento de erro
    port.on('error', (err) => {
        console.log('Erro na porta serial:', err.message);
    });

} catch (error) {// Captura erros na inicialização da porta serial
    console.log('Erro ao inicializar porta serial:', error.message);
    if (port) port.close();
}


// Configuração do Socket.IO
io.on('connection', (socket) => { // Evento de nova conexão
    console.log('Cliente conectado:', socket.id);
    
    // Envia dados iniciais ao conectar
    socket.emit('sensorData', sensorData);
    
    socket.on('disconnect', () => { // Evento de desconexão
        console.log('Cliente desconectado:', socket.id);
    });
});

// Inicia o servidor na porta especificada
const PORT = process.env.PORT || 3000; // Usa a porta do ambiente ou 3000
server.listen(PORT, () => {
    console.log(`Server está sendo executado na porta ${PORT}`);
});