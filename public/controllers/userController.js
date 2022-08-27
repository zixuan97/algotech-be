const userModel = require('../models/userModel');

const create = async (req, res) => {
  const { email, password } = req.body;

  const response = await userModel.create({
    email,
    password
  });
  return res.json({ message: 'User created', response });
};

exports.create = create;
