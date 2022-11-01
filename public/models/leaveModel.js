const { prisma } = require('./index.js');

const createLeave = async (req) => {
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
  } = req;
  const leave = await prisma.leave.create({
    data: {
      applicationDate: new Date(),
      startDate,
      endDate,
      leaveType,
      status,
      description,
      vettedBy,
      commentsByVetter,
      lastUpdated,
      employeeId
    }
  });
  return leave;
};

const getAllLeaves = async () => {
  const leaves = await prisma.leave.findMany({});
  return leaves;
};

const getLeaveById = async (req) => {
  const { id } = req;
  const leave = await prisma.leave.findUnique({
    where: { id: Number(id) }
  });
  return leave;
};

const getAllLeavesByEmployeeId = async () => {
  const { employeeId } = req;
  const leaves = await prisma.leave.findMany({
    where: { employeeId: Number(employeeId) }
  });
  return leaves;
};

const updateLeave = async (req) => {
  const {
    startDate,
    endDate,
    leaveType,
    status,
    description,
    vettedBy,
    commentsByVetter,
    lastUpdated
  } = req;
  leave = await prisma.leave.update({
    where: { id },
    data: {
      startDate,
      endDate,
      leaveType,
      status,
      description,
      vettedBy,
      commentsByVetter,
      lastUpdated
    }
  });
  return leave;
};

const deleteLeave = async (req) => {
  const { id } = req;
  await prisma.leave.delete({
    where: {
      id: Number(id)
    }
  });
};

exports.createLeave = createLeave;
exports.getAllLeaves = getAllLeaves;
exports.getLeaveById = getLeaveById;
exports.getAllLeavesByEmployeeId = getAllLeavesByEmployeeId;
exports.updateLeave = updateLeave;
exports.deleteLeave = deleteLeave;
