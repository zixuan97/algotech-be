const puppeteer = require('puppeteer');

const generatePdfTemplate = async (html = '') => {
  const { data: browser, error: puppeteerError } = await common.awaitWrap(
    puppeteer.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox'
      ]
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
