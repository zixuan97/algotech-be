const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { UserRole } = require('@prisma/client');

const createUser = async (req, res) => {
  const { email, password } = req.body;
  const { error } = await common.awaitWrap(
    userModel.createUser({
      email,
      password
    })
  );

  if (error) {
    res.json(Error.http(error));
  } else {
    res.status(200).json({ message: 'User created' });
  }
};

/**
 * Gets user by ID
 */
const getUser = async (req, res) => {
  try {
    const user = await userModel.findUserById({ id: req.user.user_id });
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await userModel.getUserDetails({ id: id });
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Authenticates a user with the given email and password, and returns a signed JWT token as a response
 */
const auth = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findUserByEmail({
    email
  });
  if (
    user &&
    (await bcrypt.compare(password, user.password)) &&
    user.status === 'ACTIVE'
  ) {
    // Create token
    jwt.sign(
      { user_id: user.id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: '2h'
      },
      (err, token) => {
        if (err) res.status(500).send('Server Error');
        user.token = token;
        res.json({ token });
      }
    );
  } else {
    res.status(400).send('Invalid Credentials');
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers({});
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

const editUser = async (req, res) => {
  try {
    const user = await userModel.editUser({ updatedUser: req.body });
    res.json({
      message: 'User edited',
      payload: user
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await userModel.deleteUserById({ id: id });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

const enableUser = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await userModel.enableUser({ id: id });
    res.json({
      message: 'User enabled',
      payload: user
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

const disableUser = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await userModel.disableUser({ id: id });
    res.json({
      message: 'User disabled',
      payload: user
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// have to make sure only admin can do this
const changeUserRole = async (req, res) => {
  try {
    const { id, action } = req.query;
    const user = await userModel.changeUserRole({ id: id, action: action });
    res.json({
      message: 'User role updated',
      payload: user
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

exports.createUser = createUser;
exports.getUser = getUser;
exports.getUserDetails = getUserDetails;
exports.auth = auth;
exports.getUsers = getUsers;
exports.editUser = editUser;
exports.deleteUser = deleteUser;
exports.enableUser = enableUser;
exports.disableUser = disableUser;
exports.changeUserRole = changeUserRole;
