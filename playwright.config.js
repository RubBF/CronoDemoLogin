const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  reporter: [
    ['allure-playwright', {
      detail: true,
      outputFolder: './allure-results',
      suiteTitle: false,
    }],
    ['html', { open: 'never' }]
  ],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  testDir: './tests',
  outputDir: './test-results',
});