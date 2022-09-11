const procurementModel = require('../models/procurementModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createProcurementOrder = async (req, res) => {
  const { order_date, amount, description, payment_status, fulfilment_status, proc_order_items, supplier_id } = req.body;
  const { error } = await common.awaitWrap(
    procurementModel.createProcurementOrder({
      order_date,
      amount,
      description,
      payment_status,
      fulfilment_status,
      proc_order_items,
      supplier_id
    })
  );  
  if (error) {
    log.error('ERR_PROCUREMENTORDER_CREATE-PO', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_PROCUREMENTORDER_CREATE-PO');
    res.json({ message: 'procurement order created' });
  }
};

const updateProcurementOrder = async (req, res) => {
  const { id, order_date, amount, payment_status, fulfilment_status, proc_order_items, supplier_id } = req.body;
  const { error } = await common.awaitWrap(
    procurementModel.updateProcurementOrder({
      id,
      order_date,
      amount,
      payment_status,
      fulfilment_status,
      proc_order_items,
      supplier_id
    })
  );
  if (error) {
    log.error('ERR_PROCUREMENTORDER_UPDATE-PO', error.message);
    res.json(Error.http(error));
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
    res.json(Error.http(error));
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

exports.createProcurementOrder = createProcurementOrder;
exports.updateProcurementOrder = updateProcurementOrder;
exports.getAllProcurementOrders = getAllProcurementOrders;
exports.getProcurementOrder = getProcurementOrder;