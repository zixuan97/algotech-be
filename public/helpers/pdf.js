const getStream = require('get-stream');
const PDFDocument = require('pdfkit-table');

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
  const {
    orderFormatted,
    warehouseAddress,
    procOrderItems,
    supplierName,
    currency
  } = req;

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
    .text(`Prices stated are in ${currency}`, leftAlign, topAlign + 20);
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
  const {
    id,
    createdAtFormatted,
    shippingDateFormatted,
    carrier,
    comments,
    deliveryMode,
    shippingType,
    salesOrder,
    assignedUser
  } = req;

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
    align: 'left'
  });

  const leftAlign = 73;
  //company details
  doc
    .font('Helvetica')
    .fontSize(8)
    .text('zac@thekettlegourmet.com', leftAlign, 90, { align: 'left' });
  doc.fontSize(8).text('www.thekettlegourmet.com', { align: 'left' });
  doc
    .fontSize(8)
    .text('Company Registration No. 201906356G', { align: 'left' });

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
  doc
    .fill('black')
    .fontSize(8)
    .text(salesOrder.customerAddress, leftAlign, 225, { width: 120 });
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
    .text(
      `POC: ${salesOrder.customerName} (${salesOrder.customerContactNo})`,
      leftAlign + 130,
      260,
      { width: 90 }
    );
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
      quantity: s.quantity
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

const generateBulkOrderPDF = async (req) => {
  const { createdDate, bulkOrder } = req;

  // Create a document
  const doc = new PDFDocument({
    bufferPages: true,
    tagged: true,
    size: 'A4',
    margins: {
      top: 25,
      bottom: 0,
      left: 25,
      right: 25
    }
  });
  const path = process.cwd() + '/logo.png';
  // Add an image, constrain it to a given size, and center it vertically and horizontally
  //logo
  doc.image(
    path,
    5,
    5,
    { fit: [160, 160] },
    { width: 300, linebreak: true, lineGap: 50 }
  );

  //company name
  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('The Savoury Nosh Pte Ltd', 160, 25);

  // payee details table
  const table = {
    headers: [
      { label: 'Name', property: 'first', width: 140, renderer: null },
      {
        label: 'Order ID',
        property: 'second',
        width: 140
      },
      { label: 'Remarks', property: 'third', width: 140, renderer: null }
    ],
    datas: [
      {
        first: 'Name' + '\n' + bulkOrder.payeeName + '\n ',
        second: 'Order ID' + '\n' + bulkOrder.orderId,
        third: `Discount Code \n${bulkOrder.discountCode ?? '-'}`
      },
      {
        first: 'Contact Number' + '\n' + bulkOrder.payeeContactNo + '\n ',
        second: 'Order Date' + '\n' + createdDate,
        third: `Remarks \n${bulkOrder.remarks ?? '-'}`
      },
      {
        first: 'Email' + '\n' + bulkOrder.payeeEmail + '\n ',
        second: 'Payment Status' + '\n' + bulkOrder.bulkOrderStatus
      }
    ]
  };
  // payee details table
  await doc.table(table, {
    width: 600,
    x: 160,
    y: 50,
    divider: {
      header: { disabled: false, width: 1, opacity: 1 },
      horizontal: { disabled: true, width: 0.5, opacity: 0.5 }
    },
    hideHeader: true,
    minRowHeight: 0,
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) =>
      doc.font('Helvetica-Bold').fontSize(8.5)
  });

  //total amount
  doc.rect(0, 160, 600, 60).fillOpacity(1).fillAndStroke('#1F1646');
  doc
    .fill('white')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('Total Amount Payable', 400, 170, { align: 'right' });
  doc
    .fill('white')
    .font('Helvetica-Bold')
    .fontSize(25)
    .text(`S$ ${bulkOrder.transactionAmount.toFixed(2)}`, 400, 190, {
      align: 'right'
    });

  //individual customer headers
  doc.rect(0, 220, 600, 35).fillOpacity(1).fillAndStroke('#E9E8EC');
  const table2 = {
    headers: [
      { label: 'Customer Name', property: 'name', width: 100, renderer: null },
      {
        label: 'Contact Number',
        property: 'number',
        width: 80
      },
      {
        label: 'Address',
        property: 'address',
        width: 120,
        renderer: null,
        padding: 8
      },
      { label: 'Postal Code', property: 'postal', width: 80, renderer: null },
      { label: 'Message', property: 'message', width: 90, renderer: null },
      {
        label: 'Amount',
        property: 'amount',
        width: 75,
        renderer: null,
        align: 'right',
        padding: 10
      }
    ],
    datas: [
      {
        name: 'Customer Name',
        number: 'Contact Number',
        address: 'Address',
        postal: 'Postal Code',
        message: 'Message',
        amount: 'Amount (S$)'
      }
    ]
  };

  // header
  await doc.table(table2, {
    width: 600,
    x: 25,
    y: 230,
    divider: {
      header: { disabled: false, width: 1, opacity: 1 },
      horizontal: { disabled: true, width: 0.5, opacity: 0.5 }
    },
    hideHeader: true,
    minRowHeight: 0,
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) =>
      doc.font('Helvetica-Bold').fontSize(9)
  });

  let tableX = 25;
  let tableY = 230;
  for (let i = 0; i < bulkOrder.salesOrders.length; i++) {
    salesOrder = bulkOrder.salesOrders[i];
    if (i === 0) {
      tableY += 35;
    } else {
      tableY += 15;
    }
    // new page after certain limit
    if (tableY > 550) {
      doc.addPage();
      tableY = 50;
      doc.rect(0, 0, 600, 35).fillOpacity(1).fillAndStroke('#E9E8EC');
      await doc.table(table2, {
        width: 600,
        x: 25,
        y: 10,
        divider: {
          header: { disabled: false, width: 1, opacity: 1 },
          horizontal: { disabled: true, width: 0.5, opacity: 0.5 }
        },
        hideHeader: true,
        minRowHeight: 0,
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) =>
          doc.font('Helvetica-Bold').fontSize(9)
      });
    }
    // individual customer details
    const table3 = {
      headers: [
        {
          label: 'Customer Name',
          property: 'name',
          width: 100,
          renderer: null
        },
        {
          label: 'Contact Number',
          property: 'number',
          width: 80
        },
        {
          label: 'Address',
          property: 'address',
          width: 120,
          renderer: null,
          padding: 8
        },
        {
          label: 'Postal Code',
          property: 'postal',
          width: 80,
          renderer: null
        },
        { label: 'Message', property: 'message', width: 90, renderer: null },
        {
          label: 'Amount',
          property: 'amount',
          width: 75,
          renderer: null,
          align: 'right',
          padding: 10
        }
      ],
      datas: [
        {
          name: salesOrder.customerName,
          number: salesOrder.customerContactNo,
          address: salesOrder.customerAddress,
          postal: salesOrder.postalCode,
          message: salesOrder.customerRemarks ?? '-',
          amount: salesOrder.amount.toFixed(2)
        }
      ]
    };

    let tableY2 = tableY + 40;
    // width
    await doc.table(table3, {
      width: 600,
      x: tableX,
      y: tableY,
      divider: {
        header: { disabled: false, width: 1, opacity: 1 },
        horizontal: { disabled: true, width: 0.5, opacity: 0.5 }
      },
      hideHeader: true,
      minRowHeight: 0,
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(9);
      }
    });
    doc.rect(20, tableY2, 560, 35).fillOpacity(1).fillAndStroke('#E9E8EC');
    let tableY3 = tableY2 + 10;

    //customer items headers
    const table4 = {
      headers: [
        {
          label: 'Item Name',
          property: 'name',
          width: 230,
          renderer: null,
          padding: 10
        },
        {
          label: 'Quantity',
          property: 'quantity',
          width: 100,
          align: 'right'
        },
        {
          label: 'Unit Price(S$)',
          property: 'price',
          width: 100,
          renderer: null,
          align: 'right'
        },
        {
          label: 'Subtotal(S$)',
          property: 'subtotal',
          width: 100,
          renderer: null,
          align: 'right'
        }
      ],
      datas: [
        {
          name: 'Item Name',
          quantity: 'Quantity',
          price: 'Unit Price (S$)',
          subtotal: 'Subtotal (S$)'
        }
      ]
    };

    await doc.table(table4, {
      width: 600,
      x: 25,
      y: tableY3,
      divider: {
        header: { disabled: false, width: 1, opacity: 1 },
        horizontal: { disabled: true, width: 0.5, opacity: 0.5 }
      },
      hideHeader: true,
      minRowHeight: 0,
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica-Bold').fontSize(9);
      }
    });
    let tableY4 = tableY3 + 35;

    //customer specific items
    const table5 = {
      headers: [
        {
          label: 'Item Name',
          property: 'name',
          width: 230,
          renderer: null,
          padding: 10
        },
        {
          label: 'Quantity',
          property: 'quantity',
          width: 100,
          align: 'right'
        },
        {
          label: 'Unit Price(S$)',
          property: 'price',
          width: 100,
          renderer: null,
          align: 'right'
        },
        {
          label: 'Subtotal (S$)',
          property: 'subtotal',
          width: 100,
          renderer: null,
          align: 'right'
        }
      ],
      datas: salesOrder.salesOrderItems.map((soi) => {
        return {
          name: soi.productName,
          quantity: soi.quantity,
          price: soi.price.toFixed(2),
          subtotal: (soi.price * soi.quantity).toFixed(2)
        };
      })
    };

    await doc.table(table5, {
      width: 600,
      x: tableX,
      y: tableY4,
      divider: {
        header: { disabled: true, width: 1, opacity: 1 },
        horizontal: { disabled: true, width: 0.5, opacity: 0.5 }
      },
      hideHeader: true,
      minRowHeight: 20,
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(9);
      }
    });

    tableY = tableY4 + 28 * salesOrder.salesOrderItems.length;
    // line added after each item
    doc.moveTo(0, tableY).lineTo(600, tableY).stroke();

    // last item add subtotal
    if (i === bulkOrder.salesOrders.length - 1) {
      // subtotal
      doc
        .fill('black')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Subtotal (S$)', 420, tableY + 15);

      doc
        .fill('black')
        .font('Helvetica')
        .fontSize(9)
        .text(bulkOrder.amount.toFixed(2), 420, tableY + 15, {
          align: 'right'
        });
      // discounts
      doc
        .fill('black')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Discount applied (S$)', 420, tableY + 35);

      doc
        .fill('black')
        .font('Helvetica')
        .fontSize(9)
        .text(
          `${(bulkOrder.transactionAmount - bulkOrder.amount).toFixed(2)}`,
          420,
          tableY + 35,
          {
            align: 'right'
          }
        );
      // line between subtotal and total
      doc
        .moveTo(420, tableY + 55)
        .lineTo(580, tableY + 55)
        .stroke();
      // total
      doc
        .fill('black')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Total (S$)', 420, tableY + 65);

      doc
        .fill('black')
        .font('Helvetica')
        .fontSize(9)
        .text(bulkOrder.transactionAmount.toFixed(2), 420, tableY + 65, {
          align: 'right'
        });
    }
  }

  // add footer
  const range = doc.bufferedPageRange(); // => { start: 0, count: 2 }
  for (
    i = range.start, end = range.start + range.count, range.start <= end;
    i < end;
    i++
  ) {
    doc.switchToPage(i);
    doc.rect(0, 820, 600, 23).fillOpacity(1).fillAndStroke('#1F1646');
    doc
      .fill('white')
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(`Page ${i + 1} of ${range.count}`, 500, 827, { align: 'right' });
  }

  doc.end();
  return await getStream.buffer(doc);
};

exports.generatePdfTemplate = generatePdfTemplate;
exports.generateProcurementPdfTemplate = generateProcurementPdfTemplate;
exports.generateDeliveryOrderPdfTemplate = generateDeliveryOrderPdfTemplate;
exports.generateBulkOrderPDF = generateBulkOrderPDF;
