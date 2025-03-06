const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const REPORT_PATH = "./reports/login_report.json";
const ALLURE_REPORT_PATH = "./allure-report";

// Servir archivos estáticos desde la carpeta public
app.use(express.static("public"));

// Servir reportes Allure generados
app.use("/allure-report", express.static(path.join(__dirname, "allure-report")));

// Ruta para obtener el último reporte JSON
app.get("/api/report", (req, res) => {
  if (fs.existsSync(REPORT_PATH)) {
    const report = fs.readFileSync(REPORT_PATH, "utf-8");
    res.json(JSON.parse(report));
  } else {
    res.status(404).json({ message: "No hay reportes disponibles. Ejecuta las pruebas primero." });
  }
});

// Ruta para ejecutar las pruebas desde el frontend
app.post("/api/run-tests", (req, res) => {
  const { connections } = req.body;

  exec(`set CONNECTIONS=${connections}&& npx playwright test`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error ejecutando pruebas:", error);
      return res.status(500).json({ message: "Error ejecutando pruebas", error });
    }

    exec("npx allure generate ./allure-results --clean -o public/allure-report", (error) => {
      if (error) {
        console.error("❌ Error generando reporte Allure:", error);
        return res.status(500).json({ message: "Error generando reporte Allure", error });
      }

      console.log("✅ Reporte generado correctamente.");
      res.json({ message: "Pruebas ejecutadas correctamente." });
    });
  });
});




// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Reportes Allure disponibles en http://localhost:${PORT}/allure-report`);
});