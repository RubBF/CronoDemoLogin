require('dotenv').config();
const { chromium } = require('playwright');

// Definir usuario en duro
const USERNAME = "becerra"; // Reemplaza con el usuario correcto

// Variables desde .env
const URL = process.env.URL;
const PASSWORD = process.env.PASSWORD;
const TIMEOUT = Number(process.env.TIMEOUT) || 10000;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navegar a la URL del login
  await page.goto(URL, { timeout: TIMEOUT });

  // 💡 BORRAR Y ESCRIBIR EL USUARIO MANUALMENTE
  await page.evaluate(() => {
    let userInput = document.querySelector('input#LoginUser_UserName');
    userInput.value = '';
  });
  await page.type('input#LoginUser_UserName', USERNAME, { delay: 100 });

  // 💡 BORRAR Y ESCRIBIR LA CONTRASEÑA
  await page.evaluate(() => {
    let passInput = document.querySelector('input#LoginUser_Password');
    passInput.value = '';
  });
  await page.type('input#LoginUser_Password', PASSWORD, { delay: 100 });

  // Pequeña pausa para evitar sobrescritura del sistema
  await page.waitForTimeout(1000);

  // Hacer clic en "Iniciar sesión"
  await page.click('input#LoginUser_LoginButton');

  // Esperar para verificar si el login fue exitoso
  await page.waitForTimeout(5000);

  await browser.close();
})();
