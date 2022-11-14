const topicModel = require('../models/topicModel');
const subjectModel = require('../models/subjectModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createTopic = async (req, res) => {
  const { subjectOrder, title, subjectId } = req.body;
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: subjectId,
    lastUpdatedById: currUserId
  });
  const { data, error } = await common.awaitWrap(
    topicModel.createTopic({
      subjectOrder,
      title,
      subjectId
    })
  );
  data.subject.createdBy.password = '';
  data.subject.lastUpdatedBy.password = '';
  for (let u of data.subject.usersAssigned) {
    u.user.password = '';
  }
  if (error) {
    log.error('ERR_TOPIC_CREATE-TOPIC', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_TOPIC_CREATE-TOPIC', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllTopicsBySubjectId = async (req, res) => {
  const { subjectId } = req.params;
  const { data, error } = await common.awaitWrap(
    topicModel.getAllTopicsBySubjectId({ subjectId })
  );
  for (let d of data) {
    d.subject.createdBy.password = '';
    d.subject.lastUpdatedBy.password = '';
    for (let u of d.subject.usersAssigned) {
      u.user.password = '';
    }
  }
  if (error) {
    log.error('ERR_TOPIC_GET-ALL-TOPICS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_TOPIC_GET-ALL-TOPICS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await topicModel.getTopicById({ id });
    log.out('OK_TOPIC_GET-TOPIC-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(topic)
    });
    topic.subject.createdBy.password = '';
    topic.subject.lastUpdatedBy.password = '';
    for (let u of topic.subject.usersAssigned) {
      u.user.password = '';
    }
    res.json(topic);
  } catch (error) {
    log.error('ERR_TOPIC_GET-TOPIC-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting topic');
  }
};

const updateTopic = async (req, res) => {
  const { id, subjectOrder, title, status, subjectId } = req.body;
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: subjectId,
    lastUpdatedById: currUserId
  });
  const { data, error } = await common.awaitWrap(
    topicModel.updateTopic({
      id,
      subjectOrder,
      title,
      status,
      subjectId
    })
  );
  data.subject.createdBy.password = '';
  data.subject.lastUpdatedBy.password = '';
  for (let u of data.subject.usersAssigned) {
    u.user.password = '';
  }
  if (error) {
    log.error('ERR_TOPIC_UPDATE-TOPIC', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_TOPIC_UPDATE-TOPIC', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const addStepsToTopic = async (req, res) => {
  const { id, steps } = req.body;
  const { subjectId } = await topicModel.getTopicById({ id });
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: subjectId,
    lastUpdatedById: currUserId
  });
  const { data, error } = await common.awaitWrap(
    topicModel.addStepsToTopic({
      id,
      steps
    })
  );
  data.subject.createdBy.password = '';
  data.subject.lastUpdatedBy.password = '';
  for (let u of data.subject.usersAssigned) {
    u.user.password = '';
  }
  if (error) {
    log.error('ERR_TOPIC_ADD-STEPS-TO-TOPIC', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_TOPIC_ADD-STEPS-TO-TOPIC', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const deleteTopic = async (req, res) => {
  const { id } = req.params;
  const { subjectId } = await topicModel.getTopicById({ id });
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: subjectId,
    lastUpdatedById: currUserId
  });
  const { error } = await common.awaitWrap(topicModel.deleteTopic({ id }));
  if (error) {
    log.error('ERR_TOPIC_DELETE-TOPIC', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_TOPIC_DELETE-TOPIC', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted topic with id:${id}` }
    });
    res.json({ message: `Deleted topic with id:${id}` });
  }
};

exports.createTopic = createTopic;
exports.getAllTopicsBySubjectId = getAllTopicsBySubjectId;
exports.getTopic = getTopic;
exports.updateTopic = updateTopic;
exports.addStepsToTopic = addStepsToTopic;
exports.deleteTopic = deleteTopic;
