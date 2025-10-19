const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [''],
      datasets: [{
        label: 'Fluxo de Água (L/min)',
        data: [ 0 ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100
        },
        x: {
          beginAtZero: true
        }
      }
    }
  });
