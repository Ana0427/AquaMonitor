// app.js - Orquestrador
import { initChart, addDataPoint } from './charts/chartsRealTime.js';
import { initHistoryChart } from './charts/chartsHistory.js';
import { updateSensorValues, updateConnectionStatus, updateSerialStatus, addLogEntry, updateAlertCard } from './uiUpdater.js';
import { initSocket } from './socketHandler.js';


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
        updateAlertCard(data.fluxo);
        updateSerialStatus();
        addLogEntry(`Fluxo: ${(data.fluxo || 0).toFixed(2)} L/min, Volume: ${(data.volume || 0).toFixed(2)} L`);
        addDataPoint(data.fluxo, data.volume);
    }
};

// Função para buscar e renderizar o histórico de dados
let allReadings = []; // Armazena todas as leituras para filtrar

// Função para buscar e renderizar o histórico de dados
async function fetchAndRenderHistory() {
    try {
        const response = await fetch('/api/readings/history');
        const data = await response.json();
        allReadings = data; // Armazena para filtros
        renderHistoryTable(data);
        initHistoryChart(data);
    } catch (error) {
        console.error('Erro ao buscar e renderizar histórico:', error);
    }
}

// Renderiza a tabela com botão delete
function renderHistoryTable(readings) {
    const tableBody = document.querySelector('#historyTable tbody');
    tableBody.innerHTML = '';
    
    if (readings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="empty">Nenhuma leitura encontrada</td></tr>';
        return;
    }
    
    readings.forEach(reading => {
        const row = tableBody.insertRow();
        const date = new Date(reading.timestamp).toLocaleString('pt-BR');
        
        row.insertCell().textContent = date;
        row.insertCell().textContent = reading.flowRate.toFixed(2);
        row.insertCell().textContent = reading.totalVolume.toFixed(2);
    });
}

// Função para aplicar filtros
function applyFilters() {
    const filterFrom = document.getElementById('filterFrom').value;
    const filterTo = document.getElementById('filterTo').value;
    const filterMinFlux = parseFloat(document.getElementById('filterMinFlux').value) || 0;
    const filterMaxFlux = parseFloat(document.getElementById('filterMaxFlux').value) || 999999;

    const filtered = allReadings.filter(reading => {
        const readingDate = new Date(reading.timestamp);
        const fromDate = filterFrom ? new Date(filterFrom) : new Date(0);
        const toDate = filterTo ? new Date(filterTo) : new Date(9999, 0, 1);

        return readingDate >= fromDate && 
               readingDate <= toDate && 
               reading.flowRate >= filterMinFlux && 
               reading.flowRate <= filterMaxFlux;
    });

    renderHistoryTable(filtered);
}

// Função para limpar filtros
function clearFilters() {
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    document.getElementById('filterMinFlux').value = '';
    document.getElementById('filterMaxFlux').value = '';
}

// Liga botões de filtro
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnApplyFilters').addEventListener('click', applyFilters);
    document.getElementById('btnClearFilters').addEventListener('click', () => {
        clearFilters();
        renderHistoryTable(allReadings);
    });
});

// Inicia tudo
initSocket(socketCallbacks);

// Caso já esteja conectado ao carregar
document.addEventListener('DOMContentLoaded', () => {
    if (io().connected) {
        ensureChart();
    }
    // Carrega o histórico de dados ao carregar a página
    fetchAndRenderHistory();
    // Carrega o histórico de alertas ao carregar a página
    fetchAndRenderAlerts();
});


/* // Função para buscar e renderizar o histórico de alertas
async function fetchAndRenderAlerts() {
    try {
        const response = await fetch('/api/alerts/history');
        const data = await response.json();
        
        // Renderiza a tabela
        const tableBody = document.querySelector('#alertsTable tbody');
        tableBody.innerHTML = ''; // Limpa o conteúdo anterior
        
        data.forEach(alert => {
            const row = tableBody.insertRow();
            const date = new Date(alert.timestamp).toLocaleString('pt-BR');
            row.insertCell().textContent = date;
            row.insertCell().textContent = alert.alertType;
            row.insertCell().textContent = alert.message;
            row.insertCell().textContent = alert.value !== undefined ? alert.value.toFixed(2) : '-';
        });

    } catch (error) {
        console.error('Erro ao buscar e renderizar histórico de alertas:', error);
    }
} */

// Inicializa o gráfico (só se já estiver conectado ou quando conectar)
let chartInitialized = false;
function ensureChart() {
    if (!chartInitialized) {
        initChart();
        chartInitialized = true;
    }
}