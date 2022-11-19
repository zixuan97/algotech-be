const stepModel = require('../models/stepModel');
const topicModel = require('../models/topicModel');
const subjectModel = require('../models/subjectModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { ContentStatus } = require('@prisma/client');

const createStep = async (req, res) => {
  const { topicOrder, title, content, topicId } = req.body;
  const currentOrders = [];
  const steps = await stepModel.getAllStepsByTopicId({
    topicId
  });
  for (let s of steps) {
    currentOrders.push(s.topicOrder);
  }
  if (currentOrders.includes(topicOrder)) {
    return res.status(400).send('Topic order already exists!');
  } else {
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
    for (let u of data.topic.subject.usersAssigned) {
      u.user.password = '';
    }
    if (error) {
      log.error('ERR_STEP_CREATE-STEP', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      return res.json(Error.http(error));
    } else {
      log.out('OK_STEP_CREATE-STEP', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

// const getAllStepsByTopicId = async (req, res) => {
//   const { topicId } = req.params;
//   const { data, error } = await common.awaitWrap(
//     stepModel.getAllStepsByTopicId({ topicId })
//   );
//   for (let d of data) {
//     d.topic.subject.createdBy.password = '';
//     d.topic.subject.lastUpdatedBy.password = '';
//     for (let u of d.topic.subject.usersAssigned) {
//       u.user.password = '';
//     }
//   }
//   if (error) {
//     log.error('ERR_STEP_GET-ALL-STEPS', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     return res.json(Error.http(error));
//   } else {
//     log.out('OK_STEP_GET-ALL-STEPS', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(data)
//     });
//     return res.json(data);
//   }
// };

// const getStep = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const step = await stepModel.getStepById({ id });
//     log.out('OK_STEP_GET-STEP-BY-ID', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(step)
//     });
//     step.topic.subject.createdBy.password = '';
//     step.topic.subject.lastUpdatedBy.password = '';
//     for (let u of step.topic.subject.usersAssigned) {
//       u.user.password = '';
//     }
//     return res.json(step);
//   } catch (error) {
//     log.error('ERR_STEP_GET-STEP-BY-ID', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     return res.status(400).send('Error getting step');
//   }
// };

const updateStep = async (req, res) => {
  const { id, topicOrder, title, content, topicId } = req.body;
  const currentOrders = [];
  const steps = await stepModel.getAllStepsByTopicId({ topicId });
  for (let s of steps) {
    currentOrders.push(s.topicOrder);
  }
  const currStepByOrder = await stepModel.getStepByOrderAndTopicId({
    topicId,
    topicOrder
  });
  if (currentOrders.includes(topicOrder) && currStepByOrder.id !== id) {
    return res.status(400).send('Topic order already exists!');
  } else {
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
    for (let u of data.topic.subject.usersAssigned) {
      u.user.password = '';
    }
    if (error) {
      log.error('ERR_STEP_UPDATE-STEP', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_STEP_UPDATE-STEP', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

const deleteStep = async (req, res) => {
  const { id } = req.params;
  const { topicId } = await stepModel.getStepById({ id });
  const topic = await topicModel.getTopicById({ id: topicId });
  const currUserId = req.user.userId;
  await subjectModel.updateSubject({
    id: topic.subjectId,
    lastUpdatedById: currUserId
  });
  const { error } = await common.awaitWrap(stepModel.deleteStep({ id }));
  if (error) {
    log.error('ERR_STEP_DELETE-STEP', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    if (topic.steps.length === 1) {
      await topicModel.updateTopic({
        id: topic.id,
        status: ContentStatus.DRAFT
      });
    }
    log.out('OK_STEP_DELETE-STEP', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted step with id:${id}` }
    });
    return res.json({ message: `Deleted step with id:${id}` });
  }
};

const updateOrderBasedOnStepsArray = async (req, res) => {
  const steps = req.body;
  const stepsToAdd = [];
  const canUpdateOrder = [];
  const toAddToResData = [];
  let newStep = {};
  for (let s of steps) {
    if (s.id === -1) {
      stepsToAdd.push(s);
    } else {
      canUpdateOrder.push(s);
    }
  }
  const { data, error } = await common.awaitWrap(
    stepModel.updateOrderOfStepsArray({ steps: canUpdateOrder })
  );
  for (let st of stepsToAdd) {
    newStep = await stepModel.createStep({
      topicOrder: st.topicOrder,
      title: st.title,
      content: st.content,
      topicId: st.topicId
    });
    toAddToResData.push(newStep);
  }
  if (toAddToResData.includes(0)) {
    return res
      .status(400)
      .send('Error adding new step (duplicate topic order)!');
  } else {
    for (let n of toAddToResData) {
      data.push(n);
    }
    for (let d of data) {
      d.topic.subject.createdBy.password = '';
      d.topic.subject.lastUpdatedBy.password = '';
      for (let u of d.topic.subject.usersAssigned) {
        u.user.password = '';
      }
    }
    data.sort((a, b) => {
      return a.topicOrder - b.topicOrder;
    });
    if (error) {
      log.error('ERR_STEP_UPDATE-ORDER-STEP', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_STEP_UPDATE-ORDER-STEP', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

exports.createStep = createStep;
// exports.getAllStepsByTopicId = getAllStepsByTopicId;
// exports.getStep = getStep;
exports.updateStep = updateStep;
exports.deleteStep = deleteStep;
exports.updateOrderBasedOnStepsArray = updateOrderBasedOnStepsArray;
