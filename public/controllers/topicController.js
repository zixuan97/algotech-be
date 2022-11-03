const topicModel = require('../models/topicModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createTopic = async (req, res) => {
  const { subjectOrder, name, subjectId } = req.body;

  const { data, error } = await common.awaitWrap(
    topicModel.createTopic({
      subjectOrder,
      name,
      subjectId
    })
  );
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
  const { id, subjectOrder, name, status, subjectId } = req.body;
  const { data, error } = await common.awaitWrap(
    topicModel.updateTopic({
      id,
      subjectOrder,
      name,
      status,
      subjectId
    })
  );
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
  const { data, error } = await common.awaitWrap(
    topicModel.addStepsToTopic({
      id,
      steps
    })
  );
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
