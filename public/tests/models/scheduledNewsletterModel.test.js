const scheduledNewsletterModel = require('../../models/scheduledNewsletterModel');
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
const scheduledNewsletter = {
  id: 1,
  newsletterId: 1,
  customerEmails: ['tehrongkang@gmail.com'],
  sentDate: '2022-11-18T06:50:00.172Z',
  jobStatus: 'CANCELLED',
  createdAt: '2022-11-18T06:48:52.487Z',
  jobId: 'df6abcfd-db2f-487f-9357-0f7e08a6683c',
  updatedAt: '2022-11-18T06:57:25.839Z',
  newsletter: {
    id: 1,
    name: 'Test newslettler',
    emailSubject: 'HEllooo',
    emailBodyTitle: 'Test motherfkers',
    emailBody: 'Lalalallalaasdasdsa',
    discountCode: 'FKu'
  }
};
jest.mock('../../models/index', () => {
  return {
    prisma: {
      scheduledNewsletter: {
        create: jest.fn().mockImplementation(async () => {}),
        findMany: jest.fn().mockImplementation(async () => []),
        delete: jest.fn().mockImplementation(async () => {}),
        update: jest.fn().mockImplementation(async () => {}),
        findUnique: jest.fn().mockImplementation(async () => {})
      }
    }
  };
});

test('create scheduledNewsletter model', async () => {
  prisma.scheduledNewsletter.create.mockImplementation(async () => {
    return {
      scheduledNewsletter
    };
  });
  await expect(
    scheduledNewsletterModel.createScheduledNewsLetter(scheduledNewsletter)
  ).resolves.toEqual({ scheduledNewsletter });
});

test('get all scheduled newsletters', async () => {
  await expect(
    scheduledNewsletterModel.getAllScheduledNewsLetters({
      time_from: new Date(),
      time_to: new Date()
    })
  ).resolves.toEqual([]);
});

test('get all scheduled newsletters by job status', async () => {
  await expect(
    scheduledNewsletterModel.getAllScheduledNewsLettersByJobStatus({
      time_from: new Date(),
      time_to: new Date(),
      jobStatus: 'CANCELLED'
    })
  ).resolves.toEqual([]);
});

test('update scheduled newsletter', async () => {
  prisma.scheduledNewsletter.update.mockImplementation(async () => {
    return scheduledNewsletter;
  });
  await expect(
    scheduledNewsletterModel.updateScheduledNewsLetter(scheduledNewsletter)
  ).resolves.toEqual(scheduledNewsletter);
});

test('update scheduled newsletter status', async () => {
  prisma.scheduledNewsletter.update.mockImplementation(async () => {
    return scheduledNewsletter;
  });
  await expect(
    scheduledNewsletterModel.updateScheduledNewsLetterStatus(
      scheduledNewsletter
    )
  ).resolves.toEqual(scheduledNewsletter);
});

test('delete scheduled newsletter', async () => {
  prisma.scheduledNewsletter.delete.mockImplementation(async () => {
    return {};
  });
  await expect(
    scheduledNewsletterModel.deleteScheduledNewsletter({ id: 1 })
  ).resolves.toEqual({});
});

test('find scheduled Newsletter by id', async () => {
  prisma.scheduledNewsletter.findUnique.mockImplementation(async () => {
    return scheduledNewsletter;
  });
  await expect(
    scheduledNewsletterModel.findScheduledNewsletterById({ id: 1 })
  ).resolves.toEqual(scheduledNewsletter);
});

test('find scheduledNewsletter by newsletterId', async () => {
  prisma.scheduledNewsletter.findMany.mockImplementation(async () => {
    return [];
  });
  await expect(
    scheduledNewsletterModel.findScheduledNewsletterByNewsletterId({
      newsletterId: 1
    })
  ).resolves.toEqual([]);
});
