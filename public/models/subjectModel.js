const { prisma } = require('./index.js');
const topicModel = require('./topicModel.js');
const quizModel = require('./quizModel.js');

const createSubject = async (req) => {
  const { description, isPublished, type } = req;
  const subject = await prisma.subject.create({
    data: {
      description,
      isPublished,
      lastUpdated: new Date(Date.now()),
      type
    },
    include: {
      topics: true,
      topics: {
        include: {
          steps: true,
          steps: {
            include: {
              topic: true
            }
          }
        }
      },
      quizzes: true,
      quizzes: {
        include: {
          questions: true,
          questions: {
            include: {
              quiz: true
            }
          }
        }
      },
      usersAssigned: true
    }
  });
  return subject;
};

const getAllSubjects = async () => {
  const subjects = await prisma.subject.findMany({
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
      usersAssigned: true
    }
  });
  return subjects;
};

const getSubjectById = async (req) => {
  const { id } = req;
  const subject = await prisma.subject.findUnique({
    where: {
      id: Number(id)
    },
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
      usersAssigned: true
    }
  });
  return subject;
};

const updateSubject = async (req) => {
  const {
    id,
    description,
    isPublished,
    completionRate,
    type,
    quizzes,
    topics,
    usersAssigned
  } = req;
  const subject = await prisma.subject.update({
    where: { id },
    data: {
      description,
      isPublished,
      completionRate,
      lastUpdated: new Date(Date.now()),
      type,
      quizzes,
      topics,
      usersAssigned
    },
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
      usersAssigned: true
    }
  });
  return subject;
};

const deleteSubject = async (req) => {
  const { id } = req;
  const topicsUnderSubject = await topicModel.getAllTopicsBySubjectId({
    subjectId: id
  });
  console.log(topicsUnderSubject);
  for (let t of topicsUnderSubject) {
    topicModel.deleteTopic({ id: t.id });
  }
  const quizzesUnderSubject = await quizModel.getAllQuizzesBySubjectId({
    subjectId: id
  });
  for (let q of quizzesUnderSubject) {
    quizModel.deleteQuiz({ id: q.id });
  }
  await prisma.subject.update({
    where: {
      id: Number(id)
    },
    data: {
      topics: {
        deleteMany: {}
      },
      quizzes: {
        deleteMany: {}
      },
      usersAssigned: {
        deleteMany: {}
      }
    }
  });
  await prisma.subject.delete({
    where: {
      id: Number(id)
    }
  });
};

const assignUsersToSubject = async (req) => {
  const { id, users } = req;
  const subject = await prisma.subject.update({
    where: { id },
    data: {
      usersAssigned: {
        connect: users.map((u) => ({
          id: u.id
        }))
      }
    },
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
      usersAssigned: true
    }
  });
  return subject;
};

exports.createSubject = createSubject;
exports.getAllSubjects = getAllSubjects;
exports.getSubjectById = getSubjectById;
exports.updateSubject = updateSubject;
exports.deleteSubject = deleteSubject;
exports.assignUsersToSubject = assignUsersToSubject;
