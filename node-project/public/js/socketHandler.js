// Função para inicializar a conexão WebSocket e configurar os ouvintes de eventos
export function initSocket(onSensorData) {
    const socket = io();

    socket.on('connect', () => {
        console.log('Conectado ao servidor');
        onSensorData.connection(true);
    });

    socket.on('disconnect', () => {
        console.log('Desconectado do servidor');
        onSensorData.connection(false);
    });

    socket.on('connect_error', (error) => {
        console.error('Erro na conexão:', error);
        onSensorData.log('Erro na conexão: ' + error.message);
    });

    socket.on('sensorData', (data) => {
        console.log('Dados recebidos:', data);
        onSensorData.update(data);
    });

    socket.on('alert', (alert) => {
        addLogEntry(`ALERTA: ${alert.message}`);
    });

    return socket;
}