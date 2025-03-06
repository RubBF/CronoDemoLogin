const { test, expect } = require('@playwright/test');
const usuarios = require('../users.json');
require('dotenv').config();

const conexiones = parseInt(process.env.CONNECTIONS || usuarios.length);
const usuariosConcurrentes = [];

for(let i = 0; i < conexiones; i++){
  usuariosConcurrentes.push(usuarios[i % usuarios.length]);
}

usuariosConcurrentes.forEach((usuario, index) => {
  test(`Login concurrente usuario [${index+1}]: ${usuario.username}`, async ({ page }) => {
    await page.goto(process.env.URL);
    await page.fill('#LoginUser_UserName', usuario.username);
    await page.fill('#LoginUser_Password', usuario.password);
    await page.click('#LoginUser_LoginButton');

    await expect(page.locator('h2:has-text("SANTIAGO - Versión:")')).toBeVisible();
  });
});
