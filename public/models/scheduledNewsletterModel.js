const { prisma } = require('./index.js');

const createScheduledNewsLetter = async (req) => {
  const { newsletterId, customerEmails, sentDate } = req;

  await prisma.scheduledNewsletter.create({
    data: {
      newsletterId,
      customerEmails,
      sentDate
    }
  });
};

const getAllScheduledNewsLetters = async () => {
  const scheduledNewsletters = await prisma.scheduledNewsletter.findMany({});
  return scheduledNewsletters;
};

const updateScheduledNewsLetter = async (req) => {
  const { id, newsletterId, customerEmails, sentDate, jobStatus } = req;

  brand = await prisma.scheduledNewsletter.update({
    where: { id },
    data: {
      newsletterId,
      customerEmails,
      sentDate,
      jobStatus
    }
  });
  return brand;
};

const deleteScheduledNewsletter = async (req) => {
  const { id } = req;
  await prisma.scheduledNewsletter.delete({
    where: {
      id: Number(id)
    }
  });
};

const findScheduledNewsletterById = async (req) => {
  const { id } = req;
  const scheduledNewsletter = await prisma.scheduledNewsletter.findUnique({
    where: {
      id: Number(id)
    }
  });
  return scheduledNewsletter;
};

const findScheduledNewsletterByNewsletterId = async (req) => {
  const { newsletterId } = req;
  const scheduledNewsletters = await prisma.scheduledNewsletter.findMany({
    where: {
      newsletterId
    }
  });
  return scheduledNewsletters;
};

exports.createScheduledNewsLetter = createScheduledNewsLetter;
exports.getAllScheduledNewsLetters = getAllScheduledNewsLetters;
exports.updateScheduledNewsLetter = updateScheduledNewsLetter;
exports.deleteScheduledNewsletter = deleteScheduledNewsletter;
exports.findScheduledNewsletterById = findScheduledNewsletterById;
exports.findScheduledNewsletterByNewsletterId =
  findScheduledNewsletterByNewsletterId;
