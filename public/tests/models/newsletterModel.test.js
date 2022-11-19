const newsletterModel = require('../../models/newsletterModel');
const { prisma } = require('../../models/index');
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
const newsletter = {
  id: 1,
  name: 'Test newslettler',
  emailSubject: 'HEllooo',
  emailBodyTitle: 'Test motherfkers',
  emailBody: 'Lalalallalaasdasdsa',
  discountCode: 'FKu'
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      newsletter: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create newsletter model', async () => {
  prisma.newsletter.create.mockImplementation(async () => {
    return {
      newsletter
    };
  });
  await expect(newsletterModel.createNewsletter(newsletter)).resolves.toEqual({
    newsletter
  });
});

test('get all newsletters', async () => {
  await expect(newsletterModel.getAllNewsletters()).resolves.toEqual([]);
});

test('update newsletter', async () => {
  prisma.newsletter.update.mockImplementation(async () => {
    return newsletter;
  });
  await expect(newsletterModel.updateNewsletter(newsletter)).resolves.toEqual(
    newsletter
  );
});

test('delete newsletter', async () => {
  prisma.newsletter.delete.mockImplementation(async () => {
    return {};
  });
  await expect(newsletterModel.deleteNewsletter({ id: 1 })).resolves.toEqual(
    {}
  );
});

test('find newsletter by id', async () => {
  prisma.newsletter.findUnique.mockImplementation(async () => {
    return newsletter;
  });
  await expect(newsletterModel.findNewsletterById({ id: 1 })).resolves.toEqual(
    newsletter
  );
});
