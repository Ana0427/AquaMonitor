// app.js - Orquestrador
import { initChart, addDataPoint } from './charts/chartsRealTime.js';
import { updateSensorValues, updateConnectionStatus, updateSerialStatus, addLogEntry } from './uiUpdater.js';
import { initSocket } from './socketHandler.js';

// Inicializa o gráfico (só se já estiver conectado ou quando conectar)
let chartInitialized = false;
function ensureChart() {
    if (!chartInitialized) {
        initChart();
        chartInitialized = true;
    }
}

// Callback para eventos do socket
const socketCallbacks = {
    connection: (connected) => {
        updateConnectionStatus(connected);
        addLogEntry(connected ? 'Conectado ao servidor' : 'Desconectado do servidor');
        if (connected) ensureChart();
    },
    log: (message) => addLogEntry(message),
    update: (data) => {
        ensureChart();
        updateSensorValues(data.fluxo, data.volume);
        updateSerialStatus();
        addLogEntry(`Fluxo: ${(data.fluxo || 0).toFixed(2)} L/min, Volume: ${(data.volume || 0).toFixed(2)} L`);
        addDataPoint(data.fluxo, data.volume);
    }
};

// Inicia tudo
initSocket(socketCallbacks);

// Caso já esteja conectado ao carregar
document.addEventListener('DOMContentLoaded', () => {
    if (io().connected) {
        ensureChart();
    }
});