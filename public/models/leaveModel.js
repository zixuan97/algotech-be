const { LeaveStatus, LeaveType } = require('@prisma/client');
const { prisma } = require('./index.js');
const userModel = require('./userModel');
const axios = require('axios');
const { log } = require('../helpers/logger');

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
    },
    include: {
      employee: true,
      vettedBy: true
    }
  });
  return leave;
};

const getAllLeaveApplications = async () => {
  const leaveApplications = await prisma.LeaveApplication.findMany({
    include: {
      employee: true,
      vettedBy: true
    }
  });
  return leaveApplications;
};

const getAllPendingLeaveApplications = async () => {
  const leaveApplications = await prisma.LeaveApplication.findMany({
    where: { status: LeaveStatus.PENDING },
    include: {
      employee: true,
      vettedBy: true
    }
  });
  return leaveApplications;
};

const getAllApprovedLeaveApplications = async () => {
  const leaveApplications = await prisma.LeaveApplication.findMany({
    where: { status: LeaveStatus.APPROVED },
    include: {
      employee: true,
      vettedBy: true
    }
  });
  return leaveApplications;
};

const getLeaveApplicationById = async (req) => {
  const { id } = req;
  const leaveApplication = await prisma.LeaveApplication.findUnique({
    where: { id: Number(id) },
    include: {
      employee: true,
      vettedBy: true
    }
  });
  return leaveApplication;
};

const getAllLeaveApplicationsByEmployeeId = async (req) => {
  const { employeeId } = req;
  const leaveApplications = await prisma.LeaveApplication.findMany({
    where: { employeeId: Number(employeeId) },
    include: {
      employee: true,
      vettedBy: true
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
    vettedById,
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
      vettedById,
      commentsByVetter,
      lastUpdated: new Date(Date.now())
    },
    include: {
      employee: true,
      vettedBy: true
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
    },
    include: {
      employee: true,
      vettedBy: true
    }
  });
  return leaveApplication;
};

const createLeaveQuota = async (req) => {
  const { tier, annual, childcare, compassionate, parental, sick, unpaid } =
    req;
  const leaveQuota = await prisma.LeaveQuota.create({
    data: {
      tier,
      annual,
      childcare,
      compassionate,
      parental,
      sick,
      unpaid
    }
  });
  return leaveQuota;
};

const updateLeaveQuota = async (req) => {
  const { id, tier, annual, childcare, compassionate, parental, sick, unpaid } =
    req;
  const leaveQuota = await prisma.LeaveQuota.update({
    where: { id: Number(id) },
    data: {
      tier,
      annual,
      childcare,
      compassionate,
      parental,
      sick,
      unpaid
    }
  });
  return leaveQuota;
};

const deleteLeaveQuota = async (req) => {
  const { id } = req;
  const leaveQuota = await prisma.LeaveQuota.delete({
    where: { id: Number(id) }
  });
  return leaveQuota;
};

const deleteLeaveQuotaByTier = async (req) => {
  const { tier } = req;
  const leaveQuota = await prisma.LeaveQuota.delete({
    where: { tier }
  });
  return leaveQuota;
};

const getLeaveQuota = async () => {
  const leaveQuota = await prisma.LeaveQuota.findMany({});
  return leaveQuota;
};

const getLeaveQuotaById = async (req) => {
  const { id } = req;
  const leaveQuota = await prisma.LeaveQuota.findUnique({
    where: { id: Number(id) }
  });
  return leaveQuota;
};

const getLeaveQuotaByTier = async (req) => {
  const { tier } = req;
  const leaveQuota = await prisma.LeaveQuota.findUnique({
    where: { tier }
  });
  return leaveQuota;
};

const createLeaveRecordByEmployeeId = async (req) => {
  const { employeeId } = req;
  const employee = await userModel.findUserById({ id: Number(employeeId) });
  const { annual, childcare, compassionate, parental, sick, unpaid } =
    await getLeaveQuotaByTier({
      tier: employee.tier
    });
  const employeeLeaveRecord = await prisma.EmployeeLeaveRecord.create({
    data: {
      employeeId: Number(employeeId),
      annualQuota: annual,
      childcareQuota: childcare,
      compassionateQuota: compassionate,
      parentalQuota: parental,
      sickQuota: sick,
      unpaidQuota: unpaid,
      annualBalance: annual,
      childcareBalance: childcare,
      compassionateBalance: compassionate,
      parentalBalance: parental,
      sickBalance: sick,
      unpaidBalance: unpaid,
      lastUpdated: new Date(Date.now())
    }
  });
  return employeeLeaveRecord;
};

const getLeaveRecordByEmployeeId = async (req) => {
  const { employeeId } = req;
  let employeeLeaveRecord = await prisma.EmployeeLeaveRecord.findUnique({
    where: { employeeId: Number(employeeId) },
    include: { employee: true }
  });
  if (employeeLeaveRecord === null) {
    employeeLeaveRecord = await createLeaveRecordByEmployeeId({
      employeeId
    });
  }
  return employeeLeaveRecord;
};

const getAllEmployeeLeaveRecords = async (req) => {
  const employees = await userModel.getEmployees({});
  let data = [];
  for (let e of employees) {
    const record = await getLeaveRecordByEmployeeId({ employeeId: e.id });
    data.push(record);
  }
  return data;
};

const getLeaveRecordById = async (req) => {
  const { id } = req;
  let employeeLeaveRecord = await prisma.EmployeeLeaveRecord.findUnique({
    where: { id: Number(id) }
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
    tier,
    annualQuota,
    childcareQuota,
    compassionateQuota,
    parentalQuota,
    sickQuota,
    unpaidQuota,
    annualBalance,
    childcareBalance,
    compassionateBalance,
    parentalBalance,
    sickBalance,
    unpaidBalance
  } = req;
  const leaveRecord = await prisma.EmployeeLeaveRecord.update({
    where: { employeeId: Number(employeeId) },
    data: {
      annualQuota,
      childcareQuota,
      compassionateQuota,
      parentalQuota,
      sickQuota,
      unpaidQuota,
      annualBalance,
      childcareBalance,
      compassionateBalance,
      parentalBalance,
      sickBalance,
      unpaidBalance,
      lastUpdated: new Date(Date.now())
    }
  });
  const user = await userModel.findUserById({ id: employeeId });
  const updatedUser = {
    ...user,
    tier
  };
  await userModel.editUser({ updatedUser });
  return leaveRecord;
};

const getLeaveTypeBalanceByEmployeeId = async (req) => {
  const { employeeId, leaveType } = req;
  const employeeLeaveRecord = await getLeaveRecordByEmployeeId({ employeeId });
  switch (leaveType) {
    case LeaveType.ANNUAL:
      return employeeLeaveRecord.annualBalance;
    case LeaveType.CHILDCARE:
      return employeeLeaveRecord.childcareBalance;
    case LeaveType.COMPASSIONATE:
      return employeeLeaveRecord.compassionateBalance;
    case LeaveType.PARENTAL:
      return employeeLeaveRecord.parentalBalance;
    case LeaveType.SICK:
      return employeeLeaveRecord.sickBalance;
    case LeaveType.UNPAID:
      return employeeLeaveRecord.unpaidBalance;
    default:
      return 0;
  }
};

const increaseLeaveTypeBalanceByEmployeeIdByLeaveType = async (req) => {
  const { leaveId, employeeId, leaveType } = req;
  const leaveTypeBalance = await getLeaveTypeBalanceByEmployeeId({
    employeeId,
    leaveType
  });
  const leave = await getLeaveApplicationById({ id: leaveId });
  const numDays = await calcuateNumOfBusinessDays({
    startDate: leave.startDate.toISOString(),
    endDate: leave.endDate.toISOString()
  });
  if (numDays > leaveTypeBalance) {
    return null;
  } else {
    let {
      annualBalance,
      childcareBalance,
      compassionateBalance,
      parentalBalance,
      sickBalance,
      unpaidBalance
    } = await getLeaveRecordByEmployeeId({ employeeId });
    switch (leaveType) {
      case LeaveType.ANNUAL:
        annualBalance += numDays;
        break;
      case LeaveType.CHILDCARE:
        childcareBalance += numDays;
        break;
      case LeaveType.COMPASSIONATE:
        compassionateBalance += numDays;
        break;
      case LeaveType.PARENTAL:
        parentalBalance += numDays;
        break;
      case LeaveType.SICK:
        sickBalance += numDays;
        break;
      case LeaveType.UNPAID:
        unpaidBalance += numDays;
        break;
      default:
        break;
    }
    await updateLeaveRecordByEmployeeId({
      employeeId,
      annualBalance,
      childcareBalance,
      compassionateBalance,
      parentalBalance,
      sickBalance,
      unpaidBalance
    });
  }
};

const decreaseLeaveTypeBalanceByEmployeeIdByLeaveType = async (req) => {
  const { leaveId, employeeId, leaveType } = req;
  const leaveTypeBalance = await getLeaveTypeBalanceByEmployeeId({
    employeeId,
    leaveType
  });
  const leave = await getLeaveApplicationById({ id: leaveId });
  const numDays = await calcuateNumOfBusinessDays({
    startDate: leave.startDate.toISOString(),
    endDate: leave.endDate.toISOString()
  });
  if (numDays > leaveTypeBalance) {
    return null;
  } else {
    let {
      annualBalance,
      childcareBalance,
      compassionateBalance,
      parentalBalance,
      sickBalance,
      unpaidBalance
    } = await getLeaveRecordByEmployeeId({ employeeId });
    switch (leaveType) {
      case LeaveType.ANNUAL:
        annualBalance -= numDays;
        break;
      case LeaveType.CHILDCARE:
        childcareBalance -= numDays;
        break;
      case LeaveType.COMPASSIONATE:
        compassionateBalance -= numDays;
        break;
      case LeaveType.PARENTAL:
        parentalBalance -= numDays;
        break;
      case LeaveType.SICK:
        sickBalance -= numDays;
        break;
      case LeaveType.UNPAID:
        unpaidBalance -= numDays;
        break;
      default:
        break;
    }
    await updateLeaveRecordByEmployeeId({
      employeeId,
      annualBalance,
      childcareBalance,
      compassionateBalance,
      parentalBalance,
      sickBalance,
      unpaidBalance
    });
  }
};

const updateTierByEmployeeId = async (req) => {
  const { employeeId, newTier } = req;
  const { annual, childcare, compassionate, parental, sick, unpaid } =
    await getLeaveQuotaByTier({
      tier: newTier
    });
  // const currLeaveRecord = await getLeaveRecordByEmployeeId({ employeeId });
  // const sickQuotaIncrement = sick - currLeaveRecord.sickQuota;
  // const parentalQuotaIncrement = parental - currLeaveRecord.parentalQuota;
  // const paidQuotaIncrement = paid - currLeaveRecord.paidQuota;
  // const unpaidQuotaIncrement = unpaid - currLeaveRecord.unpaidQuota;
  const updatedRecord = await updateEmployeeLeaveQuota({
    employeeId,
    annualQuota: annual,
    childcareQuota: childcare,
    compassionateQuota: compassionate,
    parentalQuota: parental,
    sickQuota: sick,
    unpaidQuota: unpaid
  });
  const user = await userModel.findUserById({ id: employeeId });
  const updatedUser = {
    ...user,
    tier: newTier
  };
  await userModel.editUser({ updatedUser });
  return updatedRecord;
};

const getAllEmployeesByTier = async (req) => {
  const { tier } = req;
  const employees = await userModel.getUsers({});
  return employees.filter((e) => e.tier === tier);
};

const updateEmployeeLeaveQuota = async (req) => {
  const {
    employeeId,
    tier,
    annualQuota,
    childcareQuota,
    compassionateQuota,
    parentalQuota,
    sickQuota,
    unpaidQuota
  } = req;
  const leaveRecord = await getLeaveRecordByEmployeeId({
    employeeId
  });
  const annualQuotaIncrement =
    annualQuota < leaveRecord.annualQuota &&
    leaveRecord.annualBalance < annualQuota
      ? 0
      : annualQuota - leaveRecord.annualQuota;

  const childcareQuotaIncrement =
    childcareQuota < leaveRecord.childcareQuota &&
    leaveRecord.childcareBalance < childcareQuota
      ? 0
      : childcareQuota - leaveRecord.childcareQuota;

  const compassionateQuotaIncrement =
    compassionateQuota < leaveRecord.compassionateQuota &&
    leaveRecord.compassionateBalance < compassionateQuota
      ? 0
      : compassionateQuota - leaveRecord.compassionateQuota;

  const parentalQuotaIncrement =
    parentalQuota < leaveRecord.parentalQuota &&
    leaveRecord.parentalBalance < parentalQuota
      ? 0
      : parentalQuota - leaveRecord.parentalQuota;

  const sickQuotaIncrement =
    sickQuota < leaveRecord.sickQuota && leaveRecord.sickBalance < sickQuota
      ? 0
      : sickQuota - leaveRecord.sickQuota;

  const unpaidQuotaIncrement =
    unpaidQuota < leaveRecord.unpaidQuota &&
    leaveRecord.unpaidBalance < unpaidQuota
      ? 0
      : unpaidQuota - leaveRecord.unpaidQuota;

  const data = await updateLeaveRecordByEmployeeId({
    employeeId,
    tier,
    annualQuota,
    childcareQuota,
    compassionateQuota,
    parentalQuota,
    sickQuota,
    unpaidQuota,
    annualBalance:
      annualQuota < leaveRecord.annualBalance
        ? annualQuota
        : { increment: annualQuotaIncrement },
    childcareBalance:
      childcareQuota < leaveRecord.childcareBalance
        ? childcareQuota
        : { increment: childcareQuotaIncrement },
    compassionateBalance:
      compassionateQuota < leaveRecord.compassionateBalance
        ? compassionateQuota
        : { increment: compassionateQuotaIncrement },
    parentalBalance:
      parentalQuota < leaveRecord.parentalBalance
        ? parentalQuota
        : { increment: parentalQuotaIncrement },
    sickBalance:
      sickQuota < leaveRecord.sickBalance
        ? sickQuota
        : { increment: sickQuotaIncrement },
    unpaidBalance:
      unpaidQuota < leaveRecord.unpaidBalance
        ? unpaidQuota
        : { increment: unpaidQuotaIncrement }
  });
  return data;
};

const updateEmployeesToNewTierForDeletedTier = async (req) => {
  const { deletedTier, newTier } = req;
  const employeesInDeletedTier = await getAllEmployeesByTier({
    tier: deletedTier
  });
  for (let e of employeesInDeletedTier) {
    const { annual, childcare, compassionate, parental, sick, unpaid } =
      await getLeaveQuotaByTier({
        tier: newTier
      });
    await updateEmployeeLeaveQuota({
      employeeId: e.id,
      annualQuota: annual,
      childcareQuota: childcare,
      compassionateQuota: compassionate,
      parentalQuota: parental,
      sickQuota: sick,
      unpaidQuota: unpaid
    });
    const user = await userModel.findUserById({ id: e.id });
    const updatedUser = {
      ...user,
      tier: newTier
    };
    await userModel.editUser({ updatedUser });
  }
};

const calcuateNumOfBusinessDays = async (req) => {
  const { startDate, endDate } = req;
  const year = startDate.substring(0, 4);
  const allPHs = await getAllPHByYear({ year });
  let phDates = [];
  for (let ph of allPHs) {
    phDates.push(new Date(ph.Date).toISOString());
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const curDate = new Date(start.getTime());
  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();
    if (
      dayOfWeek !== 0 &&
      dayOfWeek !== 6 &&
      !phDates.includes(curDate.toISOString())
    )
      count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};

const getAllPHByYear = async (req) => {
  const { year } = req;
  const url = `https://notes.rjchow.com/singapore_public_holidays/api/${year}/data.json`;
  return await axios.get(url).then((res) => {
    const response = res.data;
    log.out(`OK_ORDER_GET-ALL-PH-IN-${year}`);
    return response;
  });
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
exports.deleteLeaveQuotaByTier = deleteLeaveQuotaByTier;
exports.getLeaveQuota = getLeaveQuota;
exports.getLeaveQuotaById = getLeaveQuotaById;
exports.getLeaveQuotaByTier = getLeaveQuotaByTier;
exports.createLeaveRecordByEmployeeId = createLeaveRecordByEmployeeId;
exports.getLeaveRecordById = getLeaveRecordById;
exports.getLeaveRecordByEmployeeId = getLeaveRecordByEmployeeId;
exports.getAllEmployeeLeaveRecords = getAllEmployeeLeaveRecords;
exports.updateLeaveRecordByEmployeeId = updateLeaveRecordByEmployeeId;
exports.getLeaveTypeBalanceByEmployeeId = getLeaveTypeBalanceByEmployeeId;
exports.increaseLeaveTypeBalanceByEmployeeIdByLeaveType =
  increaseLeaveTypeBalanceByEmployeeIdByLeaveType;
exports.decreaseLeaveTypeBalanceByEmployeeIdByLeaveType =
  decreaseLeaveTypeBalanceByEmployeeIdByLeaveType;
exports.updateTierByEmployeeId = updateTierByEmployeeId;
exports.getAllEmployeesByTier = getAllEmployeesByTier;
exports.updateEmployeeLeaveQuota = updateEmployeeLeaveQuota;
exports.updateEmployeesToNewTierForDeletedTier =
  updateEmployeesToNewTierForDeletedTier;
exports.calcuateNumOfBusinessDays = calcuateNumOfBusinessDays;
exports.getAllPHByYear = getAllPHByYear;
