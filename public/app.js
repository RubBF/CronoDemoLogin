document.addEventListener('DOMContentLoaded', () => {
  const btnRunTests = document.getElementById('btnRunTests');
  const connectionsNumber = document.getElementById('connectionsNumber');
  const lastExecution = document.getElementById('lastExecution');
  const successBar = document.getElementById('successBar');
  const failBar = document.getElementById('failBar');
  const reportFrame = document.getElementById('reportFrame');

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

            reportFrame.src = `/allure-report/index.html?${Date.now()}`;

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
