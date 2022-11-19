const app = require('../../../index');
const supertest = require('supertest');
const procurementModel = require('../../models/procurementModel');
const locationModel = require('../../models/locationModel');
const supplierModel = require('../../models/supplierModel');
const pdfHelper = require('../../helpers/pdf');
const emailHelper = require('../../helpers/email');

// mock logger to remove test logs
jest.mock('../../helpers/logger', () => {
  return {
    log: {
      out: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    }
  };
});

jest.mock('../../helpers/email', () => {
  return {
    sendEmailWithAttachment: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../helpers/pdf', () => {
  return {
    generateProcurementPdfTemplate: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/procurementModel', () => {
  return {
    createProcurementOrder: jest.fn().mockImplementation(async () => {}),
    updateProcurementOrder: jest.fn().mockImplementation(async () => {}),
    getAllProcurementOrders: jest.fn().mockImplementation(async () => {}),
    findProcurementOrderById: jest.fn().mockImplementation(async () => []),
    procOrderStructure: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/locationModel', () => {
  return {
    findLocationByName: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/stockQuantityModel', () => {
  return {
    connectOrCreateStockQuantity: jest.fn().mockImplementation(async () => {})
  };
});

jest.mock('../../models/supplierModel', () => {
  return {
    findSupplierById: jest.fn().mockImplementation(async () => {})
  };
});

const procurementOrder = {
  id: 1,
  description: 'just a description',
  paymentStatus: 'PENDING',
  fulfilmentStatus: 'CREATED',
  warehouseName: 'Bishan Warehouse',
  warehouseAddress: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
  procOrderItems: [
    {
      quantity: 1,
      productSku: 'SKU123',
      productName: 'Nasi Lemak Popcorn',
      rate: 20.0
    }
  ],
  supplierId: 3
};

const location = {
  name: 'zac house2',
  address: 'blk 303b'
};

test('Create procurement order', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {
    return location;
  });

  supplierModel;

  procurementModel.createProcurementOrder.mockImplementation(async () => {
    return procurementOrder;
  });

  pdfHelper.generateProcurementPdfTemplate.mockImplementation(async () => {
    return '';
  });

  supplierModel.findSupplierById.mockImplementation(() => {
    return {
      id: 1,
      email: 'tanwk@comp.nus.edu.sg',
      name: 'Wee Kek',
      address: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
      currency: 'SGD - Singapore Dollar',
      supplierProduct: []
    };
  });

  await supertest(app)
    .post('/procurement')
    .set('origin', 'jest')
    .send(procurementOrder)
    .expect(200);

  //send email error
  emailHelper.sendEmailWithAttachment.mockImplementation(() => {
    throw new Error();
  });
  await supertest(app)
    .post('/procurement')
    .set('origin', 'jest')
    .send(procurementOrder)
    .expect(200);
});

test('Create procurement order, error', async () => {
  locationModel.findLocationByName.mockImplementation(async () => {
    return location;
  });

  procurementModel.createProcurementOrder.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .post('/procurement')
    .set('origin', 'jest')
    .send(procurementOrder)
    .expect(400);
});

test('Update procurement order', async () => {
  procurementModel.updateProcurementOrder.mockImplementation(async () => {
    return procurementOrder;
  });

  procurementModel.findProcurementOrderById.mockImplementation(async () => {
    return procurementOrder;
  });
  procurementOrder.fulfilmentStatus = 'COMPLETED';
  await supertest(app)
    .put('/procurement')
    .set('origin', 'jest')
    .send(procurementOrder)
    .expect(200);

  procurementOrder.fulfilmentStatus = 'CREATED';
  await supertest(app)
    .put('/procurement')
    .set('origin', 'jest')
    .send(procurementOrder)
    .expect(200);
});

test('Update procurement order, error', async () => {
  procurementModel.updateProcurementOrder.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .put('/procurement')
    .set('origin', 'jest')
    .send(procurementOrder)
    .expect(400);
});

test('Get all procurement orders', async () => {
  procurementModel.getAllProcurementOrders.mockImplementation(async () => {
    return [procurementOrder];
  });

  await supertest(app)
    .get('/procurement/all')
    .set('origin', 'jest')
    .send(procurementOrder)
    .expect(200);
});

test('Get all procurement orders', async () => {
  procurementModel.getAllProcurementOrders.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app)
    .get('/procurement/all')
    .set('origin', 'jest')
    .send(procurementOrder)
    .expect(400);
});

test('Get procurement order by id', async () => {
  procurementModel.findProcurementOrderById.mockImplementation(async () => {
    return procurementOrder;
  });

  await supertest(app).get('/procurement/1').set('origin', 'jest').expect(200);
});

test('Get procurement order by id, error', async () => {
  procurementModel.findProcurementOrderById.mockImplementation(async () => {
    throw new Error();
  });

  await supertest(app).get('/procurement/1').set('origin', 'jest').expect(400);
});

test('Generate procurement order pdf', async () => {
  procurementModel.findProcurementOrderById.mockImplementation(async () => {
    return procurementOrder;
  });

  pdfHelper.generateProcurementPdfTemplate.mockImplementation(async () => {
    return '';
  });

  await supertest(app)
    .post('/procurement/pdf/1')
    .set('origin', 'jest')
    .expect(200);
});

test('Generate procurement order pdf, error', async () => {
  procurementModel.findProcurementOrderById.mockImplementation(async () => {
    return procurementOrder;
  });
  pdfHelper.generateProcurementPdfTemplate.mockImplementation(async () => {
    throw new Error();
  });
  await supertest(app)
    .post('/procurement/pdf/1')
    .set('origin', 'jest')
    .expect(400);
});
