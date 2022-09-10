const common = require('@kelchy/common');
const chromium = require('chrome-aws-lambda');
const playwright = require('playwright-core');

const generatePdfTemplate = async (html = '') => {
  const browser = await playwright.chromium.launch({
    args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true
  });

  if (puppeteerError) {
    throw new Error('Error launching puppeteer');
  }
  try {
    const { data: page, error: newPageError } = await common.awaitWrap(
      browser.newPage()
    );
    if (newPageError) {
      throw new Error('Error opening new page');
    }
    const { error: setContentError } = await common.awaitWrap(
      page.setContent(html)
    );
    if (setContentError) {
      throw new Error('Error setting content');
    }
    const { data: pdfBuffer, error: generatePdfError } = await common.awaitWrap(
      page.pdf()
    );
    if (generatePdfError) {
      throw new Error('Error generating pdf');
    }
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

exports.generatePdfTemplate = generatePdfTemplate;
