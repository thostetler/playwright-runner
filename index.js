const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const logLines = [];

  const log = (msg) => {
    console.log(msg);
    logLines.push(msg);
  };

  context.on('request', request => {
    log(`\n[REQUEST] ${request.method()} ${request.url()}`);
    log(`  Headers: ${JSON.stringify(request.headers(), null, 2)}`);
  });

  context.on('response', async response => {
    const status = response.status();
    const location = response.headers()['location'];
    log(`\n[RESPONSE] ${status} ${response.url()}`);
    if (location) {
      log(`  → Redirect Location: ${location}`);
    }
  });

  try {
    await page.goto('https://qa.adsabs.harvard.edu/abs/1895ApJ.....1...29R/abstract');
    const linkSelector = 'a.resources__content__link.unlock[href*="ADS_SCAN"]';
    await page.waitForSelector(linkSelector);


    //await page.$eval(linkSelector, el => el.removeAttribute('rel'));

    await page.click(linkSelector);
    await page.waitForTimeout(3000);
    log('\n✅ Finished following the link.');

    // Write to log file
    fs.writeFileSync('/app/output/log.txt', logLines.join('\n'), 'utf-8');
  } catch (err) {
    log(`❌ Error: ${err.message}`);
    fs.writeFileSync('/app/output/error.txt', logLines.join('\n'), 'utf-8');
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
