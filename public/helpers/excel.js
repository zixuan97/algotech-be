const writeXlsxFile = require('write-excel-file');

const generateInventoryExcel = async (req) => {
  const { products } = req;
  let objects = [{}];
  let count = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    for (let j = 0; j < product.stockQuantity?.length; j++) {
      const stockqty = product.stockQuantity[j];
      const obj = {
        name: product.name,
        sku: product.sku,
        quantity: stockqty.quantity,
        location: stockqty.location.name
      };
      objects[count] = obj;
      count++;
    }
  }

  const schema = [
    {
      column: 'Name',
      type: String,
      value: (product) => product.name
    },
    {
      column: 'SKU',
      type: String,
      value: (product) => product.sku
    },
    {
      column: 'Location',
      type: String,
      value: (product) => product.location
    },
    {
      column: 'Quantity',
      type: Number,
      value: (product) => product.quantity
    }
  ];

  return await writeXlsxFile(objects, {
    schema,
    headerStyle: {
      backgroundColor: '#eeeeee',
      fontWeight: 'bold',
      align: 'center'
    }
  });
};

const generateSalesOrderExcel = async (req) => {
  const { salesOrders } = req;

  const schema = [
    {
      column: 'OrderId',
      type: String,
      value: (so) => so.orderId
    },
    {
      column: 'Customer Address',
      type: String,
      value: (so) => so.customerAddress
    },
    {
      column: 'Customer Name',
      type: String,
      value: (so) => so.customerName
    },
    {
      column: 'Customer Postal Code',
      type: String,
      value: (so) => so.postalCode
    },
    {
      column: 'Customer Contact Number',
      type: String,
      value: (so) => so.customerContactNo
    },
    {
      column: 'Currency',
      type: String,
      value: (so) => so.currency
    },
    {
      column: 'Price',
      type: Number,
      value: (so) => so.amount
    },
    {
      column: 'Customer Remarks',
      type: String,
      value: (so) => so.remarks
    },
    {
      column: 'Customer Email',
      type: String,
      value: (so) => so.customerEmail
    },
    {
      column: 'Customer Order Status',
      type: String,
      value: (so) => so.orderStatus
    },
    {
      column: 'Platform',
      type: String,
      value: (so) => so.platformType
    },
    {
      column: 'Order Created At',
      type: Date,
      format: 'dd/mm/yyyy',
      value: (so) => so.createdTime
    }
  ];

  return await writeXlsxFile(salesOrders, {
    schema,
    headerStyle: {
      backgroundColor: '#eeeeee',
      fontWeight: 'bold',
      align: 'center'
    }
  });
};

const generateBulkOrderExcel = async (req) => {
  const { bulkOrders } = req;

  const schema = [
    {
      column: 'OrderId',
      type: String,
      value: (bo) => bo.orderId
    },
    {
      column: 'Customer Email',
      type: String,
      value: (bo) => bo.payeeEmail
    },
    {
      column: 'Customer Name',
      type: String,
      value: (bo) => bo.payeeName
    },
    {
      column: 'Customer Contact Number',
      type: String,
      value: (bo) => bo.payeeContactNo
    },
    {
      column: 'Amount',
      type: Number,
      value: (bo) => bo.transactionAmount
    },
    {
      column: 'Customer Remarks',
      type: String,
      value: (bo) => bo.payeeRemarks
    },
    {
      column: 'Payment Mode',
      type: String,
      value: (bo) => bo.paymentMode
    },
    {
      column: 'Number of Orders',
      type: Number,
      value: (bo) => bo.salesOrders.length
    },
    {
      column: 'Customer Order Status',
      type: String,
      value: (bo) => bo.orderStatus
    },
    {
      column: 'Company',
      type: String,
      value: (bo) => bo.payeeCompany
    },
    {
      column: 'Order Created At',
      type: Date,
      format: 'dd/mm/yyyy',
      value: (bo) => bo.createdTime
    }
  ];

  return await writeXlsxFile(bulkOrders, {
    schema,
    headerStyle: {
      backgroundColor: '#eeeeee',
      fontWeight: 'bold',
      align: 'center'
    }
  });
};

const generateLowStockExcel = async (req) => {
  const { products } = req;
  let objects = [{}];
  let count = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    let totalQty = 0;
    for (let j = 0; j < product.stockQuantity?.length; j++) {
      const stockqty = product.stockQuantity[j];
      totalQty += stockqty.quantity;
    }
    if (totalQty <= product.qtyThreshold) {
      const obj = {
        name: product.name,
        sku: product.sku,
        qtyThreshold: product.qtyThreshold,
        currentQty: totalQty
      };
      objects[count] = obj;
      count++;
    }
  }

  const schema = [
    {
      column: 'Name',
      type: String,
      value: (product) => product.name
    },
    {
      column: 'SKU',
      type: String,
      value: (product) => product.sku
    },
    {
      column: 'Quantity Threshold',
      type: Number,
      value: (product) => product.qtyThreshold
    },
    {
      column: 'Current Quantity',
      type: Number,
      value: (product) => product.currentQty
    }
  ];

  return await writeXlsxFile(objects, {
    schema,
    headerStyle: {
      backgroundColor: '#eeeeee',
      fontWeight: 'bold',
      align: 'center'
    }
  });
};

exports.generateInventoryExcel = generateInventoryExcel;
exports.generateLowStockExcel = generateLowStockExcel;
exports.generateSalesOrderExcel = generateSalesOrderExcel;
exports.generateBulkOrderExcel = generateBulkOrderExcel;
