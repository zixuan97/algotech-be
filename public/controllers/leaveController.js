const leaveModel = require('../models/leaveModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createLeave = async (req, res) => {
  const {
    startDate,
    endDate,
    leaveType,
    status,
    description,
    vettedBy,
    commentsByVetter,
    lastUpdated,
    employeeId
  } = req.body;
  const { data, error } = await common.awaitWrap(
    leaveModel.createLeave({
      startDate,
      endDate,
      leaveType,
      status,
      description,
      vettedBy,
      commentsByVetter,
      lastUpdated,
      employeeId
    })
  );
  if (error) {
    log.error('ERR_LEAVE_CREATE-LEAVE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_LEAVE_CREATE-LEAVE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllLeavesByEmployeeId = async (req, res) => {
  const { employeeId } = req.params;
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllLeavesByEmployeeId({ employeeId })
  );
  if (error) {
    log.error('ERR_LEAVE_GET-ALL-LEAVES-BY-EMPLOYEE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_LEAVE_GET-ALL-LEAVES-BY-EMPLOYEE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getAllLeaves = async (req, res) => {
  const { data, error } = await common.awaitWrap(leaveModel.getAllLeaves({}));
  if (error) {
    log.error('ERR_LEAVE_GET-ALL-LEAVES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.json(Error.http(error));
  } else {
    log.out('OK_LEAVE_GET-ALL-LEAVES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const getLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await leaveModel.getLeaveById({ id });
    log.out('OK_LEAVE_GET-LEAVE-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(leave)
    });
    res.json(leave);
  } catch (error) {
    log.error('ERR_LEAVE_GET-LEAVE-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    res.status(400).send('Error getting leave');
  }
};

const updateLeave = async (req, res) => {
  const {
    startDate,
    endDate,
    leaveType,
    status,
    description,
    vettedBy,
    commentsByVetter,
    lastUpdated,
    employeeId
  } = req.body;
  const { data, error } = await common.awaitWrap(
    leaveModel.updateLeave({
      startDate,
      endDate,
      leaveType,
      status,
      description,
      vettedBy,
      commentsByVetter,
      lastUpdated,
      employeeId
    })
  );
  if (error) {
    log.error('ERR_LEAVE_UPDATE-LEAVE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_UPDATE-LEAVE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    res.json(data);
  }
};

const deleteLeave = async (req, res) => {
  const { id } = req.params;
  const { error } = await common.awaitWrap(leaveModel.deleteLeave({ id }));
  if (error) {
    log.error('ERR_LEAVE_DELETE-LEAVE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_DELETE-LEAVE', {
      req: { body: req.body, params: req.params },
      res: { message: `Deleted leave with id:${id}` }
    });
    res.json({ message: `Deleted leave with id:${id}` });
  }
};

exports.createLeave = createLeave;
exports.getLeave = getLeave;
exports.getAllLeavesByEmployeeId = getAllLeavesByEmployeeId;
exports.getAllLeaves = getAllLeaves;
exports.updateLeave = updateLeave;
exports.deleteLeave = deleteLeave;
