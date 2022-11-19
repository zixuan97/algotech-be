const leaveModel = require('../models/leaveModel');
const userModel = require('../models/userModel');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const { LeaveStatus } = require('@prisma/client');

const createLeaveApplication = async (req, res) => {
  const { startDate, endDate, leaveType, description, employeeId } = req.body;
  const leaveTypeBalance = await leaveModel.getLeaveTypeBalanceByEmployeeId({
    employeeId,
    leaveType
  });
  const numDays = await leaveModel.calcuateNumOfBusinessDays({
    startDate,
    endDate
  });
  if (numDays > leaveTypeBalance) {
    log.out('ERR_LEAVE_CREATE-LEAVE', {
      err: `Employee does not have enough leave balance for ${leaveType}`,
      req: { body: req.body, params: req.params }
    });
    return res
      .status(400)
      .json(`You do not have enough ${leaveType} leave balance`);
  } else {
    const { data, error } = await common.awaitWrap(
      leaveModel.createLeaveApplication({
        startDate,
        endDate,
        leaveType,
        description,
        employeeId
      })
    );
    data.employee.password = '';
    if (error) {
      log.error('ERR_LEAVE_CREATE-LEAVE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      return res.json(Error.http(error));
    } else {
      log.out('OK_LEAVE_CREATE-LEAVE', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

const createLeaveQuota = async (req, res) => {
  const { tier, annual, childcare, compassionate, parental, sick, unpaid } =
    req.body;
  const { data, error } = await common.awaitWrap(
    leaveModel.createLeaveQuota({
      tier,
      annual,
      childcare,
      compassionate,
      parental,
      sick,
      unpaid
    })
  );
  if (error) {
    log.error('ERR_LEAVE_CREATE-LEAVE-QUOTA', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_CREATE-LEAVE-QUOTA', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getLeaveQuota = async (req, res) => {
  const { data, error } = await common.awaitWrap(leaveModel.getLeaveQuota({}));
  if (error) {
    log.error('ERR_LEAVE_GET-LEAVE-QUOTA', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_GET-LEAVE-QUOTA', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getAllTiers = async (req, res) => {
  const { data, error } = await common.awaitWrap(leaveModel.getLeaveQuota({}));
  const tiers = [];
  for (let d of data) {
    tiers.push(d.tier);
  }
  if (error) {
    log.error('ERR_LEAVE_GET-LEAVE-QUOTA', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_GET-LEAVE-QUOTA', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(tiers)
    });
    res.json(tiers);
  }
};

const getLeaveQuotaById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await common.awaitWrap(
    leaveModel.getLeaveQuotaById({ id })
  );
  if (error) {
    log.error('ERR_LEAVE_GET-LEAVE-QUOTA-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_GET-LEAVE-QUOTA-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const updateLeaveQuota = async (req, res) => {
  const { id, tier, annual, childcare, compassionate, parental, sick, unpaid } =
    req.body;
  const curr = await leaveModel.getLeaveQuotaByTier({ tier });
  if (curr && curr.id !== id) {
    return res.status(400).send('Tier name already exists');
  } else {
    const currQuotaById = await leaveModel.getLeaveQuotaById({ id });
    const { data, error } = await common.awaitWrap(
      leaveModel.updateLeaveQuota({
        id,
        tier,
        annual,
        childcare,
        compassionate,
        parental,
        sick,
        unpaid
      })
    );
    if (currQuotaById.tier !== tier) {
      // change name of tier
      const employeesWithTier = await leaveModel.getAllEmployeesByTier({
        tier: currQuotaById.tier
      });
      for (let e of employeesWithTier) {
        await leaveModel.updateEmployeeLeaveQuota({
          employeeId: e.id,
          tier,
          annualQuota: annual,
          childcareQuota: childcare,
          compassionateQuota: compassionate,
          parentalQuota: parental,
          sickQuota: sick,
          unpaidQuota: unpaid
        });
        const updatedUser = {
          ...e,
          tier
        };
        await userModel.editUser({ updatedUser });
      }
    } else {
      const employeesWithTier = await leaveModel.getAllEmployeesByTier({
        tier
      });
      for (let e of employeesWithTier) {
        await leaveModel.updateEmployeeLeaveQuota({
          employeeId: e.id,
          annualQuota: annual,
          childcareQuota: childcare,
          compassionateQuota: compassionate,
          parentalQuota: parental,
          sickQuota: sick,
          unpaidQuota: unpaid
        });
      }
    }
    if (error) {
      log.error('ERR_LEAVE_UPDATE-LEAVE-QUOTA', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_LEAVE_UPDATE-LEAVE-QUOTA', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

const deleteLeaveQuotaById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await common.awaitWrap(
    leaveModel.deleteLeaveQuota({
      id
    })
  );
  if (error) {
    log.error('ERR_LEAVE_DELETE-LEAVE-RECORD', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_DELETE-LEAVE-RECORD', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.status(200).json({ message: 'Tier successfully deleted' });
  }
};

const getEmployeeLeaveRecord = async (req, res) => {
  const { employeeId } = req.params;
  const { data, error } = await common.awaitWrap(
    leaveModel.getLeaveRecordByEmployeeId({
      employeeId
    })
  );
  if (data.employee !== null) data.employee.password = '';
  if (error) {
    log.error('ERR_LEAVE_GET-EMPLOYEE-LEAVE-RECORD', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_GET-EMPLOYEE-LEAVE-RECORD', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getAllEmployeeLeaveRecords = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllEmployeeLeaveRecords({})
  );
  for (let d of data) {
    d.employee.password = '';
  }
  if (error) {
    log.error('ERR_LEAVE_GET-ALL-EMPLOYEE-LEAVE-RECORDS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_GET-ALL-EMPLOYEE-LEAVE-RECORDS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getLeaveRecordById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await common.awaitWrap(
    leaveModel.getLeaveRecordById({
      id
    })
  );
  if (error) {
    log.error('ERR_LEAVE_GET-LEAVE-RECORD-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_GET-LEAVE-RECORD-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const updateEmployeeLeaveQuota = async (req, res) => {
  const {
    employeeId,
    tier,
    annualQuota,
    childcareQuota,
    compassionateQuota,
    parentalQuota,
    sickQuota,
    unpaidQuota
  } = req.body;
  const { data, error } = await common.awaitWrap(
    leaveModel.updateEmployeeLeaveQuota({
      employeeId,
      tier,
      annualQuota,
      childcareQuota,
      compassionateQuota,
      parentalQuota,
      sickQuota,
      unpaidQuota
    })
  );
  if (error) {
    log.error('ERR_LEAVE_UPDATE-EMPLOYEE-LEAVE-RECORD', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_UPDATE-EMPLOYEE-LEAVE-RECORD', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getAllLeaveApplicationsByEmployeeId = async (req, res) => {
  const { employeeId } = req.params;
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllLeaveApplicationsByEmployeeId({ employeeId })
  );
  for (let d of data) {
    d.employee.password = '';
    if (d.vettedBy !== null) d.vettedBy.password = '';
  }
  if (error) {
    log.error('ERR_LEAVE_GET-ALL-LEAVES-BY-EMPLOYEE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.json(Error.http(error));
  } else {
    log.out('OK_LEAVE_GET-ALL-LEAVES-BY-EMPLOYEE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getAllLeaveApplications = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllLeaveApplications({})
  );
  for (let d of data) {
    d.employee.password = '';
    if (d.vettedBy !== null) d.vettedBy.password = '';
  }
  if (error) {
    log.error('ERR_LEAVE_GET-ALL-LEAVES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.json(Error.http(error));
  } else {
    log.out('OK_LEAVE_GET-ALL-LEAVES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getAllApprovedLeaveApplications = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllApprovedLeaveApplications({})
  );
  for (let d of data) {
    d.employee.password = '';
    if (d.vettedBy !== null) d.vettedBy.password = '';
  }
  if (error) {
    log.error('ERR_LEAVE_GET-ALL-APPROVED-LEAVES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.json(Error.http(error));
  } else {
    log.out('OK_LEAVE_GET-ALL-APPROVED-LEAVES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getAllPendingLeaveApplications = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllPendingLeaveApplications({})
  );
  for (let d of data) {
    d.employee.password = '';
    if (d.vettedBy !== null) d.vettedBy.password = '';
  }
  if (error) {
    log.error('ERR_LEAVE_GET-ALL-PENDING-LEAVES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.json(Error.http(error));
  } else {
    log.out('OK_LEAVE_GET-ALL-PENDING-LEAVES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const getNumberOfPendingLeaveApplications = async (req, res) => {
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllPendingLeaveApplications({})
  );
  if (error) {
    log.error('ERR_LEAVE_GET-NUM-OF-PENDING-LEAVES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.json(Error.http(error));
  } else {
    log.out('OK_LEAVE_GET-NUM-OF-PENDING-LEAVES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data.length)
    });
    return res.json(data.length);
  }
};

const getLeaveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await leaveModel.getLeaveApplicationById({ id });
    leave.employee.password = '';
    if (leave.vettedBy !== null) leave.vettedBy.password = '';
    log.out('OK_LEAVE_GET-LEAVE-BY-ID', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(leave)
    });
    return res.json(leave);
  } catch (error) {
    log.error('ERR_LEAVE_GET-LEAVE-BY-ID', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting leave');
  }
};

const updateLeaveApplication = async (req, res) => {
  const { id, startDate, endDate, leaveType, status, description, employeeId } =
    req.body;
  const leaveTypeBalance = await leaveModel.getLeaveTypeBalanceByEmployeeId({
    employeeId,
    leaveType
  });
  const numDays = await leaveModel.calcuateNumOfBusinessDays({
    startDate,
    endDate
  });
  if (numDays > leaveTypeBalance) {
    log.out('ERR_LEAVE_UPDATE-LEAVE', {
      err: `Employee does not have enough leave balance for ${leaveType}`,
      req: { body: req.body, params: req.params }
    });
    return res
      .status(400)
      .json(`You do not have enough ${leaveType} leave balance`);
  } else {
    const { data, error } = await common.awaitWrap(
      leaveModel.updateLeaveApplication({
        id,
        startDate,
        endDate,
        leaveType,
        status,
        description
      })
    );
    data.employee.password = '';
    if (data.vettedBy !== null) data.vettedBy.password = '';
    if (error) {
      log.error('ERR_LEAVE_UPDATE-LEAVE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_LEAVE_UPDATE-LEAVE', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    }
  }
};

const vetLeaveApplication = async (req, res) => {
  const { id, commentsByVetter } = req.body;
  const currUserId = req.user.userId;
  const { data, error } = await common.awaitWrap(
    leaveModel.updateLeaveApplication({
      id,
      vettedById: currUserId,
      commentsByVetter
    })
  );
  data.employee.password = '';
  data.vettedBy.password = '';
  const { employeeId } = await leaveModel.getLeaveApplicationById({ id });
  if (currUserId === employeeId) {
    log.out('ERR_LEAVE_VET-LEAVE', {
      err: 'You cannot vet your own application',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json('You cannot vet your own application');
  } else if (error) {
    log.error('ERR_LEAVE_VET-LEAVE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_VET-LEAVE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const approveLeaveApplication = async (req, res) => {
  const { id, commentsByVetter } = req.body;
  const { leaveType, status, employeeId } =
    await leaveModel.getLeaveApplicationById({
      id
    });
  const currUserId = req.user.userId;
  const leaveTypeBalance = await leaveModel.getLeaveTypeBalanceByEmployeeId({
    employeeId,
    leaveType
  });
  if (status === LeaveStatus.APPROVED) {
    log.out('ERR_LEAVE_APPROVE-LEAVE', {
      err: 'Leave application has already been approved',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json('Leave application has already been approved');
  } else if (status === LeaveStatus.CANCELLED) {
    log.out('ERR_LEAVE_APPROVE-LEAVE', {
      err: 'You cannot approve an application that has been cancelled',
      req: { body: req.body, params: req.params }
    });
    res
      .status(400)
      .json('You cannot approve an application that has been cancelled');
  } else if (currUserId === employeeId) {
    log.out('ERR_LEAVE_APPROVE-LEAVE', {
      err: 'You cannot approve your own application',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json('You cannot approve your own application');
  } else if (leaveTypeBalance === 0) {
    log.out('ERR_LEAVE_APPROVE-LEAVE', {
      err: `Employee does not have any leave balance for ${leaveType} leave`,
      req: { body: req.body, params: req.params }
    });
    res
      .status(400)
      .json(`Employee does not have anymore ${leaveType} leave balance`);
  } else {
    const { data, error } = await common.awaitWrap(
      leaveModel.updateLeaveApplication({
        id,
        status: LeaveStatus.APPROVED,
        vettedById: currUserId,
        commentsByVetter
      })
    );
    if (error) {
      log.error('ERR_LEAVE_APPROVE-LEAVE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      try {
        const newBalance =
          await leaveModel.decreaseLeaveTypeBalanceByEmployeeIdByLeaveType({
            leaveId: id,
            leaveType,
            employeeId
          });
        if (newBalance === null) {
          return res
            .status(400)
            .json(
              `Employee does not have enough leave balance for ${leaveType}`
            );
        }
        log.out('OK_LEAVE_APPROVE-LEAVE', {
          req: { body: req.body, params: req.params },
          res: JSON.stringify(data)
        });
        return res.status(200).json({ message: 'Leave successfully approved' });
      } catch (error) {
        log.error('ERR_LEAVE_APPROVE-LEAVE', {
          err: error.message,
          req: { body: req.body, params: req.params }
        });
        const e = Error.http(error);
        return res.status(e.code).json(e.message);
      }
    }
  }
};

const rejectLeaveApplication = async (req, res) => {
  const { id, commentsByVetter } = req.body;
  const currUserId = req.user.userId;
  const { leaveType, status, employeeId } =
    await leaveModel.getLeaveApplicationById({
      id
    });
  if (status === LeaveStatus.CANCELLED) {
    log.out('ERR_LEAVE_REJECT-LEAVE', {
      err: 'You cannot reject an application that has been cancelled',
      req: { body: req.body, params: req.params }
    });
    res
      .status(400)
      .json('You cannot reject an application that has been cancelled');
  } else if (currUserId === employeeId) {
    log.out('ERR_LEAVE_REJECT-LEAVE', {
      err: 'You cannot reject your own application',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json('You cannot reject your own application');
  } else {
    const { data, error } = await common.awaitWrap(
      leaveModel.updateLeaveApplication({
        id,
        status: LeaveStatus.REJECTED,
        vettedById: currUserId,
        commentsByVetter
      })
    );
    if (error) {
      log.error('ERR_LEAVE_REJECT-LEAVE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      try {
        if (status === LeaveStatus.APPROVED) {
          await leaveModel.increaseLeaveTypeBalanceByEmployeeIdByLeaveType({
            leaveId: id,
            leaveType,
            employeeId
          });
        }
        log.out('OK_LEAVE_REJECT-LEAVE', {
          req: { body: req.body, params: req.params },
          res: JSON.stringify(data)
        });
        return res.status(200).json({ message: 'Leave successfully rejected' });
      } catch (error) {
        log.error('ERR_LEAVE_REJECTED-LEAVE', {
          err: error.message,
          req: { body: req.body, params: req.params }
        });
        const e = Error.http(error);
        return res.status(e.code).json(e.message);
      }
    }
  }
};

const cancelLeaveApplication = async (req, res) => {
  const { id } = req.params;
  const { status } = await leaveModel.getLeaveApplicationById({
    id
  });
  if (status !== LeaveStatus.PENDING) {
    log.out('ERR_LEAVE_CANCEL-LEAVE', {
      err: 'Leave application can only be cancelled if status is PENDING',
      req: { body: req.body, params: req.params }
    });
    res
      .status(400)
      .json('Leave application can only be cancelled if status is PENDING');
  } else {
    const { data, error } = await common.awaitWrap(
      leaveModel.updateLeaveApplication({
        id,
        status: LeaveStatus.CANCELLED
      })
    );
    if (error) {
      log.error('ERR_LEAVE_CANCEL-LEAVE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_LEAVE_CANCEL-LEAVE', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.status(200).json({ message: 'Leave successfully cancelled' });
    }
  }
};

const updateTierByEmployeeId = async (req, res) => {
  const { employeeId, newTier } = req.body;
  const { data, error } = await common.awaitWrap(
    leaveModel.updateTierByEmployeeId({
      employeeId,
      newTier
    })
  );
  if (error) {
    log.error('ERR_LEAVE_UPDATE-EMPLOYEE-TIER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_UPDATE-EMPLOYEE-TIER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const updateEmployeesToNewTierForDeletedTier = async (req, res) => {
  const { deletedTier, newTier } = req.body;
  const { data, error } = await common.awaitWrap(
    leaveModel.updateEmployeesToNewTierForDeletedTier({
      deletedTier,
      newTier
    })
  );
  if (error) {
    log.error('ERR_LEAVE_UPDATE-EMPLOYEES-TO-NEW-TIER-FROM-DELETED-TIER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    await leaveModel.deleteLeaveQuotaByTier({ tier: deletedTier });
    log.out('OK_LEAVE_UPDATE-EMPLOYEES-TO-NEW-TIER-FROM-DELETED-TIER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.status(200).json({
      message: `All employees in ${deletedTier} have successfully been updated from ${deletedTier} to ${newTier}`
    });
  }
};

const getNumberOfEmployeesInTier = async (req, res) => {
  const { tier } = req.params;
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllEmployeesByTier({
      tier
    })
  );
  if (error) {
    log.error('ERR_LEAVE_GET-NUM-EMPLOYEES-BY-TIER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_GET-NUM-EMPLOYEES-BY-TIER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.status(200).json(data.length);
  }
};

const getPublicHolidaysInAYear = async (req, res) => {
  const { year } = req.params;
  const { data, error } = await common.awaitWrap(
    leaveModel.getAllPHByYear({
      year
    })
  );
  if (error) {
    log.error('ERR_LEAVE_GET-PH-BY-YEAR', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    log.out('OK_LEAVE_GET-PH-BY-YEAR', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.status(200).json(data);
  }
};

exports.createLeaveApplication = createLeaveApplication;
exports.createLeaveQuota = createLeaveQuota;
exports.getLeaveQuota = getLeaveQuota;
exports.getAllTiers = getAllTiers;
exports.getLeaveQuotaById = getLeaveQuotaById;
exports.updateLeaveQuota = updateLeaveQuota;
exports.deleteLeaveQuotaById = deleteLeaveQuotaById;
exports.getEmployeeLeaveRecord = getEmployeeLeaveRecord;
exports.getAllEmployeeLeaveRecords = getAllEmployeeLeaveRecords;
exports.getLeaveRecordById = getLeaveRecordById;
exports.updateEmployeeLeaveQuota = updateEmployeeLeaveQuota;
exports.getLeaveApplication = getLeaveApplication;
exports.getAllLeaveApplicationsByEmployeeId =
  getAllLeaveApplicationsByEmployeeId;
exports.getAllLeaveApplications = getAllLeaveApplications;
exports.getAllApprovedLeaveApplications = getAllApprovedLeaveApplications;
exports.getAllPendingLeaveApplications = getAllPendingLeaveApplications;
exports.getNumberOfPendingLeaveApplications =
  getNumberOfPendingLeaveApplications;
exports.updateLeaveApplication = updateLeaveApplication;
exports.vetLeaveApplication = vetLeaveApplication;
exports.approveLeaveApplication = approveLeaveApplication;
exports.cancelLeaveApplication = cancelLeaveApplication;
exports.rejectLeaveApplication = rejectLeaveApplication;
exports.updateTierByEmployeeId = updateTierByEmployeeId;
exports.updateEmployeesToNewTierForDeletedTier =
  updateEmployeesToNewTierForDeletedTier;
exports.getNumberOfEmployeesInTier = getNumberOfEmployeesInTier;
exports.getPublicHolidaysInAYear = getPublicHolidaysInAYear;
