const { ContentStatus } = require('@prisma/client');
const { transformDocument } = require('@prisma/client/runtime/index.js');
const { prisma } = require('./index.js');

const createTopic = async (req) => {
  const { subjectOrder, title, subjectId } = req;
  const topic = await prisma.topic.create({
    data: {
      subjectOrder,
      title,
      status: ContentStatus.DRAFT,
      subjectId
    },
    include: {
      subject: true,
      subject: {
        include: {
          topics: true,
          topics: {
            include: {
              steps: true
            }
          },
          quizzes: true,
          quizzes: {
            include: {
              questions: true
            }
          },
          createdBy: true,
          lastUpdatedBy: true,
          usersAssigned: true,
          usersAssigned: {
            include: {
              user: true
            }
          }
        }
      },
      steps: true
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
      subject: {
        include: {
          topics: true,
          topics: {
            include: {
              steps: true
            }
          },
          quizzes: true,
          quizzes: {
            include: {
              questions: true
            }
          },
          createdBy: true,
          lastUpdatedBy: true,
          usersAssigned: true,
          usersAssigned: {
            include: {
              user: true
            }
          }
        }
      },
      steps: true
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
      subject: {
        include: {
          topics: true,
          topics: {
            include: {
              steps: true
            }
          },
          quizzes: true,
          quizzes: {
            include: {
              questions: true
            }
          },
          createdBy: true,
          lastUpdatedBy: true,
          usersAssigned: true,
          usersAssigned: {
            include: {
              user: true
            }
          }
        }
      },
      steps: true
    }
  });
  return topic;
};

const updateTopic = async (req) => {
  const { id, subjectOrder, title, status, subjectId } = req;
  const topic = await prisma.topic.update({
    where: { id },
    data: {
      subjectOrder,
      title,
      status,
      subjectId
    },
    include: {
      subject: true,
      subject: {
        include: {
          topics: true,
          topics: {
            include: {
              steps: true
            }
          },
          quizzes: true,
          quizzes: {
            include: {
              questions: true
            }
          },
          createdBy: true,
          lastUpdatedBy: true,
          usersAssigned: true,
          usersAssigned: {
            include: {
              user: true
            }
          }
        }
      },
      steps: true
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
          topicOrder: s.topicOrder,
          title: s.title,
          content: s.content
        }))
      }
    },
    include: {
      subject: true,
      subject: {
        include: {
          topics: true,
          topics: {
            include: {
              steps: true
            }
          },
          quizzes: true,
          quizzes: {
            include: {
              questions: true
            }
          },
          createdBy: true,
          lastUpdatedBy: true,
          usersAssigned: true,
          usersAssigned: {
            include: {
              user: true
            }
          }
        }
      },
      steps: true
    }
  });
  topic.steps.sort((a, b) => {
    return a.topicOrder - b.topicOrder;
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

const updateOrderOfTopicArray = async (req) => {
  const { topics } = req;
  let i = 1;
  const res = [];
  for (let t of topics) {
    const newTopic = await updateTopic({
      ...t,
      subjectOrder: t.subjectOrder
    });
    i++;
    res.push(newTopic);
  }
  return res;
};

exports.createTopic = createTopic;
exports.getAllTopicsBySubjectId = getAllTopicsBySubjectId;
exports.getTopicById = getTopicById;
exports.updateTopic = updateTopic;
exports.addStepsToTopic = addStepsToTopic;
exports.deleteTopic = deleteTopic;
exports.updateOrderOfTopicArray = updateOrderOfTopicArray;
