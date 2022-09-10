const common = require('@kelchy/common');
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  // running on the Vercel platform.
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  // running locally.
  puppeteer = require('puppeteer');
}

const generatePdfTemplate = async (html = '') => {
  const { data: browser, error: puppeteerError } = await common.awaitWrap(
    puppeteer.launch({
      args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true
    })
  );

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
