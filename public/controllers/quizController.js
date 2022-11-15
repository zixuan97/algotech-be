const quizModel = require('../models/quizModel');
const quizQuestionModel = require('../models/quizQuestionModel');
const subjectModel = require('../models/subjectModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createQuiz = async (req, res) => {
  const {
    subjectOrder,
    title,
    description,
    passingScore,
    questions,
    subjectId
  } = req.body;
  const currentOrders = [];
  const currTitles = [];
  const quizzes = await quizModel.getAllQuizzesBySubjectId({ subjectId });
  for (let q of quizzes) {
    currentOrders.push(q.subjectOrder);
    currTitles.push(q.title);
  }
  if (currentOrders.includes(subjectOrder)) {
    res.status(400).send('Subject order already exists!');
  } else if (currTitles.includes(title)) {
    res.status(400).send(`Title already exists for subject ID ${subjectId}!`);
  } else {
    const currUserId = req.user.userId;
    await subjectModel.updateSubject({
      id: subjectId,
      lastUpdatedById: currUserId
    });
    const { data, error } = await common.awaitWrap(
      quizModel.createQuiz({
        subjectOrder,
        title,
        description,
        passingScore,
        questions,
        subjectId
      })
    );
    data.subject.createdBy.password = '';
    data.subject.lastUpdatedBy.password = '';
    for (let u of data.subject.usersAssigned) {
      u.user.password = '';
    }
    if (error) {
      log.error('ERR_QUIZ_CREATE-QUIZ', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      res.json(Error.http(error));
    } else {
      log.out('OK_QUIZ_CREATE-QUIZ', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      res.json(data);
    }
  }
};

const getAllQuizzesBySubjectId = async (req, res) => {
  const { subjectId } = req.params;
  const { data, error } = await common.awaitWrap(
    quizModel.getAllQuizzesBySubjectId({ subjectId })
  );
  for (let d of data) {
    d.subject.createdBy.password = '';
    d.subject.lastUpdatedBy.password = '';
    for (let u of d.subject.usersAssigned) {
      u.user.password = '';
    }
  }
  if (error) {
    log.error('ERR_QUIZ_GET-ALL-QUIZZES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_QUIZ_GET-ALL-QUIZZES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await quizModel.getQuizById({ id });
    quiz.subject.createdBy.password = '';
    quiz.subject.lastUpdatedBy.password = '';
    for (let u of quiz.subject.usersAssigned) {
      u.user.password = '';
    }
    log.out('OK_QUIZ_GET-QUIZ-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(quiz)
    });
    res.json(quiz);
  } catch (error) {
    log.error('ERR_QUIZ_GET-QUIZ-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting quiz');
  }
};

const updateQuiz = async (req, res) => {
  const {
    id,
    subjectOrder,
    title,
    description,
    passingScore,
    status,
    completionRate,
    subjectId
  } = req.body;
  const currentOrders = [];
  const currTitles = [];
  const quizzes = await quizModel.getAllQuizzesBySubjectId({ subjectId });
  for (let q of quizzes) {
    currentOrders.push(q.subjectOrder);
    currTitles.push(q.title);
  }
  const currQuizByOrder = await quizModel.getQuizByOrderAndSubjectId({
    subjectId,
    subjectOrder
  });
  const currQuizByTitle = await quizModel.getQuizByTitleAndSubjectId({
    subjectId,
    title
  });
  if (currentOrders.includes(subjectOrder) && currQuizByOrder.id !== id) {
    res.status(400).send('Subject order already exists!');
  } else if (currTitles.includes(title) && currQuizByTitle.id !== id) {
    res.status(400).send(`Title already exists for subject ID ${subjectId}!`);
  } else {
    const currUserId = req.user.userId;
    await subjectModel.updateSubject({
      id: subjectId,
      lastUpdatedById: currUserId
    });
    const { data, error } = await common.awaitWrap(
      quizModel.updateQuiz({
        id,
        subjectOrder,
        title,
        description,
        passingScore,
        status,
        completionRate,
        subjectId
      })
    );
    data.subject.createdBy.password = '';
    data.subject.lastUpdatedBy.password = '';
    for (let u of data.subject.usersAssigned) {
      u.user.password = '';
    }
    if (error) {
      log.error('ERR_QUIZ_UPDATE-QUIZ', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_QUIZ_UPDATE-QUIZ', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      res.json(data);
    }
  }
};

const addQuizQuestionsToQuiz = async (req, res) => {
  const { id, questions } = req.body;
  const currentOrders = [];
  let questionsToAdd = [];
  const quizQuestions = await quizQuestionModel.getAllQuizQuestionsByQuizId({
    quizId: id
  });
  for (let q of quizQuestions) {
    currentOrders.push(q.quizOrder);
  }
  for (let qn of questions) {
    if (!currentOrders.includes(qn.quizOrder)) {
      questionsToAdd.push(qn);
    }
  }
  if (questionsToAdd.length === 0) {
    res.status(400).send('All quiz orders already exists!');
  } else {
    const { subjectId } = await quizModel.getQuizById({ id });
    const currUserId = req.user.userId;
    await subjectModel.updateSubject({
      id: subjectId,
      lastUpdatedById: currUserId
    });
    const { data, error } = await common.awaitWrap(
      quizModel.addQuizQuestionsToQuiz({
        id,
        questions: questionsToAdd
      })
    );
    data.subject.createdBy.password = '';
    data.subject.lastUpdatedBy.password = '';
    for (let u of data.subject.usersAssigned) {
      u.user.password = '';
    }
    if (error) {
      log.error('ERR_QUIZ_ADD-QUIZQUESTION-TO-QUIZ', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_QUIZ_ADD-QUIZQUESTION-TO-QUIZ', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      res.json(data);
    }
  }
};

const deleteQuiz = async (req, res) => {
  const { id } = req.params;
  const { subjectId } = await quizModel.getQuizById({ id });
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: subjectId,
    lastUpdatedById: currUserId
  });
  const { error } = await common.awaitWrap(quizModel.deleteQuiz({ id }));
  if (error) {
    log.error('ERR_QUIZ_DELETE-QUIZ', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_QUIZ_DELETE-QUIZ', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted quiz with id:${id}` }
    });
    res.json({ message: `Deleted quiz with id:${id}` });
  }
};

const updateOrderBasedOnQuizArray = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    quizModel.updateOrderOfQuizArray({ quizzes: req.body })
  );
  if (error) {
    log.error('ERR_STEP_UPDATE-ORDER-QUIZ', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_STEP_UPDATE-ORDER-QUIZ', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const markQuizAsCompletedByUser = async (req, res) => {
  const { quizId, userId } = req.body;
  const { data, error } = await common.awaitWrap(
    quizModel.markQuizAsCompletedForUser({ quizId, userId })
  );
  data.user.password = '';
  if (error) {
    log.error('ERR_STEP_UPDATE-MARK-QUIZ-AS-COMPLETED', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_STEP_UPDATE-MARK-QUIZ-AS-COMPLETED', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getQuizResults = async (req, res) => {
  const { quizId, userAnswers } = req.body;
  const { data, error } = await common.awaitWrap(
    quizModel.getQuizResults({ quizId, userAnswers })
  );
  if (error) {
    log.error('ERR_STEP_GET-QUIZ-RESULTS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_STEP_GET-QUIZ-RESULTS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

exports.createQuiz = createQuiz;
exports.getAllQuizzesBySubjectId = getAllQuizzesBySubjectId;
exports.getQuiz = getQuiz;
exports.updateQuiz = updateQuiz;
exports.addQuizQuestionsToQuiz = addQuizQuestionsToQuiz;
exports.deleteQuiz = deleteQuiz;
exports.updateOrderBasedOnQuizArray = updateOrderBasedOnQuizArray;
exports.markQuizAsCompletedByUser = markQuizAsCompletedByUser;
exports.getQuizResults = getQuizResults;
