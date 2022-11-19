const quizModel = require('../models/quizModel');
const quizQuestionModel = require('../models/quizQuestionModel');
const subjectModel = require('../models/subjectModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { ContentStatus } = require('@prisma/client');

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
      return res.json(Error.http(error));
    } else {
      log.out('OK_QUIZ_CREATE-QUIZ', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

// const getAllQuizzesBySubjectId = async (req, res) => {
//   const { subjectId } = req.params;
//   const { data, error } = await common.awaitWrap(
//     quizModel.getAllQuizzesBySubjectId({ subjectId })
//   );
//   for (let d of data) {
//     d.subject.createdBy.password = '';
//     d.subject.lastUpdatedBy.password = '';
//     for (let u of d.subject.usersAssigned) {
//       u.user.password = '';
//     }
//   }
//   if (error) {
//     log.error('ERR_QUIZ_GET-ALL-QUIZZES', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     return res.json(Error.http(error));
//   } else {
//     log.out('OK_QUIZ_GET-ALL-QUIZZES', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(data)
//     });
//     return res.json(data);
//   }
// };

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
    return res.json(quiz);
  } catch (error) {
    log.error('ERR_QUIZ_GET-QUIZ-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting quiz');
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
  const q = await quizModel.getQuizById({ id });
  if (status === ContentStatus.FINISHED && q.questions.length === 0) {
    res
      .status(400)
      .send(
        'You cannot update the status of this quiz to FINISHED as there are no quiz questions.'
      );
  } else {
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
      return res.status(400).send('Subject order already exists!');
    } else if (currTitles.includes(title) && currQuizByTitle.id !== id) {
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
        q.status === ContentStatus.FINISHED &&
        status === ContentStatus.DRAFT
      ) {
        await quizModel.updateQuiz({
          id,
          status
        });
        const subjectRecords = await subjectModel.getSubjectRecordsBySubject({
          subjectId
        });
        for (let sr of subjectRecords) {
          let completedQuizIds = [];
          for (let cq of sr.completedQuizzes) {
            completedQuizIds.push(cq.id);
          }
          if (completedQuizIds.includes(id)) {
            await quizModel.unmarkQuizAsCompletedForUser({
              quizId: id,
              userId: sr.userId
            });
          } else {
            await quizModel.getUpdatedSubjectRecord({
              subjectId,
              userId: sr.userId
            });
          }
        }
      } else if (
        q.status === ContentStatus.DRAFT &&
        status === ContentStatus.FINISHED
      ) {
        await quizModel.updateQuiz({
          id,
          status
        });
        const subjectRecords = await subjectModel.getSubjectRecordsBySubject({
          subjectId
        });
        for (let sr of subjectRecords) {
          await quizModel.getUpdatedSubjectRecord({
            subjectId,
            userId: sr.userId
          });
        }
      }
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
        return res.status(e.code).json(e.message);
      } else {
        log.out('OK_QUIZ_UPDATE-QUIZ', {
          req: { body: req.body, params: req.params },
          res: JSON.stringify(data)
        });
        return res.json(data);
      }
    }
  }
};

// const addQuizQuestionsToQuiz = async (req, res) => {
//   const { id, questions } = req.body;
//   const currentOrders = [];
//   let questionsToAdd = [];
//   const quizQuestions = await quizQuestionModel.getAllQuizQuestionsByQuizId({
//     quizId: id
//   });
//   for (let q of quizQuestions) {
//     currentOrders.push(q.quizOrder);
//   }
//   for (let qn of questions) {
//     if (!currentOrders.includes(qn.quizOrder)) {
//       questionsToAdd.push(qn);
//     }
//   }
//   if (questionsToAdd.length === 0) {
//     return res.status(400).send('All quiz orders already exists!');
//   } else {
//     const { subjectId } = await quizModel.getQuizById({ id });
//     const currUserId = req.user.userId;
//     await subjectModel.updateSubject({
//       id: subjectId,
//       lastUpdatedById: currUserId
//     });
//     const { data, error } = await common.awaitWrap(
//       quizModel.addQuizQuestionsToQuiz({
//         id,
//         questions: questionsToAdd
//       })
//     );
//     data.subject.createdBy.password = '';
//     data.subject.lastUpdatedBy.password = '';
//     for (let u of data.subject.usersAssigned) {
//       u.user.password = '';
//     }
//     if (error) {
//       log.error('ERR_QUIZ_ADD-QUIZQUESTION-TO-QUIZ', {
//         err: error.message,
//         req: { body: req.body, params: req.params }
//       });
//       const e = Error.http(error);
//       return res.status(e.code).json(e.message);
//     } else {
//       log.out('OK_QUIZ_ADD-QUIZQUESTION-TO-QUIZ', {
//         req: { body: req.body, params: req.params },
//         res: JSON.stringify(data)
//       });
//       return res.json(data);
//     }
//   }
// };

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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_QUIZ_DELETE-QUIZ', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted quiz with id:${id}` }
    });
    return res.json({ message: `Deleted quiz with id:${id}` });
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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_STEP_UPDATE-ORDER-QUIZ', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

// const markQuizAsCompletedByUser = async (req, res) => {
//   const { quizId } = req.body;
//   const currUserId = req.user.userId;
//   const { data, error } = await common.awaitWrap(
//     quizModel.markQuizAsCompletedForUser({ quizId, userId: currUserId })
//   );
//   const quiz = await quizModel.getQuizById({
//     id: Number(quizId)
//   });
//   await subjectModel.updateLastAttemptedTimeInSubjectRecord({
//     subjectId: quiz.subjectId,
//     userId: currUserId
//   });
//   data.user.password = '';
//   if (error) {
//     log.error('ERR_STEP_UPDATE-MARK-QUIZ-AS-COMPLETED', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     const e = Error.http(error);
//     return res.status(e.code).json(e.message);
//   } else {
//     log.out('OK_STEP_UPDATE-MARK-QUIZ-AS-COMPLETED', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(data)
//     });
//     return res.json(data);
//   }
// };

exports.createQuiz = createQuiz;
// exports.getAllQuizzesBySubjectId = getAllQuizzesBySubjectId;
exports.getQuiz = getQuiz;
exports.updateQuiz = updateQuiz;
// exports.addQuizQuestionsToQuiz = addQuizQuestionsToQuiz;
exports.deleteQuiz = deleteQuiz;
exports.updateOrderBasedOnQuizArray = updateOrderBasedOnQuizArray;
// exports.markQuizAsCompletedByUser = markQuizAsCompletedByUser;
