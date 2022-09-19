const procurementModel = require('../models/procurementModel');
const supplierModel = require('../models/supplierModel');
const productModel = require('../models/productModel');
const locationModel = require('../models/locationModel');
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
    payment_status,
    fulfilment_status,
    warehouse_address,
    proc_order_items,
    supplier_id
  } = req.body;
  const order_date = new Date();
  const order_formatted = format(order_date, 'dd MMM yyyy');
  const supplier = await supplierModel.findSupplierById({ id: supplier_id });
  const { error } = await common.awaitWrap(
    procurementModel.createProcurementOrder({
      order_date,
      description,
      payment_status,
      fulfilment_status,
      warehouse_address,
      proc_order_items,
      supplier
    })
  );

  if (error) {
    log.error('ERR_PROCUREMENTORDER_CREATE-PO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    await sendProcurementEmail({
      order_formatted,
      supplier_id,
      warehouse_address,
      proc_order_items
    });
    log.out('OK_PROCUREMENTORDER_CREATE-PO');
    res.json({ message: 'procurement order created' });
  }
};

const updateProcurementOrder = async (req, res) => {
  const {
    id,
    order_date,
    description,
    payment_status,
    fulfilment_status,
    warehouse_address,
    proc_order_items
  } = req.body;

  const { error } = await common.awaitWrap(
    procurementModel.updateProcurementOrder({
      id,
      order_date,
      description,
      payment_status,
      fulfilment_status,
      warehouse_address,
      proc_order_items
    })
  );
  if (error) {
    log.error('ERR_PROCUREMENTORDER_UPDATE-PO', error.message);
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    const location = await locationModel.findLocationByName({ name: warehouse_address });
    const po = await procurementModel.findProcurementOrderById({ id });
    const po_items = po.proc_order_items;
    let pdt_list = [];
    if (fulfilment_status === "COMPLETED") {
      for (let p of po_items) {
        const product = await productModel.findProductBySku({ sku: p.product_sku })
        pdt_list.push(product)
        const warehouse_locations = [];
        for (let s of product.stockQuantity) {
          warehouse_locations.push(s.location_name)
          if (s.product_sku === p.product_sku && s.location_name === warehouse_address) {
            const sPdt = await productModel.findProductBySku({ sku: s.product_sku })
            const newQuantity = s.quantity + p.quantity;
            s = await prisma.StockQuantity.update({
              where: { 
                product_id_location_id: {
                  product_id: sPdt.id, location_id: location.id
                },
              },
              data: {
                quantity: newQuantity
              }
            });
          }
        };
        if (!warehouse_locations.includes(warehouse_address)) {
          await prisma.location.update({
            where: { id: location.id },
            data: {
              stockQuantity: {
                create: pdt_list.map((x) => ({
                  product_sku: x.sku,
                  product_name: x.name,
                  price: p.rate,
                  quantity: p.quantity,
                  product: {
                    connect: {
                      id: x.id
                    }
                  },
                  location_name: warehouse_address
                }))
              }
            }
          });
        }
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
    let data_res = []
    let proc_order_items_pdt = []
    for (let d of data) {
      const supplier_id = d.supplier_id;
      const warehouse_address = d.warehouse_address;
      const supplier = await supplierModel.findSupplierById({ id: supplier_id });
      const location = await locationModel.findLocationByName({ name: warehouse_address });
      for (let p of d.proc_order_items) {
        const pdt = await productModel.findProductBySku({ sku : p.product_sku });
        const newEntity = {
          id: p.id,
          proc_order_id: p.proc_order_id,
          product: pdt
        };
        proc_order_items_pdt.push(newEntity)
      }
      const result = {
        id: d.id,
        order_date: d.order_date,
        description: d.description,
        payment_status: d.payment_status,
        fulfilment_status: d.fulfilment_status,
        total_amount: d.total_amount,
        supplier: supplier,
        location: location,
        proc_order_items: proc_order_items_pdt
      };
      data_res.push(result)
      proc_order_items_pdt = []
    }
    console.log(data_res)
    log.out('OK_PROCUREMENTORDER_GET-ALL-PO');
    res.json(data_res);
  }
};

const getProcurementOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const po = await procurementModel.findProcurementOrderById({ id });
    const { order_date, description, payment_status, fulfilment_status, supplier_id, total_amount, warehouse_address, proc_order_items } = po;
    const supplier = await supplierModel.findSupplierById({ id: supplier_id });
    const location = await locationModel.findLocationByName({ name: warehouse_address });
    let proc_order_items_pdt = []
    for (let p of proc_order_items) {
      const pdt = await productModel.findProductBySku({ sku : p.product_sku })
      const newEntity = {
        id: p.id,
        proc_order_id: p. proc_order_id,
        product: pdt
      };
      proc_order_items_pdt.push(newEntity)
    }
    log.out('OK_PROCUREMENTORDER_GET-PO-BY-ID');
    const result = {
      id,
      order_date,
      description,
      payment_status,
      fulfilment_status,
      total_amount,
      supplier: supplier,
      location: location,
      proc_order_items: proc_order_items_pdt
    };
    res.json(result);
  } catch (error) {
    log.error('ERR_PROCUREMENTORDER_GET-PO', error.message);
    res.status(500).send('Server Error');
  }
};

const generatePO = async (req, res) => {
  const po_id = req.params;
  const po = await procurementModel.findProcurementOrderById(po_id);
  const { supplier_name, warehouse_address, proc_order_items } = po;
  const order_date = new Date();
  const order_formatted = format(order_date, 'dd MMM yyyy');
  await generateProcurementPdfTemplate({
    order_formatted,
    warehouse_address,
    proc_order_items,
    supplier_name
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
    const {
      order_formatted,
      supplier_id,
      warehouse_address,
      proc_order_items
    } = req;
    const supplier = await supplierModel.findSupplierById({ id: supplier_id });
    await generateProcurementPdfTemplate({
      order_formatted,
      supplier_name: supplier.name,
      warehouse_address,
      proc_order_items
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