const { prisma } = require('./index.js');
const subjectModel = require('./subjectModel.js');
const quizQuestionModel = require('./quizQuestionModel.js');

const createQuiz = async (req) => {
  const {
    subjectOrder,
    title,
    description,
    passingScore,
    completionRate,
    subjectId
  } = req;
  const quiz = await prisma.quiz.create({
    data: {
      subjectOrder,
      title,
      description,
      passingScore,
      completionRate,
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
      questions: true
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
  return quiz;
};

const getAllQuizzesBySubjectId = async (req) => {
  const { subjectId } = req;
  const quizzes = await prisma.quiz.findMany({
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
      questions: true
    }
  });
  return quizzes;
};

const getQuizById = async (req) => {
  const { id } = req;
  const quiz = await prisma.quiz.findUnique({
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
      questions: true
    }
  });
  quiz.questions.sort((a, b) => {
    return a.quizOrder - b.quizOrder;
  });
  return quiz;
};

const updateQuiz = async (req) => {
  const {
    id,
    subjectOrder,
    title,
    description,
    passingScore,
    completionRate,
    status
  } = req;
  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      subjectOrder,
      title,
      description,
      passingScore,
      completionRate,
      status
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
      questions: true
    }
  });
  return quiz;
};

const addQuizQuestionsToQuiz = async (req) => {
  const { id, questions } = req;
  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      questions: {
        create: questions.map((qn) => ({
          quizOrder: qn.quizOrder,
          question: qn.question,
          type: qn.type,
          options: qn.options,
          correctAnswer: qn.correctAnswer
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
      questions: true
    }
  });
  quiz.questions.sort((a, b) => {
    return a.quizOrder - b.quizOrder;
  });
  return quiz;
};

const deleteQuiz = async (req) => {
  const { id } = req;
  const quizQuestions = await quizQuestionModel.getAllQuizQuestionsByQuizId({
    quizId: id
  });
  for (let q of quizQuestions) {
    quizQuestionModel.deleteQuizQuestion({ id: q.id });
  }
  await prisma.quiz.update({
    where: {
      id: Number(id)
    },
    data: {
      questions: {
        deleteMany: {}
      },
      records: {
        deleteMany: {}
      }
    }
  });
  await prisma.quiz.delete({
    where: {
      id: Number(id)
    }
  });
};

const updateOrderOfQuizArray = async (req) => {
  const { quizzes } = req;
  let i = 1;
  const res = [];
  for (let q of quizzes) {
    const newQuiz = await updateQuiz({
      ...q,
      subjectOrder: q.subjectOrder
    });
    i++;
    res.push(newQuiz);
  }
  return res;
};

const getQuizByOrderAndSubjectId = async (req) => {
  const { subjectId, subjectOrder } = req;
  const quiz = await prisma.quiz.findMany({
    where: {
      subjectId: Number(subjectId),
      subjectOrder
    }
  });
  return quiz[0];
};

const getQuizByTitleAndSubjectId = async (req) => {
  const { subjectId, title } = req;
  const quiz = await prisma.quiz.findMany({
    where: {
      subjectId: Number(subjectId),
      title
    }
  });
  return quiz[0];
};

const markQuizAsCompletedForUser = async (req) => {
  const { quizId, userId } = req;
  const quiz = await prisma.quiz.findUnique({
    where: { id: Number(quizId) },
    include: {
      questions: true
    }
  });
  let record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: quiz.subjectId,
    userId
  });
  record.completedQuizzes.push(quiz);
  await prisma.EmployeeSubjectRecord.update({
    where: {
      id: record.id
    },
    data: {
      completedQuizzes: {
        set: [],
        connect: record.completedQuizzes.map((q) => ({
          id: q.id
        }))
      }
    }
  });
  record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: quiz.subjectId,
    userId
  });
  const average = await subjectModel.getAverageCompletionRateOfSubject({
    id: quiz.subjectId
  });
  await prisma.subject.update({
    where: {
      id: Number(quiz.subjectId)
    },
    data: {
      completionRate: average
    }
  });
  return record;
};

const unmarkQuizAsCompletedForUser = async (req) => {
  const { quizId, userId } = req;
  const quiz = await prisma.quiz.findUnique({
    where: { id: Number(quizId) },
    include: {
      questions: true
    }
  });
  let record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: quiz.subjectId,
    userId
  });
  for (var i = record.completedQuizzes.length - 1; i >= 0; i--) {
    if (record.completedQuizzes[i].id === quiz.id) {
      record.completedQuizzes.splice(i, 1);
    }
  }
  await prisma.EmployeeSubjectRecord.update({
    where: {
      id: record.id
    },
    data: {
      completedQuizzes: {
        set: [],
        connect: record.completedQuizzes.map((q) => ({
          id: q.id
        }))
      }
    }
  });
  record = await subjectModel.getSubjectRecordBySubjectAndUser({
    subjectId: quiz.subjectId,
    userId
  });
  const average = await subjectModel.getAverageCompletionRateOfSubject({
    id: quiz.subjectId
  });
  await prisma.subject.update({
    where: {
      id: Number(quiz.subjectId)
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

exports.createQuiz = createQuiz;
exports.getAllQuizzesBySubjectId = getAllQuizzesBySubjectId;
exports.getQuizById = getQuizById;
exports.updateQuiz = updateQuiz;
exports.addQuizQuestionsToQuiz = addQuizQuestionsToQuiz;
exports.deleteQuiz = deleteQuiz;
exports.updateOrderOfQuizArray = updateOrderOfQuizArray;
exports.getQuizByOrderAndSubjectId = getQuizByOrderAndSubjectId;
exports.getQuizByTitleAndSubjectId = getQuizByTitleAndSubjectId;
exports.markQuizAsCompletedForUser = markQuizAsCompletedForUser;
exports.unmarkQuizAsCompletedForUser = unmarkQuizAsCompletedForUser;
exports.getUpdatedSubjectRecord = getUpdatedSubjectRecord;
