const { prisma } = require('./index.js');

const createNewsletter = async (req) => {
  const {
    emailDate,
    name,
    emailSubject,
    emailBodyTitle,
    emailBody,
    discountCode
  } = req.body;
  const newsletter = await prisma.newsletter.create({
    data: {
      emailDate,
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
    where: {
      id: Number(id)
    }
  });
  return newsletter;
};

exports.createNewsletter = createNewsletter;
exports.getAllNewsletters = getAllNewsletters;
exports.findNewsletterById = findNewsletterById;
