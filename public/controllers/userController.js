const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');

const createUser = async (req, res) => {
  const { email, password } = req.body;
  const { error } = await common.awaitWrap(
    userModel.createUser({
      email,
      password
    })
  );
  if (error) {
    log.error('ERR_USER_CREATE-USER', error.message);
    res.json(Error.http(error));
  } else {
    log.out('OK_USER_CREATE-USER');
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
    log.out('OK_USER_GET-USER');
    res.json(user);
  } catch (error) {
    log.error('ERR_USER_GET-USER', error.message);
    res.status(500).send('Server Error');
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await userModel.getUserDetails({ id: id });
    log.out('OK_USER_GET-USER-DETAILS');
    res.json(user);
  } catch (error) {
    log.error('ERR_USER_GET-USER-DETAILS', error.message);
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
        if (err) {
          log.error('ERR_AUTH_LOGIN', err.message);
          res.status(500).send('Server Error');
        }
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

const sendForgetEmailPassword = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await userModel.findUserByEmail({ email });
    if (user != null) {
      await userModel.sendEmail({ email: email });
      res.json({
        message: 'Email sent'
      });
    } else {
      console.error('User is null');
      res.status(500).send('Server Error');
    }
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
exports.sendForgetEmailPassword = sendForgetEmailPassword;
