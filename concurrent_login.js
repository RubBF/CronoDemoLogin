const fs = require("fs");
require("dotenv").config();
const { chromium } = require("playwright");

const REPORT_PATH = "./reports/login_report.json";

let connections = parseInt(process.argv[2]) || 10;

const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));

if (connections > users.length) {
  const originalLength = users.length;
  for (let i = 0; users.length < connections; i++) {
    users.push(users[i % originalLength]);
  }
}

async function loginTest(user, index) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const startTime = Date.now();

  try {
    await page.goto(process.env.URL);
    await page.fill("#LoginUser_UserName", user.username);
    await page.fill("#LoginUser_Password", user.password);
    await page.click("#LoginUser_LoginButton");
    await page.waitForSelector('h2:has-text("SANTIAGO - Versión:")');

    const responseTime = Date.now() - startTime;

    console.log(`✅ [${index+1}] Usuario ${user.username} inició sesión en ${responseTime} ms`);

    await browser.close();
    return { username: user.username, status: "SUCCESS", responseTime };
  } catch (error) {
    console.error(`❌ [${index+1}] Usuario ${user.username} falló: ${error.message}`);

    const screenshotPath = `./public/reports/error_${user.username}_${index+1}.png`;
    await page.screenshot({ path: screenshotPath });

    await browser.close();
    return { username: user.username, status: "FAILED", error: error.message, screenshot: screenshotPath };
  }
}

async function runConcurrentTests() {
  const results = await Promise.all(users.map((user, index) => loginTest(user, index)));

  const report = {
    timestamp: new Date().toISOString(),
    totalUsers: results.length,
    successfulLogins: results.filter(r => r.status === "SUCCESS").length,
    failedLogins: results.filter(r => r.status === "FAILED").length,
    responseTimes: results.filter(r => r.responseTime).map(r => r.responseTime),
    avgResponseTime: Math.round(results.filter(r => r.responseTime).reduce((a,b)=>a+b,0) / results.filter(r => r.responseTime).length),
    results
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`📊 Reporte generado: ${REPORT_PATH}`);
}

runConcurrentTests();
