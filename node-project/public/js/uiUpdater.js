// Elementos da interface
const fluxoValueElement = document.getElementById('fluxoValue');
const volumeValueElement = document.getElementById('volumeValue');
const statusIndicator = document.getElementById('statusIndicator');
const connectionStatus = document.getElementById('connectionStatus');
const serialPortStatus = document.getElementById('serialPortStatus');
const dataLog = document.getElementById('dataLog');


export function updateSensorValues(fluxo, volume) {
    fluxoValueElement.textContent = (fluxo || 0).toFixed(2);
    volumeValueElement.textContent = (volume || 0).toFixed(2);
}

export function updateConnectionStatus(connected) {
    if (connected) {
        statusIndicator.className = 'status-indicator status-connected';
        connectionStatus.textContent = 'Conectado';
    } else {
        statusIndicator.className = 'status-indicator status-disconnected';
        connectionStatus.textContent = 'Desconectado';
    }
}

export function updateSerialStatus() {
    serialPortStatus.innerHTML = `
        <small class="text-success">
            Dados sendo recebidos da porta serial COM5 (9600 baud)
        </small>
    `;
}

export function addLogEntry(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('p');
    logEntry.className = 'mb-1';
    logEntry.textContent = `[${timestamp}] ${message}`;

    if (dataLog.firstChild && dataLog.firstChild.textContent.includes('Nenhum dado')) {
        dataLog.innerHTML = '';
    }

    dataLog.prepend(logEntry);

    if (dataLog.children.length > 10) {
        dataLog.removeChild(dataLog.lastChild);
    }
}