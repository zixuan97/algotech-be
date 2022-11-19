const subjectModel = require('../models/subjectModel');
const topicModel = require('../models/topicModel');
const quizModel = require('../models/quizModel');
const userModel = require('../models/userModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createSubject = async (req, res) => {
  const { title, description, isPublished, type } = req.body;
  const existingSubject = await subjectModel.getSubjectByTitle({ title });
  if (existingSubject !== null) {
    return res.status(400).send('Subject title already exists!');
  } else {
    const currUserId = req.user.userId;
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
      return res.json(Error.http(error));
    } else {
      log.out('OK_SUBJECT_CREATE-SUBJECT', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
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
      u.user.password = '';
    }
  }
  if (error) {
    log.error('ERR_SUBJECT_GET-ALL-SUBJECTS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.json(Error.http(error));
  } else {
    log.out('OK_SUBJECT_GET-ALL-SUBJECTS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
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
    for (u of subject.usersAssigned) {
      u.user.password = '';
    }
    return res.json(subject);
  } catch (error) {
    log.error('ERR_SUBJECT_GET-SUBJECT-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting subject');
  }
};

const updateSubject = async (req, res) => {
  const { id, title, description, isPublished, completionRate, type } =
    req.body;
  const existingSubject = await subjectModel.getSubjectByTitle({ title });
  if (existingSubject !== null && existingSubject.id !== id) {
    return res.status(400).send('Subject title already exists!');
  } else {
    const subject = await subjectModel.getSubjectById({ id });
    if (subject) {
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
      if (error) {
        log.error('ERR_SUBJECT_UPDATE-SUBJECT', {
          err: error.message,
          req: { body: req.body, params: req.params }
        });
        const e = Error.http(error);
        return res.status(e.code).json(e.message);
      } else {
        if (data) {
          data.createdBy.password = '';
          data.lastUpdatedBy.password = '';
          for (u of data.usersAssigned) {
            u.user.password = '';
          }
          log.out('OK_SUBJECT_UPDATE-SUBJECT', {
            req: { body: req.body, params: req.params },
            res: JSON.stringify(data)
          });
          return res.json(data);
        } else {
          return res.status(400).send('Subject does not exist');
        }
      }
    } else {
      return res.status(400).send('Subject does not exist!');
    }
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
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_SUBJECT_DELETE-SUBJECT', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted subject with id:${id}` }
    });
    return res.json({ message: `Deleted subject with id:${id}` });
  }
};

const assignUsersToSubject = async (req, res) => {
  const { id, users } = req.body;
  const subject = await subjectModel.getSubjectById({ id });
  if (subject) {
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
      u.user.password = '';
    }
    if (error) {
      log.error('ERR_SUBJECT_ASSIGN-USERS-TO-SUBJECT', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_SUBJECT_ASSIGN-USERS-TO-SUBJECT', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  } else {
    return res.status(400).send('Subject or user does not exist!');
  }
};

const unassignUsersToSubject = async (req, res) => {
  const { id, users } = req.body;
  const subject = await subjectModel.getSubjectById({ id });
  if (subject) {
    const currUserId = req.user.userId;
    await subjectModel.updateSubject({
      id,
      lastUpdatedById: currUserId
    });
    const { data, error } = await common.awaitWrap(
      subjectModel.unassignUsersToSubject({
        id,
        users
      })
    );
    if (error) {
      log.error('ERR_SUBJECT_UNASSIGN-USERS-TO-SUBJECT', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_SUBJECT_UNASSIGN-USERS-TO-SUBJECT', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  } else {
    return res.status(400).send('Subject or user does not exist!');
  }
};

// const getAllTopicsAndQuizzesBySubjectId = async (req, res) => {
//   const { id } = req.params;
//   const { data: topicData, error: topicError } = await common.awaitWrap(
//     topicModel.getAllTopicsBySubjectId({
//       subjectId: id
//     })
//   );
//   topicData.map((t) => {
//     t.steps.sort((a, b) => {
//       return a.topicOrder - b.topicOrder;
//     });
//   });
//   topicData.sort((a, b) => {
//     return a.subjectOrder - b.subjectOrder;
//   });
//   for (let t of topicData) {
//     t.subject.createdBy.password = '';
//     t.subject.lastUpdatedBy.password = '';
//     for (let u of t.subject.usersAssigned) {
//       u.user.password = '';
//     }
//   }
//   const { data: quizData, error: quizError } = await common.awaitWrap(
//     quizModel.getAllQuizzesBySubjectId({
//       subjectId: id
//     })
//   );
//   quizData.map((q) => {
//     q.questions.sort((a, b) => {
//       return a.quizOrder - b.quizOrder;
//     });
//   });
//   quizData.sort((a, b) => {
//     return a.subjectOrder - b.subjectOrder;
//   });
//   for (let q of quizData) {
//     q.subject.createdBy.password = '';
//     q.subject.lastUpdatedBy.password = '';
//     for (let u of q.subject.usersAssigned) {
//       u.user.password = '';
//     }
//   }
//   const data = {
//     topics: topicData,
//     quizzes: quizData
//   };
//   if (topicError) {
//     log.error('ERR_SUBJECT_GET-TOPIC-QUIZ-BY-SUBJECT', {
//       err: topicError.message,
//       req: { body: req.body, params: req.params }
//     });
//     const e = Error.http(topicError);
//     return res.status(e.code).json(e.message);
//   } else if (quizError) {
//     log.error('ERR_SUBJECT_GET-TOPIC-QUIZ-BY-SUBJECT', {
//       err: quizError.message,
//       req: { body: req.body, params: req.params }
//     });
//     const e = Error.http(quizError);
//     return res.status(e.code).json(e.message);
//   } else {
//     log.out('OK_SUBJECT_GET-TOPIC-QUIZ-BY-SUBJECT', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(data)
//     });
//     return res.json(data);
//   }
// };

const getSubjectRecordBySubjectByEmployee = async (req, res) => {
  const { subjectId, userId } = req.params;
  const { data, error } = await common.awaitWrap(
    subjectModel.getSubjectRecordBySubjectAndUser({
      subjectId,
      userId
    })
  );
  if (error) {
    log.error('ERR_SUBJECT_GET-SUBJECT-COMPLETION-RATE-BY-EMPLOYEE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    if (data) {
      data.user.password = '';
      log.out('OK_SUBJECT_GET-SUBJECT-COMPLETION-RATE-BY-EMPLOYEE', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    } else {
      return res.status(400).send('Record does not exist!');
    }
  }
};

const getSubjectRecordsOfUser = async (req, res) => {
  const userId = req.user.userId;
  const { data, error } = await common.awaitWrap(
    subjectModel.getSubjectRecordsByUser({
      userId
    })
  );
  if (error) {
    log.error('ERR_SUBJECT_GET-SUBJECT-RECORD-BY-EMPLOYEE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    if (data) {
      for (let d of data) {
        d.user.password = '';
      }
      log.out('OK_SUBJECT_GET-SUBJECT-RECORD-BY-EMPLOYEE', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    } else {
      return res.status(400).send('Record does not exist!');
    }
  }
};

// const updateCompletionRateBySubjectByEmployee = async (req, res) => {
//   const { subjectId, userId, completionRate } = req.body;
//   const subject = await subjectModel.getSubjectById({ id: subjectId });
//   const user = await userModel.getUserDetails({ id: userId });
//   if (subject && user) {
//     const { data, error } = await common.awaitWrap(
//       subjectModel.updateSubjectCompletionRateBySubjectByEmployee({
//         subjectId,
//         userId,
//         completionRate
//       })
//     );
//     if (error) {
//       log.error('ERR_SUBJECT_UPDATE-SUBJECT-COMPLETION-RATE-BY-EMPLOYEE', {
//         err: error.message,
//         req: { body: req.body, params: req.params }
//       });
//       const e = Error.http(error);
//       return res.status(e.code).json(e.message);
//     } else {
//       data.user.password = '';
//       log.out('OK_SUBJECT_UPDATE-SUBJECT-COMPLETION-RATE-BY-EMPLOYEE', {
//         req: { body: req.body, params: req.params },
//         res: JSON.stringify(data)
//       });
//       return res.json(data);
//     }
//   } else {
//     return res.status(400).send('Subject or user does not exist!');
//   }
// };

// const getSubjectsAssignedByUserId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const subjects = await subjectModel.getSubjectsAssignedByUserId({ id });
//     log.out('OK_SUBJECT_GET-SUBJECTS-BY-USER-ID', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(subjects)
//     });
//     return res.json(subjects);
//   } catch (error) {
//     log.error('ERR_SUBJECT_GET-SUBJECTS-BY-USER-ID', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     return res.status(400).send('Error getting subjects');
//   }
// };

// const getUsersAssignedBySubjectId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const users = await subjectModel.getUsersAssignedBySubjectId({ id });
//     log.out('OK_SUBJECT_GET-USERS-BY-SUBJECT-ID', {
//       req: { body: req.body, params: req.params },
//       res: JSON.stringify(users)
//     });
//     return res.json(users);
//   } catch (error) {
//     log.error('ERR_SUBJECT_GET-USERS-BY-SUBJECT-ID', {
//       err: error.message,
//       req: { body: req.body, params: req.params }
//     });
//     return res.status(400).send('Error getting users');
//   }
// };

exports.createSubject = createSubject;
exports.getAllSubjects = getAllSubjects;
exports.getSubject = getSubject;
exports.updateSubject = updateSubject;
exports.deleteSubject = deleteSubject;
exports.assignUsersToSubject = assignUsersToSubject;
exports.unassignUsersToSubject = unassignUsersToSubject;
// exports.getAllTopicsAndQuizzesBySubjectId = getAllTopicsAndQuizzesBySubjectId;
// exports.updateCompletionRateBySubjectByEmployee =
//   updateCompletionRateBySubjectByEmployee;
exports.getSubjectRecordBySubjectByEmployee =
  getSubjectRecordBySubjectByEmployee;
exports.getSubjectRecordsOfUser = getSubjectRecordsOfUser;
// exports.getSubjectsAssignedByUserId = getSubjectsAssignedByUserId;
// exports.getUsersAssignedBySubjectId = getUsersAssignedBySubjectId;
