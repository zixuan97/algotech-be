const { prisma } = require('./index.js');

const createQuiz = async (req) => {
  const { title, description, passingScore, completionRate, questions } = req;
  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      passingScore,
      completionRate,
      questions
    }
  });
  return quiz;
};

const connectOrCreateQuizQuestion = async (req) => {
  const {
    question,
    type,
    options,
    writtenAnswer,
    minWordCount,
    correctAnswer,
    quizId
  } = req;
  const quizQuestion = await prisma.QuizQuestion.upsert({
    where: {
      question_quizId: {
        question,
        quizId
      }
    },
    update: {
      type,
      options,
      writtenAnswer,
      minWordCount,
      correctAnswer
    },
    create: {
      question,
      type,
      options,
      writtenAnswer,
      minWordCount,
      correctAnswer,
      quizId
    }
  });
  return quizQuestion;
};

const getAllQuizzes = async () => {
  const quizzes = await prisma.quiz.findMany({});
  return quizzes;
};

const getQuizById = async (req) => {
  const { id } = req;
  const quiz = await prisma.quiz.findUnique({
    where: { id: Number(id) }
  });
  return quiz;
};

const getAllQuizQuestionsByQuizId = async () => {
  const { quizId } = req;
  const quizzes = await prisma.QuizQuestion.findMany({
    where: { quizId: Number(quizId) }
  });
  return quizzes;
};

const updateQuiz = async (req) => {
  const { title, description, passingScore, completionRate, questions } = req;
  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      title,
      description,
      passingScore,
      completionRate,
      questions
    }
  });
  return quiz;
};

const deleteQuizQuestion = async (req) => {
  const { questionId } = req;
  await prisma.quiz.delete({
    where: {
      questionId: Number(questionId)
    }
  });
};

const deleteQuiz = async (req) => {
  const { id } = req;
  await prisma.quiz.delete({
    where: {
      id: Number(id)
    }
  });
};

exports.createLeave = createLeave;
exports.getAllLeaves = getAllLeaves;
exports.getLeaveById = getLeaveById;
exports.getAllLeavesByEmployeeId = getAllLeavesByEmployeeId;
exports.updateLeave = updateLeave;
exports.deleteLeave = deleteLeave;
