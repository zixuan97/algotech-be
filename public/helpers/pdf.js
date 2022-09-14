const getStream = require('get-stream');
const PDFDocument = require('pdfkit');
const supplierModel = require('../models/supplierModel');

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
  const { order_formatted, supplier_id, warehouse_address, proc_order_items } = req;
  const supplier = await supplierModel.findSupplierById({ id: supplier_id });
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
  doc
    .fill('black')
    .fontSize(8)
    .text(supplier.name, leftAlign, 225);
  doc
    .fill('black')
    .fontSize(8)
    .text(
      warehouse_address,
      leftAlign + 200,
      225,
      { width: 120 }
    );
  // doc
  //   .fill('black')
  //   .fontSize(8)
  //   .text(id, leftAlign + 420, 211);
  doc
    .fill('black')
    .fontSize(8)
    .text(order_formatted, leftAlign + 390, 225);

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
  doc.rect(leftAlign-4,275,leftAlign+401,18)
  .fillOpacity(0.4)
 .fillAndStroke("grey", "#CDC4C2")

 doc.fillOpacity(1);

 var po_list = []

 proc_order_items.map(p => {
  const totalAmount = p.quantity * p.rate;
  po_list.push({ name: p.product_name, quantity: p.quantity, rate: p.rate, amount: totalAmount })
 });

  //table
  const tableTop = 280;
  let currentPosY = tableTop;
  let totalCost = 0;
  for (let i = 0; i < po_list.length; i++) {
    const name = po_list[i].name;
    const quantity = po_list[i].quantity;
    const rate = po_list[i].rate;
    const amount = po_list[i].amount;
    currentPosY = tableTop + 15 + i * 12;
    totalCost = totalCost + amount;
    doc.text(name, leftAlign, currentPosY);
    doc.text(quantity, leftAlign + 300, currentPosY);
    doc.text(rate, leftAlign + 350, currentPosY);
    doc.text(amount, leftAlign + 420, currentPosY);
  }

 doc.moveTo(leftAlign-50,currentPosY+30) // set the current point
 .lineTo(leftAlign+1000,currentPosY+30) .dash(5, { space: 2 }) 
 .stroke(); 

 const topAlign = currentPosY + 30;

 //prices
 doc.fill('grey').fontSize(8).text('Prices stated are in Malaysian Ringgit (MYR)', leftAlign, topAlign + 20);
 doc.fill('grey').fontSize(8).text('Inclusive of SST', leftAlign, topAlign + 30, { width: 90 });
 doc.fill('grey').fontSize(9).text('SUBTOTAL', leftAlign + 300, topAlign + 20, { width: 90 });
 doc.fill('grey').fontSize(9).text(totalCost, leftAlign + 420, topAlign + 20, { width: 90 });
 doc.fill('grey').fontSize(9).text('TOTAL', leftAlign + 300, topAlign + 30, { width: 90 });
 doc.fill('grey').fontSize(9).text(totalCost, leftAlign + 420, topAlign + 30, { width: 90 });

 //signature and date
 doc.fill('grey').fontSize(8).text('Approved By', leftAlign, topAlign + 70, { width: 90 });
 doc.moveTo(leftAlign + 100, topAlign + 80).lineTo(leftAlign + 500 , topAlign + 80).dash(500, {space: 10}).stroke();
 doc.fill('grey').fontSize(8).text('Date', leftAlign, topAlign + 90, { width: 90 });
 doc.moveTo(leftAlign + 100, topAlign + 100).lineTo(leftAlign + 500 , topAlign + 100).dash(500, {space: 10}).stroke();

  // Finalize PDF file Inclusive of SST
  doc.end();
  return await getStream.buffer(doc);
};

exports.generatePdfTemplate = generatePdfTemplate;
exports.generateProcurementPdfTemplate = generateProcurementPdfTemplate;
