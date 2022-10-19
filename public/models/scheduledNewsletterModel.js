const { prisma } = require('./index.js');

const createScheduledNewsLetter = async (req) => {
  const { newsletterId, customerEmails, sentDate, jobId } = req;

  await prisma.scheduledNewsletter.create({
    data: {
      newsletterId,
      customerEmails,
      sentDate,
      jobId
    }
  });
};

const getAllScheduledNewsLetters = async () => {
  const scheduledNewsletters = await prisma.scheduledNewsletter.findMany({});
  return scheduledNewsletters;
};

const getAllScheduledNewsLettersByJobStatus = async (req) => {
  const { jobStatus } = req;
  const scheduledNewsletters = await prisma.scheduledNewsletter.findMany({
    where: { jobStatus }
  });
  return scheduledNewsletters;
};

const updateScheduledNewsLetter = async (req) => {
  const { id, newsletterId, customerEmails, sentDate, jobId } = req;

  const scheduledNewsletter = await prisma.scheduledNewsletter.update({
    where: { id },
    data: {
      newsletterId,
      customerEmails,
      sentDate,
      jobId
    }
  });
  return scheduledNewsletter;
};

const updateScheduledNewsLetterStatus = async (req) => {
  const { jobId, jobStatus } = req;

  const scheduledNewsletter = await prisma.scheduledNewsletter.update({
    where: { jobId },
    data: {
      jobStatus
    }
  });
  return scheduledNewsletter;
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
exports.updateScheduledNewsLetterStatus = updateScheduledNewsLetterStatus;
exports.getAllScheduledNewsLettersByJobStatus =
  getAllScheduledNewsLettersByJobStatus;
