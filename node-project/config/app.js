module.exports = {
    // Porta do servidor
    port: process.env.PORT || 3000,

    // Configurações da porta serial
    serial: {
        path: 'COM8',
        baudRate: 9600,
    }
};