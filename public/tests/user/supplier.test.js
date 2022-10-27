const app = require('../../../index');
const supertest = require('supertest');

test('Create supplier', async () => {
  const data = {
    email: 'tanwk@comp.nus.edu.sg',
    name: 'Wee Kek',
    address: 'Blk 117 Ang Mo Kio Ave 4 #08-467'
  };
  await supertest(app)
    .post('/supplier')
    .set('origin', 'jest')
    .send(data)
    .expect(200)
    .then((response) => {
      expect(response.body).toStrictEqual({ message: 'Supplier created' });
    });
});

test('Duplicate supplier should not be created', async () => {
  const data = {
    email: 'tanwk@comp.nus.edu.sg',
    name: 'Wee Kek',
    address: 'Blk 117 Ang Mo Kio Ave 4 #08-467'
  };
  await supertest(app)
    .post('/supplier')
    .set('origin', 'jest')
    .send(data)
    .expect(400)
    .then((response) => {
      expect(response.body).toStrictEqual({
        message: 'Supplier already exists'
      });
    });
});
