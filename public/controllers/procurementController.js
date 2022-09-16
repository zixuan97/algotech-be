const procurementModel = require('../models/procurementModel');
const supplierModel = require('../models/supplierModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { generateProcurementPdfTemplate } = require('../helpers/pdf');
const emailHelper = require('../helpers/email');
const { format } = require('date-fns');

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
    log.out('OK_PROCUREMENTORDER_GET-ALL-PO');
    res.json(data);
  }
};

const getProcurementOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const po = await procurementModel.findProcurementOrderById({ id });
    log.out('OK_PROCUREMENTORDER_GET-PO-BY-ID');
    res.json(po);
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
      supplier_id,
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
