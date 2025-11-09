// Variável para armazenar a instância do gráfico
let chart = null;
// Configuração inicial do gráfico
const chartConfig = {
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

    Highcharts.setOptions({
        lang: {
            months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
        }
    });

    chart = Highcharts.chart('container', chartConfig);
    return chart;
}

export function addDataPoint(fluxo) {
    if (!chart) return;

    const now = Date.now();
    const fluxoPoint = [now, fluxo || 0];
    
    chart.series[0].addPoint(fluxoPoint, true, chart.series[0].data.length > 100);
    chart.redraw();
}