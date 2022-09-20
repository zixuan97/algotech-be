const procurementModel = require('../models/procurementModel');
const supplierModel = require('../models/supplierModel');
const productModel = require('../models/productModel');
const locationModel = require('../models/locationModel');
const stockQuantityModel = require('../models/stockQuantityModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { generateProcurementPdfTemplate } = require('../helpers/pdf');
const emailHelper = require('../helpers/email');
const { format } = require('date-fns');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProcurementOrder = async (req, res) => {
  const {
    description,
    paymentStatus,
    fulfilmentStatus,
    warehouseName,
    warehouseAddress,
    procOrderItems,
    supplierId
  } = req.body;
  const orderDate = new Date();
  const orderFormatted = format(orderDate, 'dd MMM yyyy');
  const supplier = await supplierModel.findSupplierById({ id: supplierId });
  const { error } = await common.awaitWrap(
    procurementModel.createProcurementOrder({
      orderDate,
      description,
      paymentStatus,
      fulfilmentStatus,
      warehouseName,
      warehouseAddress,
      procOrderItems,
      supplier
    })
  );

  if (error) {
    log.error('ERR_PROCUREMENTORDER_CREATE-PO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    await sendProcurementEmail({
      orderFormatted,
      supplierId,
      warehouseAddress,
      procOrderItems
    });
    log.out('OK_PROCUREMENTORDER_CREATE-PO');
    res.json({ message: 'procurement order created' });
  }
};

const updateProcurementOrder = async (req, res) => {
  const {
    id,
    orderDate,
    description,
    paymentStatus,
    fulfilmentStatus,
    warehouseName,
    warehouseAddress,
    procOrderItems
  } = req.body;
  const { error } = await common.awaitWrap(
    procurementModel.updateProcurementOrder({
      id,
      orderDate,
      description,
      paymentStatus,
      fulfilmentStatus,
      warehouseName,
      warehouseAddress,
      procOrderItems
    })
  );
  if (error) {
    log.error('ERR_PROCUREMENTORDER_UPDATE-PO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    if (fulfilmentStatus === "COMPLETED") {
      const po = await procurementModel.findProcurementOrderById({ id });
      const po_items = po.procOrderItems;
      const location = await locationModel.findLocationByName({ name: po.warehouseName });
      for (let p of po_items) {
        const pdt = await productModel.findProductBySku({ sku: p.productSku });
        await stockQuantityModel.connectOrCreateStockQuantity({ productId: pdt.id, productName: pdt.name, productSku: pdt.sku, locationId: location.id, quantity: p.quantity, price: 0, locationName: po.warehouseName })
      }
    }
    log.out('OK_PROCUREMENTORDER_UPDATE-PO');
    res.json({ message: `Updated procurement order with id:${id}` });
  }
};

const getAllProcurementOrders = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    procurementModel.getAllProcurementOrders({})
  );

  if (error) {
    log.error('ERR_PROCUREMENTORDER_GET-ALL-PO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    let dataRes = [];
    let procOrderItemsPdt = [];
    for (let d of data) {
      const supplierId = d.supplierId;
      const warehouseName = d.warehouseName;
      const supplier = await supplierModel.findSupplierById({ id: supplierId });
      const location = await locationModel.findLocationByName({
        name: warehouseName
      });
      for (let p of d.procOrderItems) {
        const pdt = await productModel.findProductBySku({ sku: p.productSku });
        pdt.category = pdt.productCategory;
        delete pdt.productCategory;
        const newEntity = {
          id: p.id,
          procOrderId: p.procOrderId,
          quantity: p.quantity,
          product: {
            ...pdt,
            category: pdt.category.map((category) => category.category)
          }
        };
        procOrderItemsPdt.push(newEntity);
      }
      const result = {
        id: d.id,
        orderDate: d.orderDate,
        description: d.description,
        paymentStatus: d.paymentStatus,
        fulfilmentStatus: d.fulfilmentStatus,
        totalAmount: d.totalAmount,
        supplier: supplier,
        location: location,
        procOrderItems: procOrderItemsPdt
      };
      dataRes.push(result);
      procOrderItemsPdt = [];
    }
    log.out('OK_PROCUREMENTORDER_GET-ALL-PO');
    res.json(dataRes);
  }
};

const getProcurementOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const po = await procurementModel.findProcurementOrderById({ id });
    const {
      orderDate,
      description,
      paymentStatus,
      fulfilmentStatus,
      supplierId,
      totalAmount,
      warehouseName,
      procOrderItems
    } = po;
    const supplier = await supplierModel.findSupplierById({ id: supplierId });
    const location = await locationModel.findLocationByName({
      name: warehouseName
    });
    let procOrderItemsPdt = [];
    for (let p of procOrderItems) {
      const pdt = await productModel.findProductBySku({ sku: p.productSku });
      pdt.category = pdt.productCategory;
      delete pdt.productCategory;
      const newEntity = {
        id: p.id,
        procOrderId: p.procOrderId,
        quantity: p.quantity,
        product: {
          ...pdt,
          category: pdt.category.map((category) => category.category)
        }
      };
      procOrderItemsPdt.push(newEntity);
    }
    log.out('OK_PROCUREMENTORDER_GET-PO-BY-ID');
    const result = {
      id,
      orderDate,
      description,
      paymentStatus,
      fulfilmentStatus,
      totalAmount,
      supplier: supplier,
      location: location,
      procOrderItems: procOrderItemsPdt
    }; 
    res.json(result);
  } catch (error) {
    log.error('ERR_PROCUREMENTORDER_GET-PO', error.message);
    res.status(500).send('Server Error');
  }
};

const generatePO = async (req, res) => {
  const poId = req.params;
  const po = await procurementModel.findProcurementOrderById(poId);
  const { supplierName, warehouseAddress, procOrderItems } = po;
  const orderDate = new Date();
  const orderFormatted = format(orderDate, 'dd MMM yyyy');
  await generateProcurementPdfTemplate({
    orderFormatted,
    warehouseAddress,
    procOrderItems,
    supplierName
  })
    .then((pdfBuffer) => {
      res
        .writeHead(200, {
          'Content-Length': Buffer.byteLength(pdfBuffer),
          'Content-Type': 'application/pdf',
          'Content-disposition': 'attachment; filename = test.pdf'
        })
        .end(pdfBuffer);
    })
    .catch((error) => {
      log.error('ERR_PROCUREMENTORDER_GENERATE-PO-PDF', error.message);
      return res.status(error).json(error.message);
    });
};

const sendProcurementEmail = async (req, res) => {
  try {
    const { orderFormatted, supplierId, warehouseAddress, procOrderItems } =
      req;
    const supplier = await supplierModel.findSupplierById({ id: supplierId });
    await generateProcurementPdfTemplate({
      orderFormatted,
      supplierName: supplier.name,
      warehouseAddress,
      procOrderItems
    }).then(async (pdfBuffer) => {
      const subject = 'Procurement Order';
      const content = 'Attached please find the procurement order.';
      const recipientEmail = supplier.email;
      await emailHelper.sendEmailWithAttachment({
        recipientEmail,
        subject,
        content,
        data: pdfBuffer.toString('base64'),
        filename: 'purchaseorder.pdf'
      });
      console.log('EMAIL SENT');
    });
  } catch (error) {
    log.error('ERR_USER_SEND', error.message);
  }
};

exports.createProcurementOrder = createProcurementOrder;
exports.updateProcurementOrder = updateProcurementOrder;
exports.getAllProcurementOrders = getAllProcurementOrders;
exports.getProcurementOrder = getProcurementOrder;
exports.generatePO = generatePO;
exports.sendProcurementEmail = sendProcurementEmail;
