// Elementos da interface
const fluxoValueElement = document.getElementById('fluxoValue');
const volumeValueElement = document.getElementById('volumeValue');
const statusIndicator = document.getElementById('statusIndicator');
const alertaVisualCard = document.getElementById('alertaVisualCard');
const alertaStatusText = document.getElementById('alertaStatusText');
const connectionStatus = document.getElementById('connectionStatus');
const serialPortStatus = document.getElementById('serialPortStatus');
const dataLog = document.getElementById('dataLog');

let alertActive = false;

export function updateSensorValues(fluxo, volume) {
    fluxoValueElement.textContent = (fluxo || 0).toFixed(2);
    volumeValueElement.textContent = (volume || 0).toFixed(2);
}

function sendNotification() {
    if (!("Notification" in window)) {
        addLogEntry('Notificações não suportadas neste navegador.');
        return;
    }
    if (Notification.permission !== 'granted') {
        addLogEntry('Notificação não enviada: permissão não concedida.');
        return;
    }

    const title = 'ALERTA: Fluxo Zero';
    const body = 'Fluxo detectado como 0. Verifique o sistema.';
    const options = {
        body,
        // coloque um caminho válido para ícone se desejar
        // icon: '/img/favico.png'
    };

    try {
        const n = new Notification(title, options);
        addLogEntry('Notificação enviada: Fluxo Zero');
        // opcional: foco na janela ao clicar
        n.onclick = () => window.focus();
    } catch (err) {
        addLogEntry('Erro ao criar notificação: ' + err.message);
    }
}

export function updateAlertCard(fluxo) {
    const card = alertaVisualCard.querySelector('.card');
    const icon = alertaVisualCard.querySelector('i');

    if (fluxo == 0) {
        // Alerta de Fluxo Zero
        card.className = 'card card-alerta-zero';
        card.querySelector('.card-header').className = 'card-header bg-danger text-white';
        icon.className = 'bi bi-exclamation-triangle-fill';
        icon.style.color = 'red';
        alertaStatusText.textContent = 'ALERTA: Fluxo Zero!';

        // envia notificação apenas se ainda não estiver ativa
        if(!alertActive){
            sendNotification();
            alertActive = true;
        }
    } else {
        // Fluxo Normal
        card.className = 'card card-alerta-normal';
        card.querySelector('.card-header').className = 'card-header bg-success text-white';
        icon.className = 'bi bi-check-circle-fill';
        icon.style.color = 'green';
        alertaStatusText.textContent = 'Fluxo Normal';

        // reset do estado de alerta
        alertActive = false;
    }
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

// solicita permissão de notificações ao carregar o script (se ainda não decidido)
if ("Notification" in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        addLogEntry('Permissão de notificações: ' + permission);
    }).catch(err => {
        addLogEntry('Erro ao solicitar permissão de notificações: ' + err?.message);
    });
}