document.addEventListener('DOMContentLoaded', () => {
  const btnRunTests = document.getElementById('btnRunTests');
  const connectionsNumber = document.getElementById('connectionsNumber');
  const lastExecution = document.getElementById('lastExecution');
  const successBar = document.getElementById('successBar');
  const failBar = document.getElementById('failBar');
  const resultsDiv = document.getElementById('results');
  const responseTimesChartCanvas = document.getElementById('responseTimesChart');

  let responseTimesChart;

  btnRunTests.addEventListener('click', () => {
    const connections = parseInt(connectionsNumber.value) || 10;

    btnRunTests.disabled = true;
    btnRunTests.textContent = '⏳ Ejecutando...';

    fetch('/api/run-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connections })
    })
    .then(res => res.json())
    .then(() => {
      // Esperar un tiempo estimado para que las pruebas se completen
      setTimeout(() => {
        fetch('/api/report')
          .then(res => res.json())
          .then(report => {
            const successPercent = ((report.successfulLogins / report.totalUsers) * 100).toFixed(0);
            const failPercent = (100 - successPercent).toFixed(0);

            successBar.style.width = `${successPercent}%`;
            successBar.textContent = `${successPercent}% logrado`;
            failBar.style.width = `${failPercent}%`;
            failBar.textContent = `${failPercent}% fallido`;

            lastExecution.textContent = new Date(report.timestamp).toLocaleString();

            // Mostrar resultados individuales
            resultsDiv.innerHTML = '';
            report.results.forEach(result => {
              const resultElement = document.createElement('p');
              if (result.status === 'SUCCESS') {
                resultElement.textContent = `✅ ${result.username}: ${result.responseTime} ms`;
              } else {
                resultElement.innerHTML = `❌ ${result.username}: ${result.error} <a href="${result.screenshot}" target="_blank">Ver captura</a>`;
              }
              resultsDiv.appendChild(resultElement);
            });

            // Crear o actualizar el gráfico de tiempos de respuesta
            const responseTimes = report.results.filter(r => r.responseTime).map(r => r.responseTime);
            if (responseTimesChart) {
              responseTimesChart.data.datasets[0].data = responseTimes;
              responseTimesChart.update();
            } else {
              responseTimesChart = new Chart(responseTimesChartCanvas, {
                type: 'bar',
                data: {
                  labels: responseTimes.map((_, i) => i + 1),
                  datasets: [{
                    label: 'Tiempo de respuesta (ms)',
                    data: responseTimes,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                  }]
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }
              });
            }

            btnRunTests.disabled = false;
            btnRunTests.textContent = '▶️ Ejecutar Pruebas';
          });
      }, connections * 1000); // Ajusta según tiempo de ejecución estimado
    })
    .catch(err => {
      console.error(err);
      alert('❌ Error al ejecutar pruebas.');
      btnRunTests.disabled = false;
      btnRunTests.textContent = '▶️ Ejecutar Pruebas';
    });
  });
});