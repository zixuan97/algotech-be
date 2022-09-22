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
        location: stockqty.locationName
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
