const { prisma } = require('./index.js');

const createNewsletter = async (req) => {
  const { name, emailSubject, emailBodyTitle, emailBody, discountCode } = req;
  const newsletter = await prisma.newsletter.create({
    data: {
      name,
      emailSubject,
      emailBodyTitle,
      emailBody,
      discountCode
    }
  });
  return newsletter;
};

const getAllNewsletters = async () => {
  const newsletter = await prisma.newsletter.findMany({});
  return newsletter;
};

const findNewsletterById = async (req) => {
  const { id } = req;
  const newsletter = await prisma.newsletter.findUnique({
    where: { id: Number(id) }
  });
  return newsletter;
};

const updateNewsletter = async (req) => {
  const { id, name, emailSubject, emailBodyTitle, emailBody, discountCode } =
    req;
  newsletter = await prisma.newsletter.update({
    where: { id },
    data: {
      name,
      emailSubject,
      emailBodyTitle,
      emailBody,
      discountCode
    }
  });
  return newsletter;
};

const deleteNewsletter = async (req) => {
  const { id } = req;
  await prisma.newsletter.update({
    where: {
      id: Number(id)
    },
    data: {
      scheduledNewsletter: { deleteMany: {} }
    }
  });
  return await prisma.newsletter.delete({
    where: {
      id: Number(id)
    }
  });
};

exports.createNewsletter = createNewsletter;
exports.getAllNewsletters = getAllNewsletters;
exports.findNewsletterById = findNewsletterById;
exports.updateNewsletter = updateNewsletter;
exports.deleteNewsletter = deleteNewsletter;
