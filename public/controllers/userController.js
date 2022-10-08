const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const emailHelper = require('../helpers/email');
const { UserStatus, UserRole } = require('@prisma/client');

const createUser = async (req, res) => {
  const { firstName, lastName, email, role, isVerified } = req.body;

  const user = await userModel.findUserByEmail({ email });
  if (user) {
    log.error('ERR_USER_CREATE-USER');
    res.status(400).json({ message: 'User already exists' });
  } else {
    const password = await common.awaitWrap(userModel.generatePassword());
    const content =
      'Hi ' +
      firstName +
      ' ' +
      lastName +
      '! Your generated password is ' +
      password.data +
      '.';
    try {
      await emailHelper.sendEmail({
        recipientEmail: email,
        subject: 'Your generated password',
        content
      });
      console.log('Email sent');
    } catch (error) {
      console.log('Error sending email');
    }
    const { error } = await common.awaitWrap(
      userModel.createUser({
        firstName,
        lastName,
        email,
        password: password.data,
        role,
        isVerified
      })
    );
    if (error) {
      log.error('ERR_USER_CREATE-USER', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_USER_CREATE-USER');
      res.status(200).json({ message: 'User created' });
    }
  }
};

const createB2BUser = async (req, res) => {
  const { firstName, lastName, email, role, status, isVerified } = req.body;
  const user = await userModel.findUserByEmail({ email });
  if (user) {
    log.error('ERR_USER_CREATE-B2B-USER');
    res.status(400).json({ message: 'User already exists' });
  } else {
    const { error } = await common.awaitWrap(
      userModel.createUser({
        firstName,
        lastName,
        email,
        role,
        status,
        isVerified
      })
    );
    if (error) {
      log.error('ERR_USER_CREATE-B2B-USER', error.message);
      const e = Error.http(error);
      res.status(e.code).json(e.message);
    } else {
      log.out('OK_USER_CREATE-B2B-USER');
      res.status(200).json({ message: 'B2B User created' });
    }
  }
};

/**
 * Gets user by ID
 */
const getUser = async (req, res) => {
  try {
    const user = await userModel.findUserById({ id: req.user.userId });
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
    const { id } = req.params;
    const user = await userModel.getUserDetails({ id });
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
  if (user && user.status === UserStatus.DISABLED) {
    res.status(400).send('User has been disabled.');
  } else if (
    user &&
    (await bcrypt.compare(password, user.password)) &&
    user.status === UserStatus.ACTIVE
  ) {
    // Create token
    jwt.sign(
      { userId: user.id, email, role: user.role },
      process.env.TOKEN_KEY,
      {
        expiresIn: '2h'
      },
      (err, token) => {
        if (err) {
          log.error('ERR_AUTH_LOGIN', err.message);
          res.status(500).send('Server Error');
        }
        log.out('OK_AUTH_LOGIN');
        user.token = token;
        res.json({ token });
      }
    );
  } else {
    log.error('ERR_AUTH_LOGIN', 'Invalid Credentials');
    res.status(400).send('Invalid Credentials');
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers({});
    log.out('OK_USER_GET-USERS');
    res.json(users.filter((u) => u.id != req.user.userId));
  } catch (error) {
    log.error('ERR_USER_GET-USERS', err.message);
    res.status(500).send('Server Error');
  }
};

const editUser = async (req, res) => {
  const updatedUser = req.body;
  const email = updatedUser.email;
  let user = await userModel.findUserByEmail({ email });
  if (user && user.id != updatedUser.id) {
    log.error('ERR_USER_EDIT-USER');
    res.status(400).json({ message: 'User already exists' });
  } else {
    try {
      user = await userModel.editUser({ updatedUser: req.body });
      log.out('OK_USER_EDIT-USER');
      res.json({
        message: 'User edited',
        payload: user
      });
    } catch (error) {
      log.error('ERR_USER_EDIT-USER', error.message);
      res.status(500).send('Server Error');
    }
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.deleteUserById({ id });
    log.out('OK_USER_DELETE-USER');
    res.json({ message: 'User deleted' });
  } catch (error) {
    log.error('ERR_USER_DELETE-USER', error.message);
    res.status(500).send('Server Error');
  }
};

const enableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.enableUser({ id });
    log.out('OK_USER_ENABLE-USER');
    res.json({
      message: 'User enabled',
      payload: user
    });
  } catch (error) {
    log.error('ERR_USER_ENABLE-USER', error.message);
    res.status(500).send('Server Error');
  }
};

const disableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.disableUser({ id });
    log.out('OK_USER_DISABLE-USER');
    res.json({
      message: 'User disabled',
      payload: user
    });
  } catch (error) {
    log.error('ERR_USER_DISABLE-USER', error.message);
    res.status(500).send('Server Error');
  }
};

// have to make sure only admin can do this
const changeUserRole = async (req, res) => {
  try {
    const { id, action } = req.params;
    const user = await userModel.changeUserRole({ id, action });
    log.out('OK_USER_CHANGE-USER-ROLE');
    res.json({
      message: 'User role updated',
      payload: user
    });
  } catch (error) {
    log.error('ERR_USER_CHANGE-USER-ROLE', error.message);
    res.status(500).send('Server Error');
  }
};

const sendForgetEmailPassword = async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    const user = await userModel.findUserByEmail({ email: recipientEmail });
    if (user != null) {
      const subject = 'Your generated password';
      const updatedPassword = await common.awaitWrap(
        userModel.generatePassword()
      );
      const content =
        'Your generated password is ' + updatedPassword.data + '.';
      const updatedUser = {
        id: user.id,
        password: updatedPassword.data,
        isVerified: false
      };
      await userModel.editUser({ updatedUser });
      await emailHelper.sendEmail({ recipientEmail, subject, content });
      log.out('OK_USER_SENT-EMAIL');
      res.json({
        message: 'Email sent'
      });
    } else {
      log.error('ERR_USER_SEND', 'user is not registered');
      res.status(500).send('Failed to send email as user is not registered');
    }
  } catch (error) {
    log.error('ERR_USER_SEND', error.message);
    res.status(500).send('Server Error');
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { userEmail, currentPassword, newPassword } = req.body;
    if (currentPassword === newPassword) {
      log.out('ERR_USER_VERIFY-PW');
      res
        .status(200)
        .json({ message: 'Old and new password cannot be the same' });
    }
    const user = await userModel.findUserByEmail({ email: userEmail });
    if (user) {
      const is_equal = await userModel.verifyPassword({
        userEmail,
        currentPassword,
        newPassword
      });
      if (is_equal) {
        log.out('OK_USER_VERIFY-PW');
        res.status(200).json({ message: 'Password verified' });
      } else {
        log.out('ERR_USER_VERIFY-PW');
        res.status(400).json({ message: 'Passwords do not match' });
      }
    } else {
      log.error('ERR_USER_VERIFY-PW');
      res.status(400).json({ message: 'User does not exist' });
    }
  } catch (error) {
    log.error('ERR_USER_VERIFY-PW', error.message);
    res.status(500).send('Server Error');
  }
};

const approveB2BUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.updateB2BUserStatus({ id, status: UserStatus.ACTIVE });
    const { data } = await common.awaitWrap(userModel.generatePassword());
    user.password = data;
    await userModel.editUser({ updatedUser: user });
    const content =
      'Hi ' +
      user.firstName +
      ' ' +
      user.lastName +
      '! Your account has been approved. Your generated password is ' +
      data +
      '.';
    try {
      await emailHelper.sendEmail({
        recipientEmail: user.email,
        subject: 'Your generated password',
        content
      });
      console.log('Email sent');
    } catch (error) {
      console.log('Error sending email');
    }
    log.out('OK_USER_APPROVE-USER');
    res.json({
      message: 'Account creation request approved.'
    });
  } catch (error) {
    log.error('ERR_USER_APPROVE-USER', error.message);
    res.status(500).send('Server Error');
  }
};

const rejectB2BUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.updateB2BUserStatus({ id, status: UserStatus.REJECTED });
    const content =
    'Hi ' +
    user.firstName +
    ' ' +
    user.lastName +
    '! Your request to create an account has been rejected. Please contact our admin.';
    try {
      await emailHelper.sendEmail({
        recipientEmail: user.email,
        subject: 'Your account request status',
        content
      });
      console.log('Email sent');
    } catch (error) {
      console.log('Error sending email');
    }
    log.out('OK_USER_REJECT-USER');
    res.json({
      message: 'Account creation request rejected.',
      payload: user
    });
  } catch (error) {
    log.error('ERR_USER_REJECT-USER', error.message);
    res.status(500).send('Server Error');
  }
};

const getAllB2BUsers = async (req, res) => {
  try {
    const users = await userModel.getB2BUsers({});
    log.out('OK_USER_GET-B2B-USERS');
    res.json(users);
  } catch (error) {
    log.error('ERR_USER_GET-B2B-USERS', err.message);
    res.status(500).send('Server Error');
  }
};

const getAllPendingB2BUsers = async (req, res) => {
  try {
    const users = await userModel.getB2BUsers({});
    log.out('OK_USER_GET-PENDING-B2B-USERS');
    res.json(users.filter((u) => u.status === UserStatus.PENDING));
  } catch (error) {
    log.error('ERR_USER_GET-PENDING-B2B-USERS', err.message);
    res.status(500).send('Server Error');
  }
};

const getAllNonB2BUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers({});
    const filteredUsers = users.filter(u => u.role !== UserRole.CORPORATE && u.role !== UserRole.DISTRIBUTOR);
    log.out('OK_USER_GET-NON-B2B-USERS');
    res.json(filteredUsers);
  } catch (error) {
    log.error('ERR_USER_GET-NON-B2B-USERS', err.message);
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
exports.verifyPassword = verifyPassword;
exports.createB2BUser = createB2BUser;
exports.approveB2BUser = approveB2BUser;
exports.rejectB2BUser = rejectB2BUser;
exports.getAllB2BUsers = getAllB2BUsers;
exports.getAllPendingB2BUsers = getAllPendingB2BUsers;
exports.getAllNonB2BUsers = getAllNonB2BUsers;

