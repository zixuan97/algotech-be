const userModel = require('../models/userModel');

class Employee {
  constructor(name) {
    this.name = name;
    this.children = [];
  }
}

class OrgChart {
  constructor() {
    this.root = null;
  }

  add(name, toEmployeeData) {
    const node = new Employee(name);
    // If the toEmployeeData arg is passed, find it. Otherwise, store null.
    const parent = toEmployeeData ? this.findBFS(toEmployeeData) : null;

    // Push new node to parent whose value matches toEmployeeData
    if (parent) {
      parent.children.push(node);
    } else {
      // If there's no parent, make this the root node
      if (!this.root) this.root = node;
      else return 'Tried to store node as root when root already exists.';
    }
  }

  findBFS(name) {
    const queue = [this.root];
    let _node = null;

    // Go thru every node in BFS
    this.traverseBFS((node) => {
      // Return match if found
      if (node.name === name) {
        _node = node;
      }
    });

    return _node;
  }

  traverseBFS(cb) {
    const queue = [this.root];

    if (cb)
      while (queue.length) {
        // Store current node & remove it from queue
        const node = queue.shift();

        cb(node);

        // Push children of current node to end of queue
        for (const child of node.children) {
          queue.push(child);
        }
      }
  }
}

function buildTree(node, child, tree) {
  tree.add(node, child);
  for (let n of node.subordinates) {
    tree = buildTree(n, node, tree);
  }
}

const organisationChart = async (req, res) => {
  let tree = new OrgChart();
  const employees = await userModel.getEmployees({});
  for (let e of employees) {
    buildTree(e, tree);
  }
  // tree.add('Employee1');
  // tree.add('Employee2', 'Employee1');
  // tree.add('Employee3', 'Employee1');
  // tree.add('Employee4', 'Employee2');
  // console.log(tree.findBFS('Employee1'));
  const finalRes = [];

  tree.traverseBFS((node) => {
    finalRes.push(node);
  });

  res.status(200).json(finalRes);
};

exports.organisationChart = organisationChart;
