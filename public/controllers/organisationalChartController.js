const userModel = require('../models/userModel');

const buildOrgChart = (managerId, adjList) =>
  adjList
    .filter(({ manager }) => manager === managerId)
    .map(({ managerId, e }) => ({
      user: e,
      subordinates: buildOrgChart(managerId, adjList)
    }));

const organisationChart = async (req, res) => {
  const employees = await userModel.getEmployeesForOrgChart({});
  let adjList = [];
  for (let e of employees) {
    if (e.manager === null) {
      e.managerId = 0;
    } else {
      e.manager.password = '';
    }
    e.password = '';
    adjList.push({ managerId: e.id, manager: e.managerId, e });
  }
  res.status(200).json(buildOrgChart(0, adjList));
};

exports.organisationChart = organisationChart;
