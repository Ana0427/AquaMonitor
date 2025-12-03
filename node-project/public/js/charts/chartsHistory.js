// public/js/charts/chartsHistory.js
Highcharts.setOptions({
    time: {
        useUTC: false
    }
});

export function initHistoryChart(readings) {
    // Prepara os dados para o Highcharts
    const timestamps = readings.map(r => new Date(r.timestamp).getTime()).reverse(); // Converter para timestamp local
    const flowData = readings.map(r => r.flowRate).reverse();

    Highcharts.chart('historyChartContainer', {
        credits: { enabled: false },
        chart: {
            type: 'line',
            zoomType: 'x' // Permite zoom no eixo X
        },
        title: {
            text: 'Histórico de Fluxo'
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Data e Hora'
            }
        },
        yAxis: [{ // Eixo Y para Fluxo
            title: {
                text: 'Fluxo (L/min)'
            },
            opposite: false // Lado esquerdo
        }],
        tooltip: {
            shared: true,
            crosshairs: true
        },
        series: [{
            name: 'Fluxo (L/min)',
            color: '#dd6808ff',
            data: flowData.map((y, index) => [timestamps[index], y]),
            yAxis: 0, // Usa o primeiro eixo Y
            tooltip: {
                valueSuffix: ' L/min'
            }
        }]
    });
}
