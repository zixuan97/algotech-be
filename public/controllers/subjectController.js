const subjectModel = require('../models/subjectModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createSubject = async (req, res) => {
  const { description, isPublished, type } = req.body;
  const { data, error } = await common.awaitWrap(
    subjectModel.createSubject({
      description,
      isPublished,
      type
    })
  );
  if (error) {
    log.error('ERR_SUBJECT_CREATE-SUBJECT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_SUBJECT_CREATE-SUBJECT', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllSubjects = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    subjectModel.getAllSubjects({})
  );
  if (error) {
    log.error('ERR_SUBJECT_GET-ALL-SUBJECTS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_SUBJECT_GET-ALL-SUBJECTS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await subjectModel.getSubjectById({ id });
    log.out('OK_SUBJECT_GET-SUBJECT-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(subject)
    });
    res.json(subject);
  } catch (error) {
    log.error('ERR_SUBJECT_GET-SUBJECT-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting subject');
  }
};

const updateSubject = async (req, res) => {
  const {
    id,
    description,
    isPublished,
    completionRate,
    type,
    quizzes,
    topics,
    usersAssigned
  } = req.body;
  const { data, error } = await common.awaitWrap(
    subjectModel.updateSubject({
      id,
      description,
      isPublished,
      completionRate,
      lastUpdated: Date.now(),
      type,
      quizzes,
      topics,
      usersAssigned
    })
  );
  if (error) {
    log.error('ERR_SUBJECT_UPDATE-SUBJECT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SUBJECT_UPDATE-SUBJECT', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const deleteSubject = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(subjectModel.deleteSubject({ id }));
  if (error) {
    log.error('ERR_SUBJECT_DELETE-SUBJECT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SUBJECT_DELETE-SUBJECT', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted subject with id:${id}` }
    });
    res.json({ message: `Deleted subject with id:${id}` });
  }
};

exports.createSubject = createSubject;
exports.getAllSubjects = getAllSubjects;
exports.getSubject = getSubject;
exports.updateSubject = updateSubject;
exports.deleteSubject = deleteSubject;
