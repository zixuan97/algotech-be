// const chromium = require('chrome-aws-lambda');
// const common = require('@kelchy/common');
// const { puppeteer } = require('chrome-aws-lambda');
const getStream = require('get-stream');
const PDFDocument = require('pdfkit');

// const generatePdfTemplate = async (html = '') => {
//   const { data: browser, error: puppeteerError } = await common.awaitWrap(
//     chromium.puppeteer.launch({
//       args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
//       defaultViewport: chromium.defaultViewport,
//       executablePath: await chromium.executablePath,
//       headless: true,
//       ignoreHTTPSErrors: true
//     })
//   );

//   if (puppeteerError) {
//     console.log(puppeteer);
//     throw new Error('Error launching puppeteer');
//   }
//   try {
//     const { data: page, error: newPageError } = await common.awaitWrap(
//       browser.newPage()
//     );
//     if (newPageError) {
//       throw new Error('Error opening new page');
//     }
//     const { error: setContentError } = await common.awaitWrap(
//       page.setContent(html)
//     );
//     if (setContentError) {
//       throw new Error('Error setting content');
//     }
//     const { data: pdfBuffer, error: generatePdfError } = await common.awaitWrap(
//       page.pdf()
//     );
//     if (generatePdfError) {
//       throw new Error('Error generating pdf');
//     }
//     return pdfBuffer;
//   } finally {
//     await browser.close();
//   }
// };

const generatePdfTemplate = async () => {
  // Create a document
  const doc = new PDFDocument({ bufferPages: true });

  // Add an image, constrain it to a given size, and center it vertically and horizontally

  // Add another page
  doc.addPage().fontSize(25).text('Here is some vector graphics...', 100, 100);

  // Finalize PDF file
  doc.end();
  return await getStream.buffer(doc);
};

exports.generatePdfTemplate = generatePdfTemplate;
