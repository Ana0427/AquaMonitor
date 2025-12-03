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
let allAlerts = []; // Armazena todos os alertas para filtrar
let currentFilter = 'todos'; // Filtro ativo


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

        const acaoCell = row.insertCell();
        acaoCell.innerHTML = `
            <button class="btn-action btn-delete" data-id="${reading._id}" title="Deletar">
                <i class="bi bi-trash"></i>
            </button>
        `;
        acaoCell.querySelector('.btn-delete').addEventListener('click', () => deleteReading(reading._id));
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

//Deleta uma leitura do histórico
async function deleteReading(readingId) {
    if (!confirm('Tem certeza que deseja deletar esta leitura?')) return;

    try {
        const response = await fetch(`/api/readings/${readingId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('✅ Leitura deletada');
            fetchAndRenderHistory();
        } else {
            alert('Erro ao deletar leitura');
        }
    } catch (error) {
        console.error('❌ Erro ao deletar leitura:', error);
    }
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


// Função para buscar e renderizar o histórico de alertas
async function fetchAndRenderAlerts() {
    try {
        const response = await fetch('/api/alerts/history');
        const data = await response.json();
        
        console.log('Histórico de alertas:', data);

        allAlerts = Array.isArray(data) ? data : (data.data || []);
        applyAlertsFilters(); // Armazena para filtros

    } catch (error) {
        console.error('Erro ao buscar e renderizar histórico de alertas:', error);
    }
}

// Renderiza a tabela de alertas
function renderAlertsTable(alerts) {
    const tableBody = document.querySelector('#alertsTable tbody');
    
    if (!tableBody) {
        console.error('❌ Elemento tbody não encontrado!');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (alerts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty">Nenhum alerta encontrado</td></tr>';
        return;
    }
    
    alerts.forEach(alert => {
        const row = tableBody.insertRow();
        const date = new Date(alert.timestamp).toLocaleString('pt-BR');
        
        row.insertCell().textContent = date;
        row.insertCell().textContent = alert.alertType;
        row.insertCell().textContent = alert.message;
        row.insertCell().textContent = alert.value !== undefined ? alert.value.toFixed(2) : '-';
        row.insertCell().textContent = alert.isResolved ? 'Resolvido' : 'Pendente';

        const acaoCell = row.insertCell();
        if (alert.isResolved) {
            acaoCell.innerHTML = `
                <button class="btn-action btn-pending" data-id="${alert._id}" title="Marcar como Pendente">
                    <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <button class="btn-action btn-delete" data-id="${alert._id}" title="Deletar">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            acaoCell.querySelector('.btn-pending').addEventListener('click', () => markAsPendingAlert(alert._id));
        } else {
            acaoCell.innerHTML = `
                <button class="btn-action btn-resolver" data-id="${alert._id}" title="Resolver">
                    <i class="bi bi-check-circle"></i>
                </button>
                <button class="btn-action btn-delete" data-id="${alert._id}" title="Deletar">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            acaoCell.querySelector('.btn-resolver').addEventListener('click', () => resolveAlert(alert._id));
        }

        acaoCell.querySelector('.btn-delete').addEventListener('click', () => deleteAlert(alert._id));
    });
}

// Aplica filtros de alertas
function applyAlertsFilters() {
    const filterFrom = document.getElementById('filterFrom').value;
    const filterTo = document.getElementById('filterTo').value;
    const filterMinFlux = parseFloat(document.getElementById('filterMinFlux').value) || 0;
    const filterMaxFlux = parseFloat(document.getElementById('filterMaxFlux').value) || 999999;

    let filtered = allAlerts.filter(alert => {
        const alertDate = new Date(alert.timestamp);
        const fromDate = filterFrom ? new Date(filterFrom) : new Date(0);
        const toDate = filterTo ? new Date(filterTo) : new Date(9999, 0, 1);

        return alertDate >= fromDate && 
               alertDate <= toDate && 
               (alert.value || 0) >= filterMinFlux && 
               (alert.value || 0) <= filterMaxFlux;
    });

    // Aplica filtro de status
    if (currentFilter === 'pendentes') {
        filtered = filtered.filter(a => !a.isResolved);
    } else if (currentFilter === 'resolvidos') {
        filtered = filtered.filter(a => a.isResolved);
    }

    renderAlertsTable(filtered);
}

// Limpa filtros de data/fluxo
function clearAlertsFilters() {
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    document.getElementById('filterMinFlux').value = '';
    document.getElementById('filterMaxFlux').value = '';
    applyAlertsFilters();
}

// Resolve um alerta
async function resolveAlert(alertId) {
    try {
        const response = await fetch(`/api/alerts/${alertId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isResolved: true })
        });

        if (response.ok) {
            console.log('Alerta resolvido');
            fetchAndRenderAlerts();
        } else {
            alert('Erro ao resolver alerta');
        }
    } catch (error) {
        console.error('Erro ao resolver alerta:', error);
    }
}

async function markAsPendingAlert(alertId) {
    try {
        const response = await fetch(`/api/alerts/${alertId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isResolved: false })
        });

        if (response.ok) {
            console.log('Alerta marcado como pendente');
            fetchAndRenderAlerts();
        } else {
            alert('Erro ao marcar alerta como pendente');
        }
    } catch (error) {
        console.error('Erro ao marcar alerta como pendente:', error);
    }
}

// Deleta um alerta
async function deleteAlert(alertId) {
    if (!confirm('Tem certeza que deseja deletar este alerta?')) return;

    try {
        const response = await fetch(`/api/alerts/${alertId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('Alerta deletado');
            fetchAndRenderAlerts();
        } else {
            alert('Erro ao deletar alerta');
        }
    } catch (error) {
        console.error('Erro ao deletar alerta:', error);
    }
}

// Marca todos os alertas como resolvidos
async function resolveAllAlerts() {
    if (!confirm('Tem certeza que deseja marcar TODOS os alertas como resolvidos?')) return;

    try {
        const response = await fetch('/api/alerts/resolve-all', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            console.log('✅ Todos os alertas foram resolvidos');
            fetchAndRenderAlerts();
        } else {
            alert('Erro ao resolver todos os alertas');
        }
    } catch (error) {
        console.error('❌ Erro ao resolver todos os alertas:', error);
    }
}

async function deleteAllAlerts() {
    if (!confirm('Tem certeza que deseja APAGAR TODOS os alertas? Esta ação não pode ser desfeita!')) return;

    try {
        const response = await fetch('/api/alerts/delete-all', {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('Todos os alertas foram apagados');
            fetchAndRenderAlerts();
        } else {
            alert('Erro ao apagar todos os alertas');
        }
    } catch (error) {
        console.error('Erro ao apagar todos os alertas:', error);
    }
}

// Liga os event listeners dos filtros
document.addEventListener('DOMContentLoaded', () => {
    // Filtros de data/fluxo
    document.getElementById('btnApplyFilters')?.addEventListener('click', applyAlertsFilters);
    document.getElementById('btnClearFilters')?.addEventListener('click', clearAlertsFilters);
    
    // Filtros de status (Todos, Pendentes, Resolvidos)
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            
            const filterText = e.target.textContent.trim().toLowerCase();
            if (filterText === 'todos') currentFilter = 'todos';
            else if (filterText === 'avisos' || filterText === 'pendentes') currentFilter = 'pendentes';
            else if (filterText === 'resolvidos') currentFilter = 'resolvidos';
            
            applyAlertsFilters();
        });
    });
    
    // Botão marcar todos como resolvidos
    document.querySelector('.btn-secondary')?.addEventListener('click', resolveAllAlerts);

     document.querySelector('.btn-delete-all')?.addEventListener('click', deleteAllAlerts);
    
    // Carrega alertas ao iniciar
    fetchAndRenderAlerts();
});

// Inicializa o gráfico (só se já estiver conectado ou quando conectar)
let chartInitialized = false;
function ensureChart() {
    if (!chartInitialized) {
        initChart();
        chartInitialized = true;
    }
}