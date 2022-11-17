const { prisma } = require('./index.js');
const { AnswerType } = require('@prisma/client');

const createQuizQuestion = async (req) => {
  const { quizOrder, question, type, options, correctAnswer, quizId } = req;
  const quizQuestion = await prisma.QuizQuestion.create({
    data: {
      quizOrder,
      question,
      type,
      options,
      correctAnswer,
      quizId
    },
    include: {
      quiz: true,
      quiz: {
        include: {
          subject: true,
          subject: {
            include: {
              createdBy: true,
              lastUpdatedBy: true,
              usersAssigned: true,
              usersAssigned: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  });
  return quizQuestion;
};

const getAllQuizQuestionsByQuizId = async (req) => {
  const { quizId } = req;
  const quizQuestions = await prisma.QuizQuestion.findMany({
    where: { quizId: Number(quizId) },
    include: {
      quiz: true,
      quiz: {
        include: {
          subject: true,
          subject: {
            include: {
              createdBy: true,
              lastUpdatedBy: true,
              usersAssigned: true,
              usersAssigned: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  });
  quizQuestions.sort((a, b) => {
    return a.quizOrder - b.quizOrder;
  });
  return quizQuestions;
};

const getQuizQuestionById = async (req) => {
  const { id } = req;
  const quizQuestion = await prisma.QuizQuestion.findUnique({
    where: { id: Number(id) },
    include: {
      quiz: true,
      quiz: {
        include: {
          subject: true,
          subject: {
            include: {
              createdBy: true,
              lastUpdatedBy: true,
              usersAssigned: true,
              usersAssigned: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  });
  return quizQuestion;
};

const updateQuizQuestion = async (req) => {
  const { id, quizOrder, question, type, options, correctAnswer, quizId } = req;
  const quizQuestion = await prisma.QuizQuestion.update({
    where: { id },
    data: {
      quizOrder,
      question,
      type,
      options,
      correctAnswer,
      quizId
    },
    include: {
      quiz: true,
      quiz: {
        include: {
          subject: true,
          subject: {
            include: {
              createdBy: true,
              lastUpdatedBy: true,
              usersAssigned: true,
              usersAssigned: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  });
  return quizQuestion;
};

const deleteQuizQuestion = async (req) => {
  const { id } = req;
  await prisma.QuizQuestion.delete({
    where: {
      id: Number(id)
    }
  });
};

const updateOrderOfQuestionsArray = async (req) => {
  const { questions } = req;
  let i = 1;
  const res = [];
  for (let q of questions) {
    const newQuestion = await updateQuizQuestion({
      ...q,
      quizOrder: q.quizOrder
    });
    i++;
    res.push(newQuestion);
  }
  return res;
};

const getQuizQuestionByOrderAndQuizId = async (req) => {
  const { quizId, quizOrder } = req;
  const quiz = await prisma.QuizQuestion.findMany({
    where: {
      quizId: Number(quizId),
      quizOrder
    }
  });
  return quiz[0];
};

const createEmployeeQuizQuestionRecord = async (req) => {
  const { quizQuestions, userId } = req;
  let res = [];
  let totalCorrect = 0;
  for (let q of quizQuestions) {
    const { options, correctAnswer, type, quizId } = await getQuizQuestionById({
      id: q.questionId
    });
    if (type === AnswerType.TRUEFALSE) options = ['T', 'F'];
    const qn = await prisma.EmployeeQuizQuestionRecord.create({
      data: {
        questionId: q.questionId,
        userId,
        userAnswer: q.userAnswer,
        isCorrect: correctAnswer === q.userAnswer,
        attemptedAt: new Date(Date.now()),
        quizId
      }
    });
    if (correctAnswer === q.userAnswer) totalCorrect++;
    res.push(qn);
  }
  const results = (totalCorrect / quizQuestions.length) * 100;
  const finalRes = {
    numQnsCorrect: totalCorrect,
    totalQns: quizQuestions.length,
    results: results
  };
  finalRes.quizQuestions = res;
  return finalRes;
};

const updateEmployeeQuizQuestionRecord = async (req) => {
  const { quizQuestions, userId } = req;
  let res = [];
  let totalCorrect = 0;
  for (let q of quizQuestions) {
    const { correctAnswer, quizId } = await getQuizQuestionById({
      id: q.questionId
    });
    const qn = await prisma.EmployeeQuizQuestionRecord.update({
      where: {
        id: Number(q.id)
      },
      data: {
        questionId: q.questionId,
        userId,
        userAnswer: q.userAnswer,
        isCorrect: correctAnswer === q.userAnswer,
        quizId
      }
    });
    if (correctAnswer === q.userAnswer) totalCorrect++;
    res.push(qn);
  }
  const results = (totalCorrect / quizQuestions.length) * 100;
  const finalRes = {
    numQnsCorrect: totalCorrect,
    totalQns: quizQuestions.length,
    results: results
  };
  finalRes.quizQuestions = res;
  return finalRes;
};

const getEmployeeQuizRecordsByQuizIdAndUser = async (req) => {
  const { quizId, userId, attemptedAt } = req;
  const quizQuestions = await prisma.EmployeeQuizQuestionRecord.findMany({
    where: {
      quizId: Number(quizId),
      userId: Number(userId)
    }
  });
  return quizQuestions;
};

// const getLatestEmployeeQuizQuestionRecord = async (req) => {
//   const { questionId } = req;
//   const quizQuestions = await prisma.EmployeeQuizQuestionRecord.findMany({
//   select: {
//     branch: {
//       select: {
//         name: true,
//         commits: {
//           orderBy: {
//             createdAt: 'desc',
//           },
//           take: 1,
//         },
//       },
//     },
//   },
// });

exports.createQuizQuestion = createQuizQuestion;
exports.getAllQuizQuestionsByQuizId = getAllQuizQuestionsByQuizId;
exports.getQuizQuestionById = getQuizQuestionById;
exports.updateQuizQuestion = updateQuizQuestion;
exports.deleteQuizQuestion = deleteQuizQuestion;
exports.updateOrderOfQuestionsArray = updateOrderOfQuestionsArray;
exports.getQuizQuestionByOrderAndQuizId = getQuizQuestionByOrderAndQuizId;
exports.createEmployeeQuizQuestionRecord = createEmployeeQuizQuestionRecord;
exports.updateEmployeeQuizQuestionRecord = updateEmployeeQuizQuestionRecord;
exports.getEmployeeQuizRecordsByQuizIdAndUser =
  getEmployeeQuizRecordsByQuizIdAndUser;
