const userModel = require('../models/userModel');

const buildOrgChart = (id, xs) =>
  xs
    .filter(({ manager }) => manager == id)
    .map(({ id }) => ({
      id,
      subordinates: buildOrgChart(id, xs)
    }));

const organisationChart = async (req, res) => {
  const employees = await userModel.getEmployees({});
  let adjList = [];
  for (let e of employees) {
    if (e.manager === null) e.managerId = 0;
    adjList.push({ id: e.id, manager: e.managerId });
  }
  res.status(200).json(buildOrgChart(0, adjList));
};

exports.organisationChart = organisationChart;
