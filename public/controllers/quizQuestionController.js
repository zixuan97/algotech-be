const quizQuestionModel = require('../models/quizQuestionModel');
const quizModel = require('../models/quizModel');
const subjectModel = require('../models/subjectModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { ContentStatus } = require('@prisma/client');

const createQuizQuestion = async (req, res) => {
  const { quizOrder, question, type, options, correctAnswer, quizId } =
    req.body;
  const currentOrders = [];
  const quizQuestions = await quizQuestionModel.getAllQuizQuestionsByQuizId({
    quizId
  });
  for (let q of quizQuestions) {
    currentOrders.push(q.quizOrder);
  }
  if (currentOrders.includes(quizOrder)) {
    return res.status(400).send('Quiz order already exists!');
  } else {
    const { subjectId } = await quizModel.getQuizById({ id: quizId });
    const currUserId = req.user.userId;
    await subjectModel.updateSubject({
      id: subjectId,
      lastUpdatedById: currUserId
    });
    const { data, error } = await common.awaitWrap(
      quizQuestionModel.createQuizQuestion({
        quizOrder,
        question,
        type,
        options,
        correctAnswer,
        quizId
      })
    );
    data.quiz.subject.createdBy.password = '';
    data.quiz.subject.lastUpdatedBy.password = '';
    for (let u of data.quiz.subject.usersAssigned) {
      u.user.password = '';
    }
    if (error) {
      log.error('ERR_QUIZQUESTION_CREATE-QUIZQUESTION', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      return res.json(Error.http(error));
    } else {
      log.out('OK_QUIZQUESTION_CREATE-QUIZQUESTION', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

// const getAllQuizQuestionsByQuizId = async (req, res) => {
//   const { quizId } = req.params;
//   const { data, error } = await common.awaitWrap(
//     quizQuestionModel.getAllQuizQuestionsByQuizId({ quizId })
//   );
//   for (let d of data) {
//     d.quiz.subject.createdBy.password = '';
//     d.quiz.subject.lastUpdatedBy.password = '';
//     for (let u of d.quiz.subject.usersAssigned) {
//       u.user.password = '';
//     }
//   }
//   if (error) {
//     log.error('ERR_QUIZQUESTION_GET-ALL-QUIZQUESTIONS', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     return res.json(Error.http(error));
//   } else {
//     log.out('OK_QUIZQUESTION_GET-ALL-QUIZQUESTIONS', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(data)
//     });
//     return res.json(data);
//   }
// };

// const getQuizQuestion = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const quizQuestion = await quizQuestionModel.getQuizQuestionById({ id });
//     log.out('OK_QUIZQUESTION_GET-QUIZQUESTION-BY-ID', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(quizQuestion)
//     });
//     quizQuestion.quiz.subject.createdBy.password = '';
//     quizQuestion.quiz.subject.lastUpdatedBy.password = '';
//     for (let u of quizQuestion.quiz.subject.usersAssigned) {
//       u.user.password = '';
//     }
//     return res.json(quizQuestion);
//   } catch (error) {
//     log.error('ERR_QUIZQUESTION_GET-QUIZQUESTION-BY-ID', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     return res.status(400).send('Error getting quizQuestion');
//   }
// };

const updateQuizQuestion = async (req, res) => {
  const { id, quizOrder, question, type, options, correctAnswer, quizId } =
    req.body;
  const currentOrders = [];
  const quizQuestions = await quizQuestionModel.getAllQuizQuestionsByQuizId({
    quizId
  });
  for (let q of quizQuestions) {
    currentOrders.push(q.quizOrder);
  }
  const currQuizQuestionByOrder =
    await quizQuestionModel.getQuizQuestionByOrderAndQuizId({
      quizId,
      quizOrder
    });
  if (currentOrders.includes(quizOrder) && currQuizQuestionByOrder.id !== id) {
    return res.status(400).send('Quiz order already exists!');
  } else {
    const { subjectId } = await quizModel.getQuizById({ id: quizId });
    const currUserId = req.user.userId;
    await subjectModel.updateSubject({
      id: subjectId,
      lastUpdatedById: currUserId
    });
    const { data, error } = await common.awaitWrap(
      quizQuestionModel.updateQuizQuestion({
        id,
        quizOrder,
        question,
        type,
        options,
        correctAnswer,
        quizId
      })
    );
    data.quiz.subject.createdBy.password = '';
    data.quiz.subject.lastUpdatedBy.password = '';
    for (let u of data.quiz.subject.usersAssigned) {
      u.user.password = '';
    }
    if (error) {
      log.error('ERR_QUIZQUESTION_UPDATE-QUIZQUESTION', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_QUIZQUESTION_UPDATE-QUIZQUESTION', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

const deleteQuizQuestion = async (req, res) => {
  const { id } = req.params;
  const { quizId } = await quizQuestionModel.getQuizQuestionById({ id });
  const quiz = await quizModel.getQuizById({ id: quizId });
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: quiz.subjectId,
    lastUpdatedById: currUserId
  });
  const { error } = await common.awaitWrap(
    quizQuestionModel.deleteQuizQuestion({ id })
  );
  if (error) {
    log.error('ERR_QUIZQUESTION_DELETE-QUIZQUESTION', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    if (quiz.questions.length === 1) {
      await quizModel.updateQuiz({
        id: quiz.id,
        status: ContentStatus.DRAFT
      });
    }
    log.out('OK_QUIZQUESTION_DELETE-QUIZQUESTION', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted quizQuestion with id:${id}` }
    });
    return res.json({ message: `Deleted quizQuestion with id:${id}` });
  }
};

const updateOrderBasedOnQuestionsArray = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    quizQuestionModel.updateOrderOfQuestionsArray({ questions: req.body })
  );
  if (error) {
    log.error('ERR_QUIZQUESTION_UPDATE-ORDER-QUIZ-QUESTION', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_QUIZQUESTION_UPDATE-ORDER-QUIZ-QUESTION', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const createEmployeeQuizQuestionRecord = async (req, res) => {
  const { quizQuestions } = req.body;
  const currUserId = req.user.userId;
  if (quizQuestions.length === 0) {
    return res.status(400).send('You cannot submit an empty attempt!');
  } else {
    const { data, error } = await common.awaitWrap(
      quizQuestionModel.createEmployeeQuizQuestionRecord({
        quizQuestions,
        userId: currUserId
      })
    );
    const { quiz } = await quizQuestionModel.getQuizQuestionById({
      id: quizQuestions[0].questionId
    });
    await subjectModel.updateLastAttemptedTimeInSubjectRecord({
      subjectId: quiz.subjectId,
      userId: currUserId
    });
    for (let d of data) {
      d.user.password = '';
    }
    if (error) {
      log.error('ERR_QUIZQUESTION_CREATE-EMPLOYEE-QUIZ-QUESTION-RECORD', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_QUIZQUESTION_CREATE-EMPLOYEE-QUIZ-QUESTION-RECORD', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

const updateEmployeeQuizQuestionRecord = async (req, res) => {
  const { quizQuestions } = req.body;
  const currUserId = req.user.userId;
  const { data, error } = await common.awaitWrap(
    quizQuestionModel.updateEmployeeQuizQuestionRecord({
      quizQuestions,
      userId: currUserId
    })
  );
  if (quizQuestions.length > 0) {
    const { quiz } = await quizQuestionModel.getQuizQuestionById({
      id: quizQuestions[0].questionId
    });
    await subjectModel.updateLastAttemptedTimeInSubjectRecord({
      subjectId: quiz.subjectId,
      userId: currUserId
    });
  }
  if (error) {
    log.error('ERR_QUIZQUESTION_UPDATE-EMPLOYEE-QUIZ-QUESTION-RECORD', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_QUIZQUESTION_UPDATE-EMPLOYEE-QUIZ-QUESTION-RECORD', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

// const getEmployeeQuizQuestionRecords = async (req, res) => {
//   const { quizId, userId } = req.body;
//   const { data, error } = await common.awaitWrap(
//     quizQuestionModel.getEmployeeQuizRecordsByQuizIdAndUser({
//       quizId,
//       userId
//     })
//   );
//   if (error) {
//     log.error('ERR_QUIZQUESTION_GET-EMPLOYEE-QUIZ-QUESTION-RECORD', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     const e = Error.http(error);
//     return res.status(e.code).json(e.message);
//   } else {
//     log.out('OK_QUIZQUESTION_GET-EMPLOYEE-QUIZ-QUESTION-RECORD', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(data)
//     });
//     return res.json(data);
//   }
// };

exports.createQuizQuestion = createQuizQuestion;
// exports.getAllQuizQuestionsByQuizId = getAllQuizQuestionsByQuizId;
// exports.getQuizQuestion = getQuizQuestion;
exports.updateQuizQuestion = updateQuizQuestion;
exports.deleteQuizQuestion = deleteQuizQuestion;
exports.updateOrderBasedOnQuestionsArray = updateOrderBasedOnQuestionsArray;
exports.createEmployeeQuizQuestionRecord = createEmployeeQuizQuestionRecord;
exports.updateEmployeeQuizQuestionRecord = updateEmployeeQuizQuestionRecord;
// exports.getEmployeeQuizQuestionRecords = getEmployeeQuizQuestionRecords;
