import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

import Reading from "../models/readings.js";
import Alert from "../models/alerts.js";

let port;
let sensorData = {
  fluxo: 0,
  volume: 0,
};

// Função para salvar a leitura atual e verificar o alerta de fluxo zero
async function saveCurrentReadingAndCheckAlert() {
    const { fluxo, volume } = sensorData; // Obtém os dados atuais
    try {
        const newReading = new Reading({// Cria uma nova leitura
            flowRate: fluxo, 
            totalVolume: volume,
        });

        await newReading.save();// Salva a leitura no banco de dados
        console.log("Leitura agendada salva no banco de dados:", newReading);

        // Lógica de alerta de fluxo zero
        if (fluxo == 0) {
            const newAlert = new Alert({
                alertType: "Fluxo Zero",
                message: "O fluxo de água está zerado.",
                value: fluxo,
            });
            await newAlert.save();
            console.log("Alerta de fluxo zero salvo no banco de dados:", newAlert);
        } 

    } catch (error) {
        console.error("Erro ao salvar leitura agendada no banco de dados:", error);
    }
}

// Função para agendar o salvamento a cada 30 minutos (1800000 ms)
function scheduleReadingSave() {
    // Salva a primeira leitura imediatamente (Comentado para evitar timeout na inicialização)
    // saveCurrentReadingAndCheckAlert(); 
    
    // Agenda o salvamento a cada 30 minutos
    setInterval(saveCurrentReadingAndCheckAlert, 1800000); 
    console.log("Agendamento de salvamento de leitura a cada 30 minutos iniciado.");
}


function initSerialService(io, serialConfig) {
    try {
        port = new SerialPort({
            // Configura a porta serial
            path: serialConfig.path,
            baudRate: serialConfig.baudRate,
        });

        //Configura o parser para ler linhas terminadas em '\r\n'
        const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

        port.on("open", () => {
            //Eventos da porta serial
            console.log("Porta serial aberta com sucesso em COM5@9600");
        });

        //Evento de dados recebidos
        parser.on("data", (data) => {
            const dataTrimmed = data.toString().trim(); // Garante string e remove extras
            console.log("=== DADOS RECEBIDOS (RAW):", JSON.stringify(dataTrimmed)); // Log raw com aspas para ver chars hidden

            let updated = false;

            // Parsing flexível para FLUXO com regex (captura variações)
            const fluxoMatch = dataTrimmed.match(/fluxo\s*(de\s*)?:?\s*([\d.,]+)/i);
            if (fluxoMatch) {
            const rawValue = fluxoMatch[2];
            const parsedValue = parseFloat(rawValue.replace(",", ".")); // Trata vírgula como decimal se necessário
            console.log(
                "  -> Tentando parsear FLUXO. Raw extraído:",
                rawValue,
                "| Parsed:",
                parsedValue
            );
            if (!isNaN(parsedValue)) {
                sensorData.fluxo = parsedValue;
                updated = true;
                console.log("  -> FLUXO ATUALIZADO para:", sensorData.fluxo);
            } else {
                console.log(
                "  -> ERRO: Valor FLUXO não é numérico após parse:",
                rawValue
                );
            }
            }

            // Parsing flexível para VOLUME com regex
            const volumeMatch = dataTrimmed.match(/volume\s*(de\s*)?:?\s*([\d.,]+)/i);
            if (volumeMatch) {
            const rawValue = volumeMatch[2];
            const parsedValue = parseFloat(rawValue.replace(",", ".")); // Trata vírgula
            console.log(
                "  -> Tentando parsear VOLUME. Raw extraído:",
                rawValue,
                "| Parsed:",
                parsedValue
            );
            if (!isNaN(parsedValue)) {
                sensorData.volume = parsedValue;
                updated = true;
                console.log("  -> VOLUME ATUALIZADO para:", sensorData.volume);
            } else {
                console.log(
                "  -> ERRO: Valor VOLUME não é numérico após parse:",
                rawValue
                );
            }
            }

            if (!updated) {
            console.log(
                "  -> NENHUMA ATUALIZAÇÃO: Linha não matcha fluxo/volume. Tente ajustar regex se necessário."
            );
            }

            // Sempre emite os dados atuais
            console.log("Emitindo via Socket.IO:", sensorData);
            io.emit("sensorData", sensorData);
        });

        // Evento de erro
        port.on("error", (err) => {
            console.log("Erro na porta serial:", err.message);
        });
        
    } catch (error) {
        // Captura erros na inicialização da porta serial
        console.log("Erro ao inicializar porta serial:", error.message);
        if (port) port.close();
    }

    // Configuração do Socket.IO
    io.on("connection", (socket) => {
        // Evento de nova conexão
        console.log("Cliente conectado:", socket.id);

        // Envia dados iniciais ao conectar
        socket.emit("sensorData", sensorData);

        socket.on("disconnect", () => {
            // Evento de desconexão
            console.log("Cliente desconectado:", socket.id);
        });
    });

    //Função para acessar dados atuais (se necessário)
    return {
        getSensorData: () => sensorData,
    };
}

export default { initSerialService, scheduleReadingSave };
