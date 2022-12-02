const supplierModel = require('../../models/supplierModel');
const { prisma } = require('../../models/index');
const axios = require('axios').default;

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

jest.mock('axios');

const supplier = {
  id: 1,
  email: 'tanwk@comp.nus.edu.sg',
  name: 'Wee Kek',
  address: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
  currency: 'SGD - Singapore Dollar',
  supplierProduct: [{ product: { id: 1 }, rate: 2.0 }]
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      supplier: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {}),
        upsert: jest.fn().mockImplementation(async () => {})
      },
      supplierProduct: {
        upsert: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create supplier model', async () => {
  prisma.supplier.create.mockImplementation(async () => {
    return {
      supplier
    };
  });
  await expect(supplierModel.createSupplier(supplier)).resolves.toEqual({
    supplier
  });
});

test('get all suppliers', async () => {
  await expect(supplierModel.getAllSuppliers()).resolves.toEqual([]);
});

test('update supplier', async () => {
  prisma.supplier.update.mockImplementation(async () => {
    return supplier;
  });

  prisma.supplierProduct.findMany.mockImplementation(async () => {
    return [{ product: { id: 1 }, rate: 2.0 }];
  });
  await expect(supplierModel.updateSupplier(supplier)).resolves.toEqual(
    supplier
  );
});

test('delete supplier', async () => {
  prisma.supplier.update.mockImplementation(async () => {
    return supplier;
  });
  prisma.supplier.delete.mockImplementation(async () => {
    return {};
  });
  await expect(supplierModel.deleteSupplier({ id: 1 })).resolves.toEqual({});
});

test('find supplier by id', async () => {
  prisma.supplier.findUnique.mockImplementation(async () => {
    return supplier;
  });
  await expect(supplierModel.findSupplierById({ id: 1 })).resolves.toEqual(
    supplier
  );
});

test('find supplier by email', async () => {
  prisma.supplier.findUnique.mockImplementation(async () => {
    return supplier;
  });
  await expect(
    supplierModel.findSupplierByEmail({ email: 'zac@thekettlegourmet.com' })
  ).resolves.toEqual(supplier);
});

test('connect or create supplier product', async () => {
  prisma.supplierProduct.upsert.mockImplementation(async () => {
    return {
      supplierId: 1,
      productId: 1,
      rate: 2.0
    };
  });
  await expect(
    supplierModel.connectOrCreateSupplierProduct({
      supplierId: 1,
      productId: 1,
      rate: 2.0
    })
  ).resolves.toEqual({
    supplierId: 1,
    productId: 1,
    rate: 2.0
  });
});

test('get all supplier products', async () => {
  await expect(supplierModel.getAllSupplierProducts()).resolves.toEqual([
    { product: { id: 1 }, rate: 2.0 }
  ]);
});

test('delete product by supplier', async () => {
  prisma.supplierProduct.delete.mockImplementation(async () => {
    return {
      supplierId: 1,
      productId: 1,
      rate: 2.0
    };
  });
  await expect(
    supplierModel.deleteProductBySupplier({
      supplierId: 1,
      productId: 1,
      rate: 2.0
    })
  ).resolves.toEqual({
    supplierId: 1,
    productId: 1,
    rate: 2.0
  });
});

test('get all currencies', async () => {
  axios.get.mockImplementation(() => Promise.resolve({ data: { key: [] } }));
  await expect(supplierModel.getAllCurrencies()).resolves.toEqual(['key - ']);
});
