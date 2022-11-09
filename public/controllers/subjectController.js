const subjectModel = require('../models/subjectModel');
const topicModel = require('../models/topicModel');
const quizModel = require('../models/quizModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createSubject = async (req, res) => {
  const { title, description, isPublished, type } = req.body;
  const currUserId = req.user.userId;
  console.log(currUserId);
  const { data, error } = await common.awaitWrap(
    subjectModel.createSubject({
      title,
      description,
      isPublished,
      createdById: currUserId,
      lastUpdatedById: currUserId,
      type
    })
  );
  data.createdBy.password = '';
  data.lastUpdatedBy.password = '';
  for (let u of data.usersAssigned) {
    u.password = '';
  }
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
  for (let d of data) {
    d.createdBy.password = '';
    d.lastUpdatedBy.password = '';
    for (let u of d.usersAssigned) {
      u.password = '';
    }
  }
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
    subject.createdBy.password = '';
    subject.lastUpdatedBy.password = '';
    for (let u of subject.usersAssigned) {
      u.password = '';
    }
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
  const { id, title, description, isPublished, completionRate, type } =
    req.body;
  const currUserId = req.user.userId;
  const { data, error } = await common.awaitWrap(
    subjectModel.updateSubject({
      id,
      title,
      description,
      isPublished,
      completionRate,
      lastUpdatedById: currUserId,
      type
    })
  );
  data.createdBy.password = '';
  data.lastUpdatedBy.password = '';
  for (u of data.usersAssigned) {
    u.password = '';
  }
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

const assignUsersToSubject = async (req, res) => {
  const { id, users } = req.body;
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id,
    lastUpdatedById: currUserId
  });
  const { data, error } = await common.awaitWrap(
    subjectModel.assignUsersToSubject({
      id,
      users
    })
  );
  data.createdBy.password = '';
  data.lastUpdatedBy.password = '';
  for (let u of data.usersAssigned) {
    u.password = '';
  }
  if (error) {
    log.error('ERR_SUBJECT_ASSIGN-USERS-TO-SUBJECT', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SUBJECT_ASSIGN-USERS-TO-SUBJECT', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllTopicsAndQuizzesBySubjectId = async (req, res) => {
  const { id } = req.params;
  const { data: topicData, error: topicError } = await common.awaitWrap(
    topicModel.getAllTopicsBySubjectId({
      subjectId: id
    })
  );
  topicData.map((t) => {
    t.steps.sort((a, b) => {
      return a.topicOrder - b.topicOrder;
    });
  });
  topicData.sort((a, b) => {
    return a.subjectOrder - b.subjectOrder;
  });
  for (let t of topicData) {
    t.subject.createdBy.password = '';
    t.subject.lastUpdatedBy.password = '';
    for (let u of t.subject.usersAssigned) {
      u.password = '';
    }
  }
  const { data: quizData, error: quizError } = await common.awaitWrap(
    quizModel.getAllQuizzesBySubjectId({
      subjectId: id
    })
  );
  quizData.map((q) => {
    q.questions.sort((a, b) => {
      return a.quizOrder - b.quizOrder;
    });
  });
  quizData.sort((a, b) => {
    return a.subjectOrder - b.subjectOrder;
  });
  const data = {
    topics: topicData,
    quizzes: quizData
  };
  if (topicError) {
    log.error('ERR_SUBJECT_GET-TOPIC-QUIZ-BY-SUBJECT', {
      err: topicError.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(topicError);
    res.status(e.code).json(e.message);
  } else if (quizError) {
    log.error('ERR_SUBJECT_GET-TOPIC-QUIZ-BY-SUBJECT', {
      err: quizError.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(quizError);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_SUBJECT_GET-TOPIC-QUIZ-BY-SUBJECT', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

exports.createSubject = createSubject;
exports.getAllSubjects = getAllSubjects;
exports.getSubject = getSubject;
exports.updateSubject = updateSubject;
exports.deleteSubject = deleteSubject;
exports.assignUsersToSubject = assignUsersToSubject;
exports.getAllTopicsAndQuizzesBySubjectId = getAllTopicsAndQuizzesBySubjectId;
