const { LeaveStatus, LeaveType } = require('@prisma/client');
const { prisma } = require('./index.js');
const userModel = require('./userModel');

const createLeaveApplication = async (req) => {
  const { startDate, endDate, leaveType, description, employeeId } = req;
  const leave = await prisma.LeaveApplication.create({
    data: {
      applicationDate: new Date(Date.now()),
      startDate,
      endDate,
      leaveType,
      description,
      lastUpdated: new Date(Date.now()),
      employeeId
    }
  });
  return leave;
};

const getAllLeaveApplications = async () => {
  const leaveApplications = await prisma.LeaveApplication.findMany({
    include: {
      employee: true
    }
  });
  return leaveApplications;
};

const getAllPendingLeaveApplications = async () => {
  const leaveApplications = await prisma.LeaveApplication.findMany({
    where: { status: LeaveStatus.PENDING },
    include: {
      employee: true
    }
  });
  return leaveApplications;
};

const getAllApprovedLeaveApplications = async () => {
  const leaveApplications = await prisma.LeaveApplication.findMany({
    where: { status: LeaveStatus.APPROVED },
    include: {
      employee: true
    }
  });
  return leaveApplications;
};

const getLeaveApplicationById = async (req) => {
  const { id } = req;
  const leaveApplication = await prisma.LeaveApplication.findUnique({
    where: { id: Number(id) },
    include: {
      employee: true
    }
  });
  return leaveApplication;
};

const getAllLeaveApplicationsByEmployeeId = async (req) => {
  const { employeeId } = req;
  const leaveApplications = await prisma.LeaveApplication.findMany({
    where: { employeeId: Number(employeeId) },
    include: {
      employee: true
    }
  });
  return leaveApplications;
};

const updateLeaveApplication = async (req) => {
  const {
    id,
    startDate,
    endDate,
    leaveType,
    status,
    description,
    vettedBy,
    commentsByVetter
  } = req;
  const leaveApplication = await prisma.LeaveApplication.update({
    where: { id: Number(id) },
    data: {
      startDate,
      endDate,
      leaveType,
      status,
      description,
      vettedBy,
      commentsByVetter,
      lastUpdated: new Date(Date.now())
    },
    include: {
      employee: true
    }
  });
  return leaveApplication;
};

const approveLeaveApplication = async (req) => {
  const { id, status, vettedBy, commentsByVetter } = req;
  const leaveApplication = await prisma.LeaveApplication.update({
    where: { id },
    data: {
      id,
      status,
      vettedBy,
      commentsByVetter,
      lastUpdated: new Date(Date.now())
    }
  });
  return leaveApplication;
};

const createLeaveQuota = async (req) => {
  const { tier, medical, parental, paid, unpaid } = req;
  const leaveQuota = await prisma.LeaveQuota.create({
    data: {
      tier,
      medical,
      parental,
      paid,
      unpaid
    }
  });
  return leaveQuota;
};

const updateLeaveQuota = async (req) => {
  const { tier, medical, parental, paid, unpaid } = req;
  const leaveQuota = await prisma.LeaveQuota.update({
    where: { tier: Number(tier) },
    data: {
      medical,
      parental,
      paid,
      unpaid
    }
  });
  return leaveQuota;
};

const deleteLeaveQuota = async (req) => {
  const { tier } = req;
  const leaveQuota = await prisma.LeaveQuota.delete({
    where: { tier: Number(tier) }
  });
  return leaveQuota;
};

const getLeaveQuota = async () => {
  const leaveQuota = await prisma.LeaveQuota.findMany({});
  return leaveQuota;
};

const getLeaveQuotaByTier = async (req) => {
  const { tier } = req;
  const leaveQuota = await prisma.LeaveQuota.findUnique({
    where: { tier: Number(tier) }
  });
  console.log(leaveQuota);
  return leaveQuota;
};

const createLeaveRecordByEmployeeId = async (req) => {
  const { employeeId } = req;
  const employee = await userModel.findUserById({ id: Number(employeeId) });
  const { medical, parental, paid, unpaid } = await getLeaveQuotaByTier({
    tier: employee.tier
  });
  const employeeLeaveRecord = await prisma.EmployeeLeaveRecord.create({
    data: {
      employeeId: Number(employeeId),
      medicalQuota: medical,
      parentalQuota: parental,
      paidQuota: paid,
      unpaidQuota: unpaid,
      medicalBalance: medical,
      parentalBalance: parental,
      paidBalance: paid,
      unpaidBalance: unpaid,
      lastUpdated: new Date(Date.now())
    }
  });
  return employeeLeaveRecord;
};

const getLeaveRecordByEmployeeId = async (req) => {
  const { employeeId } = req;
  let employeeLeaveRecord = await prisma.EmployeeLeaveRecord.findUnique({
    where: { employeeId: Number(employeeId) }
  });
  if (employeeLeaveRecord === null) {
    employeeLeaveRecord = await createLeaveRecordByEmployeeId({
      employeeId
    });
  }
  return employeeLeaveRecord;
};

const updateLeaveRecordByEmployeeId = async (req) => {
  const {
    employeeId,
    medicalQuota,
    parentalQuota,
    paidQuota,
    unpaidQuota,
    medicalBalance,
    parentalBalance,
    paidBalance,
    unpaidBalance
  } = req;
  const leaveRecord = await prisma.EmployeeLeaveRecord.update({
    where: { employeeId: Number(employeeId) },
    data: {
      medicalQuota,
      parentalQuota,
      paidQuota,
      unpaidQuota,
      medicalBalance,
      parentalBalance,
      paidBalance,
      unpaidBalance,
      lastUpdated: new Date(Date.now())
    }
  });
  return leaveRecord;
};

const getLeaveTypeBalanceByEmployeeId = async (req) => {
  const { employeeId, leaveType } = req;
  const employeeLeaveRecord = await getLeaveRecordByEmployeeId({ employeeId });
  switch (leaveType) {
    case LeaveType.MEDICAL:
      return employeeLeaveRecord.medicalBalance;
    case LeaveType.PARENTAL:
      return employeeLeaveRecord.parentalBalance;
    case LeaveType.PAID:
      return employeeLeaveRecord.paidBalance;
    case LeaveType.UNPAID:
      return employeeLeaveRecord.unpaidBalance;
    default:
      res.status(e.code).json('Leave type does not exist');
  }
};

const updateLeaveTypeBalanceByEmployeeId = async (req) => {
  const { employeeId, leaveType, isIncrement } = req;
  let { medicalBalance, parentalBalance, paidBalance, unpaidBalance } =
    await getLeaveRecordByEmployeeId({ employeeId });
  switch (leaveType) {
    case LeaveType.MEDICAL:
      isIncrement ? medicalBalance++ : medicalBalance--;
      break;
    case LeaveType.PARENTAL:
      isIncrement ? parentalBalance++ : parentalBalance--;
      break;
    case LeaveType.PAID:
      isIncrement ? paidBalance++ : paidBalance--;
      break;
    case LeaveType.UNPAID:
      isIncrement ? unpaidBalance++ : unpaidBalance--;
      break;
    default:
      res.status(e.code).json('Leave type does not exist');
  }
  await updateLeaveRecordByEmployeeId({
    employeeId,
    medicalBalance,
    parentalBalance,
    paidBalance,
    unpaidBalance
  });
};

const updateTierByEmployeeId = async (req) => {
  const { employeeId, newTier } = req;
  const { medical, parental, paid, unpaid } = await getLeaveQuotaByTier({
    tier: newTier
  });
  // const currLeaveRecord = await getLeaveRecordByEmployeeId({ employeeId });
  // const medicalQuotaIncrement = medical - currLeaveRecord.medicalQuota;
  // const parentalQuotaIncrement = parental - currLeaveRecord.parentalQuota;
  // const paidQuotaIncrement = paid - currLeaveRecord.paidQuota;
  // const unpaidQuotaIncrement = unpaid - currLeaveRecord.unpaidQuota;
  const updatedRecord = await updateEmployeeLeaveQuota({
    employeeId,
    medicalQuota: medical,
    parentalQuota: parental,
    paidQuota: paid,
    unpaidQuota: unpaid
    // medicalBalance: { increment: medicalQuotaIncrement },
    // parentalBalance: { increment: parentalQuotaIncrement },
    // paidBalance: { increment: paidQuotaIncrement },
    // unpaidBalance: { increment: unpaidQuotaIncrement }
  });
  const user = await userModel.findUserById({ id: employeeId });
  const updatedUser = {
    ...user,
    tier: newTier
  };
  console.log(updatedUser);
  await userModel.editUser({ updatedUser });
  return updatedRecord;
};

const getAllEmployeesByTier = async (req) => {
  const { tier } = req;
  const employees = await userModel.getUsers({});
  return employees.filter((e) => e.tier === Number(tier));
};

const updateEmployeeLeaveQuota = async (req) => {
  const { employeeId, medicalQuota, parentalQuota, paidQuota, unpaidQuota } =
    req;
  const leaveRecord = await getLeaveRecordByEmployeeId({
    employeeId
  });
  const medicalQuotaIncrement =
    medicalQuota < leaveRecord.medicalQuota &&
    leaveRecord.medicalBalance < medicalQuota
      ? 0
      : medicalQuota - leaveRecord.medicalQuota;
  const parentalQuotaIncrement =
    parentalQuota < leaveRecord.parentalQuota &&
    leaveRecord.parentalBalance < parentalQuota
      ? 0
      : parentalQuota - leaveRecord.parentalQuota;
  const paidQuotaIncrement =
    paidQuota < leaveRecord.paidQuota && leaveRecord.paidBalance < paidQuota
      ? 0
      : paidQuota - leaveRecord.paidQuota;
  const unpaidQuotaIncrement =
    unpaidQuota < leaveRecord.unpaidQuota &&
    leaveRecord.unpaidBalance < unpaidQuota
      ? 0
      : unpaidQuota - leaveRecord.unpaidQuota;
  const data = await updateLeaveRecordByEmployeeId({
    employeeId,
    medicalQuota,
    parentalQuota,
    paidQuota,
    unpaidQuota,
    medicalBalance:
      medicalQuota < leaveRecord.medicalBalance
        ? medicalQuota
        : { increment: medicalQuotaIncrement },
    parentalBalance:
      parentalQuota < leaveRecord.parentalBalance
        ? parentalQuota
        : { increment: parentalQuotaIncrement },
    paidBalance:
      paidQuota < leaveRecord.paidBalance
        ? paidQuota
        : { increment: paidQuotaIncrement },
    unpaidBalance:
      unpaidQuota < leaveRecord.unpaidBalance
        ? unpaidQuota
        : { increment: unpaidQuotaIncrement }
  });
  return data;
};

exports.createLeaveApplication = createLeaveApplication;
exports.getAllLeaveApplications = getAllLeaveApplications;
exports.getAllPendingLeaveApplications = getAllPendingLeaveApplications;
exports.getAllApprovedLeaveApplications = getAllApprovedLeaveApplications;
exports.getLeaveApplicationById = getLeaveApplicationById;
exports.getAllLeaveApplicationsByEmployeeId =
  getAllLeaveApplicationsByEmployeeId;
exports.updateLeaveApplication = updateLeaveApplication;
exports.approveLeaveApplication = approveLeaveApplication;
exports.createLeaveQuota = createLeaveQuota;
exports.updateLeaveQuota = updateLeaveQuota;
exports.deleteLeaveQuota = deleteLeaveQuota;
exports.getLeaveQuota = getLeaveQuota;
exports.getLeaveQuotaByTier = getLeaveQuotaByTier;
exports.createLeaveRecordByEmployeeId = createLeaveRecordByEmployeeId;
exports.getLeaveRecordByEmployeeId = getLeaveRecordByEmployeeId;
exports.updateLeaveRecordByEmployeeId = updateLeaveRecordByEmployeeId;
exports.getLeaveTypeBalanceByEmployeeId = getLeaveTypeBalanceByEmployeeId;
exports.updateLeaveTypeBalanceByEmployeeId = updateLeaveTypeBalanceByEmployeeId;
exports.updateTierByEmployeeId = updateTierByEmployeeId;
exports.getAllEmployeesByTier = getAllEmployeesByTier;
exports.updateEmployeeLeaveQuota = updateEmployeeLeaveQuota;
