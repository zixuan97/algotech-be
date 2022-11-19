const stepModel = require('../models/stepModel');
const topicModel = require('../models/topicModel');
const subjectModel = require('../models/subjectModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { ContentStatus } = require('@prisma/client');

const createTopic = async (req, res) => {
  const { subjectOrder, title, subjectId } = req.body;
  const currentOrders = [];
  const currTitles = [];
  const topics = await topicModel.getAllTopicsBySubjectId({ subjectId });
  for (let t of topics) {
    currentOrders.push(t.subjectOrder);
    currTitles.push(t.title);
  }
  if (currentOrders.includes(subjectOrder)) {
    return res.status(400).send('Subject order already exists!');
  } else if (currTitles.includes(title)) {
    return res
      .status(400)
      .send(`Title already exists for subject ID ${subjectId}!`);
  } else {
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
      return res.json(Error.http(error));
    } else {
      log.out('OK_TOPIC_CREATE-TOPIC', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
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
    return res.json(Error.http(error));
  } else {
    log.out('OK_TOPIC_GET-ALL-TOPICS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
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
    return res.json(topic);
  } catch (error) {
    log.error('ERR_TOPIC_GET-TOPIC-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting topic');
  }
};

const updateTopic = async (req, res) => {
  const { id, subjectOrder, title, status, subjectId } = req.body;
  const t = await topicModel.getTopicById({ id });
  if (status === ContentStatus.FINISHED && t.steps.length === 0) {
    res
      .status(400)
      .send(
        'You cannot update the status of this topic to FINISHED as there are no steps.'
      );
  } else {
    const currentOrders = [];
    const currTitles = [];
    const topics = await topicModel.getAllTopicsBySubjectId({ subjectId });
    for (let t of topics) {
      currentOrders.push(t.subjectOrder);
      currTitles.push(t.title);
    }
    const currTopicByOrder = await topicModel.getTopicByOrderAndSubjectId({
      subjectId,
      subjectOrder
    });
    const currTopicByTitle = await topicModel.getTopicByTitleAndSubjectId({
      subjectId,
      title
    });
    if (currentOrders.includes(subjectOrder) && currTopicByOrder.id !== id) {
      return res.status(400).send('Subject order already exists!');
    } else if (currTitles.includes(title) && currTopicByTitle.id !== id) {
      return res
        .status(400)
        .send(`Title already exists for subject ID ${subjectId}!`);
    } else {
      const currUserId = req.user.userId;
      await subjectModel.updateSubject({
        id: subjectId,
        lastUpdatedById: currUserId
      });
      // changing status from finished back to draft
      if (
        t.status === ContentStatus.FINISHED &&
        status === ContentStatus.DRAFT
      ) {
        await topicModel.updateTopic({
          id,
          status
        });
        const subjectRecords = await subjectModel.getSubjectRecordsBySubject({
          subjectId
        });
        for (let sr of subjectRecords) {
          let completedTopicIds = [];
          for (let ct of sr.completedTopics) {
            completedTopicIds.push(ct.id);
          }
          if (completedTopicIds.includes(id)) {
            await topicModel.unmarkTopicAsCompletedForUser({
              topicId: id,
              userId: sr.userId
            });
          } else {
            await topicModel.getUpdatedSubjectRecord({
              subjectId,
              userId: sr.userId
            });
          }
        }
      } else if (
        t.status === ContentStatus.DRAFT &&
        status === ContentStatus.FINISHED
      ) {
        await topicModel.updateTopic({
          id,
          status
        });
        const subjectRecords = await subjectModel.getSubjectRecordsBySubject({
          subjectId
        });
        for (let sr of subjectRecords) {
          await topicModel.getUpdatedSubjectRecord({
            subjectId,
            userId: sr.userId
          });
        }
      }
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
        return res.status(e.code).json(e.message);
      } else {
        log.out('OK_TOPIC_UPDATE-TOPIC', {
          req: { body: req.body, params: req.params },
          res: JSON.stringify(data)
        });
        return res.json(data);
      }
    }
  }
};

// const addStepsToTopic = async (req, res) => {
//   const { id, steps } = req.body;
//   const currentOrders = [];
//   let stepsToAdd = [];
//   const stepsInTopic = await stepModel.getAllStepsByTopicId({
//     topicId: id
//   });
//   for (let s of stepsInTopic) {
//     currentOrders.push(s.topicOrder);
//   }
//   for (let st of steps) {
//     if (!currentOrders.includes(st.topicOrder)) {
//       stepsToAdd.push(st);
//     }
//   }
//   if (stepsToAdd.length === 0) {
//     return res.status(400).send('All topic orders already exists!');
//   } else {
//     const { subjectId } = await topicModel.getTopicById({ id });
//     const currUserId = req.user.userId;
//     await subjectModel.updateSubject({
//       id: subjectId,
//       lastUpdatedById: currUserId
//     });
//     const { data, error } = await common.awaitWrap(
//       topicModel.addStepsToTopic({
//         id,
//         steps: stepsToAdd
//       })
//     );
//     data.subject.createdBy.password = '';
//     data.subject.lastUpdatedBy.password = '';
//     for (let u of data.subject.usersAssigned) {
//       u.user.password = '';
//     }
//     if (error) {
//       log.error('ERR_TOPIC_ADD-STEPS-TO-TOPIC', {
//         err: error.message,
//         req: { body: req.body, params: req.params }
//       });
//       const e = Error.http(error);
//       return res.status(e.code).json(e.message);
//     } else {
//       log.out('OK_TOPIC_ADD-STEPS-TO-TOPIC', {
//         req: { body: req.body, params: req.params },
//         res: JSON.stringify(data)
//       });
//       return res.json(data);
//     }
//   }
// };

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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_TOPIC_DELETE-TOPIC', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted topic with id:${id}` }
    });
    return res.json({ message: `Deleted topic with id:${id}` });
  }
};

const updateOrderBasedOnTopicArray = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    topicModel.updateOrderOfTopicArray({ topics: req.body })
  );
  if (error) {
    log.error('ERR_STEP_UPDATE-ORDER-TOPIC', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_STEP_UPDATE-ORDER-TOPIC', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const markTopicAsCompletedByUser = async (req, res) => {
  const { topicId } = req.body;
  const currUserId = req.user.userId;
  const { data, error } = await common.awaitWrap(
    topicModel.markTopicAsCompletedForUser({ topicId, userId: currUserId })
  );
  const topic = await topicModel.getTopicById({
    id: topicId
  });
  await subjectModel.updateLastAttemptedTimeInSubjectRecord({
    subjectId: topic.subjectId,
    userId: currUserId
  });
  data.user.password = '';
  if (error) {
    log.error('ERR_STEP_UPDATE-MARK-TOPIC-AS-COMPLETED', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_STEP_UPDATE-MARK-TOPIC-AS-COMPLETED', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

exports.createTopic = createTopic;
exports.getAllTopicsBySubjectId = getAllTopicsBySubjectId;
exports.getTopic = getTopic;
exports.updateTopic = updateTopic;
// exports.addStepsToTopic = addStepsToTopic;
exports.deleteTopic = deleteTopic;
exports.updateOrderBasedOnTopicArray = updateOrderBasedOnTopicArray;
exports.markTopicAsCompletedByUser = markTopicAsCompletedByUser;
