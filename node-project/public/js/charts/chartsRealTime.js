Highcharts.setOptions({
        lang: {
            months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
        },
        credit: { enabled: false }
});

// FUNÇÃO: converte Date.now() (UTC) para timestamp que representa o horário local
function getLocalTimestamp() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.getTime();
}

// Variável para armazenar a instância do gráfico
let chart = null;
// Configuração inicial do gráfico
const chartConfig = {
    credits: {
        enabled: false
    },
    chart: { 
        type: 'line',
        zoomType: 'x'
    },
    title: { // Título do gráfico 
        text: 'Evolução do Fluxo ao Longo do Tempo' 
    },
    xAxis: {
        type: 'datetime',
        title: { 
            text: 'Tempo' 
        },
        dateTimeLabelFormats: { 
            second: '%H:%M:%S',
            minute: '%H:%M',
            hour: '%H:%M'
        }
    },
    yAxis: [
        {   title: { 
                text: 'Fluxo (L/min)', 
                style: { color: '#007bff' } 
            }, 
            labels: { 
                style: { color: '#007bff' } 
            }, 
            opposite: false
        }
    ],
    tooltip: { 
        shared: true 
    },
    legend: { 
        layout: 'horizontal', 
        align: 'center',
         verticalAlign: 'bottom' 
    },
    plotOptions: { 
        series: { 
            marker: { 
                enabled: false 
            } 
        } 
    },
    series: [
        { name: 'Fluxo', yAxis: 0, color: '#007bff', data: [] },
    ]
};

export function initChart() {
    if (chart) return chart;

    chart = Highcharts.chart('container', chartConfig);
    chart.xAxis[0].setExtremes(null, null, true, true);
    return chart;
}

export function addDataPoint(fluxo) {
    if (!chart) return;

    const timestamp = getLocalTimestamp(); // ← TIMESTAMP LOCAL!
    const fluxoPoint = [timestamp, fluxo || 0];
    
    chart.series[0].addPoint(fluxoPoint, true, chart.series[0].data.length > 100, true);
}