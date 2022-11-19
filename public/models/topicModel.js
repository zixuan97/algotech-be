const { ContentStatus } = require('@prisma/client');
const { prisma } = require('./index.js');
const subjectModel = require('./subjectModel.js');

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
  const average = await subjectModel.getAverageCompletionRateOfSubject({
    id: subjectId
  });
  await prisma.subject.update({
    where: {
      id: Number(subjectId)
    },
    data: {
      completionRate: average
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
  topic.steps.sort((a, b) => {
    return a.topicOrder - b.topicOrder;
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
      },
      records: {
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

const getTopicByOrderAndSubjectId = async (req) => {
  const { subjectId, subjectOrder } = req;
  const topic = await prisma.topic.findMany({
    where: {
      subjectId: Number(subjectId),
      subjectOrder: Number(subjectOrder)
    }
  });
  return topic[0];
};

const getTopicByTitleAndSubjectId = async (req) => {
  const { subjectId, title } = req;
  const topic = await prisma.topic.findMany({
    where: {
      subjectId: Number(subjectId),
      title
    }
  });
  return topic[0];
};

const markTopicAsCompletedForUser = async (req) => {
  const { topicId, userId } = req;
  const topic = await prisma.topic.findUnique({
    where: { id: Number(topicId) },
    include: {
      steps: true
    }
  });
  let record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: topic.subjectId,
    userId
  });
  record.completedTopics.push(topic);
  await prisma.EmployeeSubjectRecord.update({
    where: {
      id: record.id
    },
    data: {
      completedTopics: {
        set: [],
        connect: record.completedTopics.map((t) => ({
          id: t.id
        }))
      }
    }
  });
  record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: topic.subjectId,
    userId
  });
  const average = await subjectModel.getAverageCompletionRateOfSubject({
    id: topic.subjectId
  });
  await prisma.subject.update({
    where: {
      id: Number(topic.subjectId)
    },
    data: {
      completionRate: average
    }
  });
  return record;
};

const unmarkTopicAsCompletedForUser = async (req) => {
  const { topicId, userId } = req;
  const topic = await prisma.topic.findUnique({
    where: { id: Number(topicId) },
    include: {
      steps: true
    }
  });
  let record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: topic.subjectId,
    userId
  });
  for (var i = record.completedTopics.length - 1; i >= 0; i--) {
    if (record.completedTopics[i].id === topic.id) {
      record.completedTopics.splice(i, 1);
    }
  }
  await prisma.EmployeeSubjectRecord.update({
    where: {
      id: record.id
    },
    data: {
      completedTopics: {
        set: [],
        connect: record.completedTopics.map((t) => ({
          id: t.id
        }))
      }
    }
  });
  record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: topic.subjectId,
    userId
  });
  const average = await subjectModel.getAverageCompletionRateOfSubject({
    id: topic.subjectId
  });
  await prisma.subject.update({
    where: {
      id: Number(topic.subjectId)
    },
    data: {
      completionRate: average
    }
  });
  return record;
};

const getUpdatedSubjectRecord = async (req) => {
  const { subjectId, userId } = req;
  let record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: Number(subjectId),
    userId
  });
  const average = await subjectModel.getAverageCompletionRateOfSubject({
    id: Number(subjectId)
  });
  await prisma.subject.update({
    where: {
      id: Number(subjectId)
    },
    data: {
      completionRate: average
    }
  });
  return record;
};

exports.createTopic = createTopic;
exports.getAllTopicsBySubjectId = getAllTopicsBySubjectId;
exports.getTopicById = getTopicById;
exports.updateTopic = updateTopic;
exports.addStepsToTopic = addStepsToTopic;
exports.deleteTopic = deleteTopic;
exports.updateOrderOfTopicArray = updateOrderOfTopicArray;
exports.getTopicByOrderAndSubjectId = getTopicByOrderAndSubjectId;
exports.getTopicByTitleAndSubjectId = getTopicByTitleAndSubjectId;
exports.markTopicAsCompletedForUser = markTopicAsCompletedForUser;
exports.unmarkTopicAsCompletedForUser = unmarkTopicAsCompletedForUser;
exports.getUpdatedSubjectRecord = getUpdatedSubjectRecord;
