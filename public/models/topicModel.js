const { ContentStatus } = require('@prisma/client');
const { prisma } = require('./index.js');

const createTopic = async (req) => {
  const { subjectOrder, name, subjectId } = req;
  const topic = await prisma.topic.create({
    data: {
      subjectOrder,
      name,
      status: ContentStatus.DRAFT,
      subjectId
    },
    include: {
      subject: true,
      steps: true,
      steps: {
        include: {
          topic: true
        }
      }
    }
  });
  return topic;
};

const getAllTopicsBySubjectId = async (req) => {
  const { subjectId } = req;
  const topics = await prisma.topic.findMany({
    where: { subjectId: Number(subjectId) },
    include: {
      subject: true,
      steps: true,
      steps: {
        include: {
          topic: true
        }
      }
    }
  });
  topics.sort((a, b) => {
    return a.subjectOrder - b.subjectOrder;
  });
  return topics;
};

const getTopicById = async (req) => {
  const { id } = req;
  const topic = await prisma.topic.findUnique({
    where: { id: Number(id) },
    include: {
      subject: true,
      steps: true,
      steps: {
        include: {
          topic: true
        }
      }
    }
  });
  return topic;
};

const getTopicByName = async (req) => {
  const { name } = req;
  const topic = await prisma.topic.findUnique({
    where: { name },
    include: {
      subject: true,
      steps: true,
      steps: {
        include: {
          topic: true
        }
      }
    }
  });
  return topic;
};

const updateTopic = async (req) => {
  const { id, subjectOrder, name, status, subjectId } = req;
  const topic = await prisma.topic.update({
    where: { id },
    data: {
      subjectOrder,
      name,
      status,
      subjectId
    },
    include: {
      subject: true,
      steps: true,
      steps: {
        include: {
          topic: true
        }
      }
    }
  });
  return topic;
};

const addStepsToTopic = async (req) => {
  const { id, steps } = req;
  const topic = await prisma.topic.update({
    where: { id },
    data: {
      steps: {
        create: steps.map((s) => ({
          title: s.title,
          content: s.content
        }))
      }
    },
    include: {
      subject: true,
      steps: true,
      steps: {
        include: {
          topic: true
        }
      }
    }
  });
  return topic;
};

const deleteTopic = async (req) => {
  const { id } = req;
  await prisma.topic.update({
    where: {
      id: Number(id)
    },
    data: {
      steps: {
        deleteMany: {}
      }
    }
  });
  await prisma.topic.delete({
    where: {
      id: Number(id)
    }
  });
};

exports.createTopic = createTopic;
exports.getAllTopicsBySubjectId = getAllTopicsBySubjectId;
exports.getTopicById = getTopicById;
exports.getTopicByName = getTopicByName;
exports.updateTopic = updateTopic;
exports.addStepsToTopic = addStepsToTopic;
exports.deleteTopic = deleteTopic;
