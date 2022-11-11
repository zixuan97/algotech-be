const { prisma } = require('./index.js');

const createQuizQuestion = async (req) => {
  const {
    quizOrder,
    question,
    type,
    options,
    writtenAnswer,
    minWordCount,
    correctAnswer,
    quizId
  } = req;
  const quizQuestion = await prisma.QuizQuestion.create({
    data: {
      quizOrder,
      question,
      type,
      options,
      writtenAnswer,
      minWordCount,
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
  const {
    id,
    quizOrder,
    question,
    type,
    options,
    writtenAnswer,
    minWordCount,
    correctAnswer,
    quizId
  } = req;
  const quizQuestion = await prisma.QuizQuestion.update({
    where: { id },
    data: {
      quizOrder,
      question,
      type,
      options,
      writtenAnswer,
      minWordCount,
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

exports.createQuizQuestion = createQuizQuestion;
exports.getAllQuizQuestionsByQuizId = getAllQuizQuestionsByQuizId;
exports.getQuizQuestionById = getQuizQuestionById;
exports.updateQuizQuestion = updateQuizQuestion;
exports.deleteQuizQuestion = deleteQuizQuestion;
