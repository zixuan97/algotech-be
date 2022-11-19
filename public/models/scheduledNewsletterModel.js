const { prisma } = require('./index.js');

const createScheduledNewsLetter = async (req) => {
  const { newsletterId, customerEmails, sentDate, jobId } = req;

  return await prisma.scheduledNewsletter.create({
    data: {
      newsletterId,
      customerEmails,
      sentDate,
      jobId
    }
  });
};

const getAllScheduledNewsLetters = async (req) => {
  const { time_from, time_to } = req;
  const scheduledNewsletters = await prisma.scheduledNewsletter.findMany({
    where: {
      sentDate: {
        lte: time_to, //last date
        gte: time_from //first date
      }
    },
    include: {
      newsletter: true
    }
  });
  return scheduledNewsletters;
};

const getAllScheduledNewsLettersByJobStatus = async (req) => {
  const { jobStatus, time_from, time_to } = req;
  const scheduledNewsletters = await prisma.scheduledNewsletter.findMany({
    where: {
      jobStatus,
      sentDate: {
        lte: time_to, //last date
        gte: time_from //first date
      }
    },
    include: {
      newsletter: true
    }
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
    },
    include: {
      newsletter: true
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
    },
    include: {
      newsletter: true
    }
  });
  return scheduledNewsletter;
};

const deleteScheduledNewsletter = async (req) => {
  const { id } = req;
  return await prisma.scheduledNewsletter.delete({
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
    },
    include: {
      newsletter: true
    }
  });
  return scheduledNewsletter;
};

const findScheduledNewsletterByNewsletterId = async (req) => {
  const { newsletterId } = req;
  const scheduledNewsletters = await prisma.scheduledNewsletter.findMany({
    where: {
      newsletterId
    },
    include: {
      newsletter: true
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
