const quizModel = require('../models/quizModel');
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
};

const getAllQuizzesBySubjectId = async (req, res) => {
  const { subjectId } = req.params;
  const { data, error } = await common.awaitWrap(
    quizModel.getAllQuizzesBySubjectId({ subjectId })
  );
  for (let d of data) {
    d.subject.createdBy.password = '';
    d.subject.lastUpdatedBy.password = '';
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
};

const addQuizQuestionsToQuiz = async (req, res) => {
  const { id, questions } = req.body;
  const { data, error } = await common.awaitWrap(
    quizModel.addQuizQuestionsToQuiz({
      id,
      questions
    })
  );
  data.subject.createdBy.password = '';
  data.subject.lastUpdatedBy.password = '';
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
};

const deleteQuiz = async (req, res) => {
  const { id } = req.params;
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

exports.createQuiz = createQuiz;
exports.getAllQuizzesBySubjectId = getAllQuizzesBySubjectId;
exports.getQuiz = getQuiz;
exports.updateQuiz = updateQuiz;
exports.addQuizQuestionsToQuiz = addQuizQuestionsToQuiz;
exports.deleteQuiz = deleteQuiz;
