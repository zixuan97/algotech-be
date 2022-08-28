const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const common = require('@kelchy/common');
const Error = require('../helpers/error');

const create = async (req, res) => {
  const { email, password } = req.body;
  const { error } = await common.awaitWrap(
    userModel.create({
      email,
      password
    })
  );

  if (error) {
    res.json(Error.http(error));
  } else {
    return res.json({ message: 'User created' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findUserByEmail({
    email
  });
  console.log(user);
  if (user && (await bcrypt.compare(password, user.password))) {
    // Create token
    const token = jwt.sign({ user_id: user.id, email }, process.env.TOKEN_KEY, {
      expiresIn: '2h'
    });

    // save user token
    user.token = token;

    // user
    res.status(200).json(user);
  } else {
    res.status(400).send('Invalid Credentials');
  }
};

exports.create = create;
exports.login = login;
