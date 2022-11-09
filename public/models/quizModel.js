const { prisma } = require('./index.js');

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
          usersAssigned: true
        }
      }
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
          usersAssigned: true
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
          usersAssigned: true
        }
      },
      questions: true
    }
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
          usersAssigned: true
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
          writtenAnswer: qn.writtenAnswer,
          minWordCount: qn.minWordCount,
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
          usersAssigned: true
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
  await prisma.quiz.update({
    where: {
      id: Number(id)
    },
    data: {
      questions: {
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

exports.createQuiz = createQuiz;
exports.getAllQuizzesBySubjectId = getAllQuizzesBySubjectId;
exports.getQuizById = getQuizById;
exports.updateQuiz = updateQuiz;
exports.addQuizQuestionsToQuiz = addQuizQuestionsToQuiz;
exports.deleteQuiz = deleteQuiz;
