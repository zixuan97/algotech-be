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

const generateProcurementPdfTemplate = async (req) => {
  const { orderFormatted, warehouseAddress, procOrderItems, supplierName } =
    req;

  // Create a document
  const doc = new PDFDocument({ bufferPages: true });
  const path = process.cwd() + '/logo.png';
  // Add an image, constrain it to a given size, and center it vertically and horizontally
  //logo
  doc.image(
    path,
    450,
    25,
    { fit: [120, 120] },
    { width: 300, linebreak: true, lineGap: 50 }
  );

  //company name
  doc.fontSize(22).text('The Savoury Nosh Pte Ltd', {
    align: 'left'
  });

  const leftAlign = 73;
  //company details
  doc
    .fontSize(8)
    .text('czy199162@gmail.com', leftAlign, 110, { align: 'left' });
  doc.fontSize(8).text('www.thekettlegourmet.com', { align: 'left' });

  //vendor information
  doc.fill('black').fontSize(18).text('Purchase Order', leftAlign, 180);
  doc.fill('grey').fontSize(10).text('SUPPLIER', leftAlign, 210);
  doc
    .fill('grey')
    .fontSize(10)
    .text('SHIP TO', leftAlign + 200, 210);
  // doc
  //   .fill('grey')
  //   .fontSize(10)
  //   .text('P.O.', leftAlign + 390, 210);
  doc
    .fill('grey')
    .fontSize(10)
    .text('DATE', leftAlign + 390, 210);
  doc.fill('black').fontSize(8).text(supplierName, leftAlign, 225);
  doc
    .fill('black')
    .fontSize(8)
    .text(warehouseAddress, leftAlign + 200, 225, { width: 120 });
  // doc
  //   .fill('black')
  //   .fontSize(8)
  //   .text(id, leftAlign + 420, 211);
  doc
    .fill('black')
    .fontSize(8)
    .text(orderFormatted, leftAlign + 390, 225);

  //PO information
  doc.fill('black').fontSize(10).text('PRODUCT/SERVICE', leftAlign, 280);
  doc
    .fill('black')
    .fontSize(10)
    .text('QTY', leftAlign + 300, 280);
  doc
    .fill('black')
    .fontSize(10)
    .text('RATE', leftAlign + 350, 280);
  doc
    .fill('black')
    .fontSize(10)
    .text('AMOUNT', leftAlign + 420, 280);
  //no highlight
  doc
    .rect(leftAlign - 4, 275, leftAlign + 401, 18)
    .fillOpacity(0.4)
    .fillAndStroke('grey', '#CDC4C2');

  doc.fillOpacity(1);

  var poList = [];

  procOrderItems.map((p) => {
    const totalAmount = p.quantity * p.rate;
    poList.push({
      name: p.productName,
      quantity: p.quantity,
      rate: p.rate,
      amount: totalAmount
    });
  });

  //table
  const tableTop = 280;
  let currentPosY = tableTop;
  let totalCost = 0;
  for (let i = 0; i < poList.length; i++) {
    const name = poList[i].name;
    const quantity = poList[i].quantity;
    const rate = poList[i].rate;
    const amount = poList[i].amount;
    currentPosY = tableTop + 15 + i * 12;
    totalCost = totalCost + amount;
    doc.text(name, leftAlign, currentPosY);
    doc.text(quantity, leftAlign + 300, currentPosY);
    doc.text(rate, leftAlign + 350, currentPosY);
    doc.text(amount, leftAlign + 420, currentPosY);
  }

  doc
    .moveTo(leftAlign - 50, currentPosY + 30) // set the current point
    .lineTo(leftAlign + 1000, currentPosY + 30)
    .dash(5, { space: 2 })
    .stroke();

  const topAlign = currentPosY + 30;

  //prices
  doc
    .fill('grey')
    .fontSize(8)
    .text(
      'Prices stated are in Malaysian Ringgit (MYR)',
      leftAlign,
      topAlign + 20
    );
  doc
    .fill('grey')
    .fontSize(8)
    .text('Inclusive of SST', leftAlign, topAlign + 30, { width: 90 });
  doc
    .fill('grey')
    .fontSize(9)
    .text('SUBTOTAL', leftAlign + 300, topAlign + 20, { width: 90 });
  doc
    .fill('grey')
    .fontSize(9)
    .text(totalCost, leftAlign + 420, topAlign + 20, { width: 90 });
  doc
    .fill('grey')
    .fontSize(9)
    .text('TOTAL', leftAlign + 300, topAlign + 30, { width: 90 });
  doc
    .fill('grey')
    .fontSize(9)
    .text(totalCost, leftAlign + 420, topAlign + 30, { width: 90 });

  //signature and date
  doc
    .fill('grey')
    .fontSize(8)
    .text('Approved By', leftAlign, topAlign + 70, { width: 90 });
  doc
    .moveTo(leftAlign + 100, topAlign + 80)
    .lineTo(leftAlign + 500, topAlign + 80)
    .dash(500, { space: 10 })
    .stroke();
  doc
    .fill('grey')
    .fontSize(8)
    .text('Date', leftAlign, topAlign + 90, { width: 90 });
  doc
    .moveTo(leftAlign + 100, topAlign + 100)
    .lineTo(leftAlign + 500, topAlign + 100)
    .dash(500, { space: 10 })
    .stroke();

  // Finalize PDF file Inclusive of SST
  doc.end();
  return await getStream.buffer(doc);
};

const generateDeliveryOrderPdfTemplate = async (req) => {
  const { id, createdAtFormatted, shippingDateFormatted, carrier, comments, deliveryMode, shippingType, salesOrder, assignedUser } = req;

  // Create a document
  const doc = new PDFDocument({ bufferPages: true });
  const path = process.cwd() + '/logo.png';
  // Add an image, constrain it to a given size, and center it vertically and horizontally
  //logo
  doc.image(
    path,
    450,
    25,
    { fit: [120, 120] },
    { width: 300, linebreak: true, lineGap: 50 }
  );

  //company name
  doc.font('Helvetica-Bold').fontSize(10).text('The Savoury Nosh Pte Ltd', {
    align: 'left',
  });

  const leftAlign = 73;
  //company details
  doc
    .font('Helvetica')
    .fontSize(8)
    .text('zac@thekettlegourmet.com', leftAlign, 90, { align: 'left' });
  doc.fontSize(8).text('www.thekettlegourmet.com', { align: 'left' });
  doc.fontSize(8).text('Company Registration No. 201906356G', { align: 'left' });

  //vendor information
  doc.fill('black').fontSize(18).text('Delivery Note', leftAlign, 160);
  doc.fill('grey').fontSize(10).text('BILL TO', leftAlign, 205);
  doc
    .fill('grey')
    .fontSize(10)
    .text('SHIP TO', leftAlign + 130, 205);
  doc
    .fill('grey')
    .fontSize(10)
    .text('SHIP DATE', leftAlign + 260, 205);
  doc
    .fill('grey')
    .fontSize(10)
    .text('SHIP VIA', leftAlign + 260, 225);
  doc
    .fill('grey')
    .fontSize(10)
    .text('INVOICE', leftAlign + 390, 205);
  doc
    .fill('grey')
    .fontSize(10)
    .text('DATE', leftAlign + 390, 225);
  doc.fill('black').fontSize(8).text(salesOrder.customerAddress, leftAlign, 225, { width: 120 });
  doc
    .fill('black')
    .fontSize(8)
    .text(`Singapore ${salesOrder.postalCode}`, leftAlign, 255);
  doc
    .fill('black')
    .fontSize(8)
    .text(salesOrder.customerAddress, leftAlign + 130, 225, { width: 120 });
  doc
    .fill('black')
    .fontSize(8)
    .text(`POC: ${salesOrder.customerName} (${salesOrder.customerContactNo})`, leftAlign + 130, 260, { width: 90 });
  doc
    .fill('black')
    .fontSize(8)
    .text(shippingDateFormatted, leftAlign + 320, 205);
  doc
    .fill('grey')
    .fontSize(10)
    .text(carrier, leftAlign + 320, 225, { width: 50 });
  doc
    .fill('black')
    .fontSize(8)
    .text(id, leftAlign + 440, 205, { width: 120 });
  doc
    .fill('black')
    .fontSize(8)
    .text(createdAtFormatted, leftAlign + 440, 225, { width: 120 });

  //DO information
  doc.fill('black').fontSize(10).text('SERVICE DATE', leftAlign, 300);
  doc
    .fill('black')
    .fontSize(10)
    .text('PRODUCT/SERVICE', leftAlign + 140, 300);
  doc
    .fill('black')
    .fontSize(10)
    .text('QTY', leftAlign + 430, 300);
  //no highlight
  doc
    .rect(leftAlign - 4, 295, leftAlign + 401, 18)
    .fillOpacity(0.4)
    .fillAndStroke('grey', '#CDC4C2');

  doc.fillOpacity(1);

  const salesOrderItems = salesOrder.salesOrderItems;
  const soList = [];

  salesOrderItems.map((s) => {
    soList.push({
      name: s.productName,
      quantity: s.quantity,
    });
  });
  
  //table
  const tableTop = 310;
  let currentPosY = tableTop;
  doc.text(createdAtFormatted, leftAlign, currentPosY + 15);
  for (let i = 0; i < soList.length; i++) {
    const name = soList[i].name;
    const quantity = soList[i].quantity;
    currentPosY = tableTop + 15 + i * 12;
    doc.text(name, leftAlign + 140, currentPosY, { width: 230 });
    doc.text(quantity, leftAlign + 430, currentPosY);
  }

  doc
    .moveTo(leftAlign - 50, currentPosY + 40) // set the current point
    .lineTo(leftAlign + 1000, currentPosY + 40)
    .dash(5, { space: 2 })
    .stroke();

  const paylahPath = process.cwd() + '/paylahQR.png';
  doc.image(
      paylahPath,
      leftAlign,
      currentPosY + 40,
      { fit: [120, 120] },
      { width: 300, linebreak: true, lineGap: 50 }
    );

  // Finalize PDF file Inclusive of SST
  doc.end();
  return await getStream.buffer(doc);
};

exports.generatePdfTemplate = generatePdfTemplate;
exports.generateProcurementPdfTemplate = generateProcurementPdfTemplate;
exports.generateDeliveryOrderPdfTemplate = generateDeliveryOrderPdfTemplate;
