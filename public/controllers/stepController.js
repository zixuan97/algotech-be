const stepModel = require('../models/stepModel');
const topicModel = require('../models/topicModel');
const subjectModel = require('../models/subjectModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createStep = async (req, res) => {
  const { topicOrder, title, content, topicId } = req.body;
  const { subjectId } = await topicModel.getTopicById({ id: topicId });
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: subjectId,
    lastUpdatedById: currUserId
  });
  const { data, error } = await common.awaitWrap(
    stepModel.createStep({
      topicOrder,
      title,
      content,
      topicId
    })
  );
  data.topic.subject.createdBy.password = '';
  data.topic.subject.lastUpdatedBy.password = '';
  if (error) {
    log.error('ERR_STEP_CREATE-STEP', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_STEP_CREATE-STEP', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllStepsByTopicId = async (req, res) => {
  const { topicId } = req.params;
  const { data, error } = await common.awaitWrap(
    stepModel.getAllStepsByTopicId({ topicId })
  );
  for (let d of data) {
    d.topic.subject.createdBy.password = '';
    d.topic.subject.lastUpdatedBy.password = '';
  }
  if (error) {
    log.error('ERR_STEP_GET-ALL-STEPS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_STEP_GET-ALL-STEPS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getStep = async (req, res) => {
  try {
    const { id } = req.params;
    const step = await stepModel.getStepById({ id });
    log.out('OK_STEP_GET-STEP-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(step)
    });
    step.topic.subject.createdBy.password = '';
    step.topic.subject.lastUpdatedBy.password = '';
    res.json(step);
  } catch (error) {
    log.error('ERR_STEP_GET-STEP-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting step');
  }
};

const updateStep = async (req, res) => {
  const { id, topicOrder, title, content, topicId } = req.body;
  const { subjectId } = await topicModel.getTopicById({ id: topicId });
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: subjectId,
    lastUpdatedById: currUserId
  });
  const { data, error } = await common.awaitWrap(
    stepModel.updateStep({
      id,
      topicOrder,
      title,
      content,
      topicId
    })
  );
  data.topic.subject.createdBy.password = '';
  data.topic.subject.lastUpdatedBy.password = '';
  if (error) {
    log.error('ERR_STEP_UPDATE-STEP', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_STEP_UPDATE-STEP', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const deleteStep = async (req, res) => {
  const { id } = req.params;
  const { topicId } = await stepModel.getStepById({ id });
  const { subjectId } = await topicModel.getTopicById({ id: topicId });
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: subjectId,
    lastUpdatedById: currUserId
  });
  const { error } = await common.awaitWrap(stepModel.deleteStep({ id }));
  if (error) {
    log.error('ERR_STEP_DELETE-STEP', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_STEP_DELETE-STEP', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted step with id:${id}` }
    });
    res.json({ message: `Deleted step with id:${id}` });
  }
};

exports.createStep = createStep;
exports.getAllStepsByTopicId = getAllStepsByTopicId;
exports.getStep = getStep;
exports.updateStep = updateStep;
exports.deleteStep = deleteStep;
