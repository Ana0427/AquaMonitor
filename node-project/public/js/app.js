// Conectar ao servidor Socket.IO
const socket = io();

// Elementos da interface
const fluxoValueElement = document.getElementById('fluxoValue');
const volumeValueElement = document.getElementById('volumeValue');
const statusIndicator = document.getElementById('statusIndicator');
const connectionStatus = document.getElementById('connectionStatus');
const serialPortStatus = document.getElementById('serialPortStatus');
const dataLog = document.getElementById('dataLog');

// NOVA: Configuração do Gráfico Highcharts
let chart; // Referência global para o chart
Highcharts.setOptions({
    lang: {
        months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    }
});
function createChart() {
    chart = Highcharts.chart('container', {
        chart: {
            type: 'line',
            zoomType: 'x' // Permite zoom no eixo X (tempo)
        },
        title: {
            text: 'Evolução do Fluxo e Volume ao Longo do Tempo'
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Tempo'
            },
            dateTimeLabelFormats: {
                minute: '%H:%M',
                hour: '%H:%M'
            }
        },
        yAxis: [{ // Eixo Y esquerdo para Fluxo
            title: {
                text: 'Fluxo (L/min)',
                style: { color: '#007bff' }
            },
            labels: { style: { color: '#007bff' } },
            opposite: false
        }, { // Eixo Y direito para Volume
            title: {
                text: 'Volume (L)',
                style: { color: '#28a745' }
            },
            labels: { style: { color: '#28a745' } },
            opposite: true
        }],
        tooltip: {
            shared: true // Tooltip mostra ambos valores no ponto
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false // Remove marcadores para linha limpa
                }
            }
        },
        series: [{
            name: 'Fluxo',
            yAxis: 0, // Eixo esquerdo
            color: '#007bff',
            data: [] // Pontos iniciais vazios
        }, {
            name: 'Volume',
            yAxis: 1, // Eixo direito
            color: '#28a745',
            data: [] // Pontos iniciais vazios
        }]
    });
}

// Função para atualizar o status da conexão
function updateConnectionStatus(connected) {
    if (connected) {
        statusIndicator.className = 'status-indicator status-connected';
        connectionStatus.textContent = 'Conectado';
    } else {
        statusIndicator.className = 'status-indicator status-disconnected';
        connectionStatus.textContent = 'Desconectado';
    }
}

// Função para adicionar entrada no log
function addLogEntry(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('p');
    logEntry.className = 'mb-1';
    logEntry.textContent = `[${timestamp}] ${message}`;
    
    // Se não há dados ainda, removemos a mensagem padrão
    if (dataLog.firstChild && dataLog.firstChild.textContent.includes('Nenhum dado')) {
        dataLog.innerHTML = '';
    }
    
    dataLog.prepend(logEntry);
    
    // Limita o número de entradas no log
    if (dataLog.children.length > 10) {
        dataLog.removeChild(dataLog.lastChild);
    }
}

// Eventos do Socket.IO
socket.on('connect', () => {
    console.log('Conectado ao servidor');
    updateConnectionStatus(true);
    addLogEntry('Conectado ao servidor');
    // NOVA: Inicializa o gráfico após conectar
    if (!chart) createChart();
});

socket.on('disconnect', () => {
    console.log('Desconectado do servidor');
    updateConnectionStatus(false);
    addLogEntry('Desconectado do servidor');
});

socket.on('connect_error', (error) => {
    console.error('Erro na conexão Socket.IO:', error);
    addLogEntry('Erro na conexão: ' + error.message);
});

socket.on('sensorData', (data) => {
    console.log('Dados recebidos via Socket.IO:', data);
    
    // Atualiza os valores na interface (com fallback se NaN)
    fluxoValueElement.textContent = (data.fluxo || 0).toFixed(2);
    volumeValueElement.textContent = (data.volume || 0).toFixed(2);
    
    // Atualiza o status da porta serial
    serialPortStatus.innerHTML = `
        <small class="text-success">
            Dados sendo recebidos da porta serial COM5 (9600 baud)
        </small>
    `;
    
    // Adiciona entrada no log
    addLogEntry(`Fluxo: ${(data.fluxo || 0).toFixed(2)} L/min, Volume: ${(data.volume || 0).toFixed(2)} L`);

    // NOVA: Adiciona pontos ao gráfico em tempo real
    if (chart) {
        const now = Date.now(); // Timestamp atual em ms
        const fluxoPoint = [now, data.fluxo || 0];
        const volumePoint = [now, data.volume || 0];

        // Adiciona ponto à série de Fluxo (shift=true remove o mais antigo se > 100 pontos)
        chart.series[0].addPoint(fluxoPoint, true, chart.series[0].data.length > 100);

        // Adiciona ponto à série de Volume
        chart.series[1].addPoint(volumePoint, true, chart.series[1].data.length > 100);

        // Redesenha o gráfico (true = animate)
        chart.redraw();
    }
});

// NOVA: Inicializa o gráfico na carga da página (caso já conectado)
document.addEventListener('DOMContentLoaded', () => {
    if (socket.connected) {
        createChart();
    }
});