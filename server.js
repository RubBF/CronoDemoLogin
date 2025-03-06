const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Endpoint para ejecutar pruebas concurrentes y generar reporte Allure
app.post("/api/run-tests", (req, res) => {
  const { connections } = req.body;

  console.log(`🔄 Ejecutando ${connections} conexiones concurrentes.`);

  exec(`export CONNECTIONS=${connections} && npx playwright test`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error ejecutando pruebas:", error);
      return res.status(500).json({ message: "Error ejecutando pruebas", error: stderr });
    }

    exec("npx allure generate allure-results --clean -o public/allure-report", (error) => {
      if (error) {
        console.error("❌ Error generando reporte Allure:", error);
        return res.status(500).json({ message: "Error generando reporte Allure", error });
      }

      console.log("✅ Reporte generado correctamente.");
      res.json({ message: "Pruebas ejecutadas correctamente y reporte listo." });
    });
  });
});

// Ejecutar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Reporte Allure disponible en http://localhost:${PORT}/allure-report`);
});
