const app = require('../../../index');
const supertest = require('supertest');

test('Create product', async () => {
  const data = {
    sku: 'SKU123',
    name: 'Nasi Lemak Popcorn',
    brandId: 1,
    qtyThreshold: 20,
    productCategory: {
      create: [
        {
          categoryName: 'Asian Favourites',
          productSku: 'SKU123',
          category: {
            connect: {
              name: 'Asian Favourites'
            }
          }
        }
      ]
    },
    stockQuantity: {
      create: [
        {
          productName: 'Nasi Lemak Popcorn',
          productSku: 'SKU123',
          quantity: 20,
          locationName: 'Punggol Warehouse',
          location: {
            connect: {
              id: 1
            }
          }
        }
      ]
    }
  };
  await supertest(app)
    .post('/product')
    .set('origin', 'jest')
    .send(data)
    .expect(200)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'Product created' });
    });
});

test('Duplicate product should not be created', async () => {
  const data = {
    sku: 'SKU123',
    name: 'Nasi Lemak Popcorn',
    brandId: 1,
    qtyThreshold: 20,
    productCategory: {
      create: [
        {
          categoryName: 'Asian Favourites',
          productSku: 'SKU123',
          category: {
            connect: {
              name: 'Asian Favourites'
            }
          }
        }
      ]
    },
    stockQuantity: {
      create: [
        {
          productName: 'Nasi Lemak Popcorn',
          productSku: 'SKU123',
          quantity: 20,
          locationName: 'Punggol Warehouse',
          location: {
            connect: {
              id: 1
            }
          }
        }
      ]
    }
  };
  await supertest(app)
    .post('/product')
    .set('origin', 'jest')
    .send(data)
    .expect(400)
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: 'Product already exists'
      });
    });
});
