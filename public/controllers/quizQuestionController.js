const quizQuestionModel = require('../models/quizQuestionModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createQuizQuestion = async (req, res) => {
  const {
    quizOrder,
    question,
    type,
    options,
    writtenAnswer,
    minWordCount,
    correctAnswer,
    quizId
  } = req.body;
  const { data, error } = await common.awaitWrap(
    quizQuestionModel.createQuizQuestion({
      quizOrder,
      question,
      type,
      options,
      writtenAnswer,
      minWordCount,
      correctAnswer,
      quizId
    })
  );
  if (error) {
    log.error('ERR_QUIZQUESTION_CREATE-QUIZQUESTION', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_QUIZQUESTION_CREATE-QUIZQUESTION', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllQuizQuestionsByQuizId = async (req, res) => {
  const { quizId } = req.params;
  const { data, error } = await common.awaitWrap(
    quizQuestionModel.getAllQuizQuestionsByQuizId({ quizId })
  );
  if (error) {
    log.error('ERR_QUIZQUESTION_GET-ALL-QUIZQUESTIONS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_QUIZQUESTION_GET-ALL-QUIZQUESTIONS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const quizQuestion = await quizQuestionModel.getQuizQuestionById({ id });
    log.out('OK_QUIZQUESTION_GET-QUIZQUESTION-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(quizQuestion)
    });
    res.json(quizQuestion);
  } catch (error) {
    log.error('ERR_QUIZQUESTION_GET-QUIZQUESTION-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting quizQuestion');
  }
};

const updateQuizQuestion = async (req, res) => {
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
  } = req.body;
  const { data, error } = await common.awaitWrap(
    quizQuestionModel.updateQuizQuestion({
      id,
      quizOrder,
      question,
      type,
      options,
      writtenAnswer,
      minWordCount,
      correctAnswer,
      quizId
    })
  );
  if (error) {
    log.error('ERR_QUIZQUESTION_UPDATE-QUIZQUESTION', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_QUIZQUESTION_UPDATE-QUIZQUESTION', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const deleteQuizQuestion = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(
    quizQuestionModel.deleteQuizQuestion({ id })
  );
  if (error) {
    log.error('ERR_QUIZQUESTION_DELETE-QUIZQUESTION', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_QUIZQUESTION_DELETE-QUIZQUESTION', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted quizQuestion with id:${id}` }
    });
    res.json({ message: `Deleted quizQuestion with id:${id}` });
  }
};

exports.createQuizQuestion = createQuizQuestion;
exports.getAllQuizQuestionsByQuizId = getAllQuizQuestionsByQuizId;
exports.getQuizQuestion = getQuizQuestion;
exports.updateQuizQuestion = updateQuizQuestion;
exports.deleteQuizQuestion = deleteQuizQuestion;
