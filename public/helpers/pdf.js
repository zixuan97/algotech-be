const getStream = require('get-stream');
const PDFDocument = require('pdfkit');

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
