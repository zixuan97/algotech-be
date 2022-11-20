const userModel = require('../models/userModel');
const leaveModel = require('../models/leaveModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { log } = require('../helpers/logger');
const emailHelper = require('../helpers/email');
const { UserStatus, UserRole } = require('@prisma/client');

const createUser = async (req, res) => {
  const { firstName, lastName, email, role, isVerified, tier } = req.body;
  const user = await userModel.findUserByEmail({ email });
  if (user) {
    log.error('ERR_USER_CREATE-USER', {
      err: 'User already exist',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'User already exists' });
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
    } catch (error) {
      return res.status(400).send('Error sending email');
    }
    const { data, error } = await common.awaitWrap(
      userModel.createUser({
        firstName,
        lastName,
        email,
        password: password.data,
        role,
        isVerified,
        tier
      })
    );

    if (error) {
      log.error('ERR_USER_CREATE-USER', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      if (tier !== undefined) {
        try {
          await leaveModel.createLeaveRecordByEmployeeId({
            employeeId: data.id
          });
        } catch (error) {
          log.error('ERR_USER_CREATE-USER', {
            err: error.message,
            req: { body: req.body, params: req.params }
          });
          const e = Error.http(error);
          return res.status(e.code).json(e.message);
        }
      }
      log.out('OK_USER_CREATE-USER', {
        req: { body: req.body, params: req.params },
        res: { message: 'User created' }
      });
      return res.status(200).json({ message: 'User created' });
    }
  }
};

const createB2BUser = async (req, res) => {
  const { firstName, lastName, email, status, isVerified, company, contactNo } =
    req.body;
  const user = await userModel.findUserByEmail({ email });
  if (user) {
    log.error('ERR_USER_CREATE-B2B-USER', {
      err: 'B2B user already exist',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'User already exists' });
  } else {
    const { error } = await common.awaitWrap(
      userModel.createUser({
        firstName,
        lastName,
        email,
        role: UserRole.B2B,
        status,
        isVerified,
        company,
        contactNo
      })
    );
    if (error) {
      log.error('ERR_USER_CREATE-B2B-USER', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      const e = Error.http(error);
      return res.status(e.code).json(e.message);
    } else {
      log.out('OK_USER_CREATE-B2B-USER', {
        req: { body: req.body, params: req.params },
        res: { message: 'B2B User created' }
      });
      return res.status(200).json({ message: 'B2B User created' });
    }
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userModel.findUserById({ id: req.user.userId });
    delete user.password;
    log.out('OK_USER_GET-USER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(user)
    });
    return res.json(user);
  } catch (error) {
    log.error('ERR_USER_GET-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting user');
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserDetails({ id });
    log.out('OK_USER_GET-USER-DETAILS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(user)
    });
    return res.json(user);
  } catch (error) {
    log.error('ERR_USER_GET-USER-DETAILS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting user details');
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
    return res.status(400).send('User has been disabled.');
  } else if (user && user.status === UserStatus.REJECTED) {
    return res.status(400).send('User has been rejected.');
  } else if (user && user.status === UserStatus.PENDING) {
    return res.status(400).send('User is still pending verification.');
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
          log.error('ERR_AUTH_LOGIN', {
            err: err.message
          });
          return res.status(400).send('Error authenticating');
        }
        log.out('OK_AUTH_LOGIN');
        user.token = token;
        return res.json({ token });
      }
    );
  } else {
    log.error('ERR_AUTH_LOGIN', {
      err: 'Invalid Credentials'
    });
    return res.status(400).send('Invalid Credentials');
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers({});
    log.out('OK_USER_GET-USERS', {
      req: { body: req.body, params: req.params },
      res: users.filter((u) => u.id != req.user.userId)
    });
    return res.json(users.filter((u) => u.id != req.user.userId));
  } catch (error) {
    log.error('ERR_USER_GET-USERS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting users');
  }
};

const editUser = async (req, res) => {
  const updatedUser = req.body;
  const email = updatedUser.email;
  let user = await userModel.findUserByEmail({ email });
  if (user && user.id != updatedUser.id) {
    log.error('ERR_USER_EDIT-USERS', {
      err: 'User already exists',
      req: { body: req.body, params: req.params }
    });
    return res.status(400).json({ message: 'User already exists' });
  } else {
    try {
      user = await userModel.editUser({ updatedUser: req.body });
      log.out('OK_USER_EDIT-USERS', {
        req: { body: req.body, params: req.params },
        res: {
          message: 'User edited',
          payload: user
        }
      });
      return res.json({
        message: 'User edited',
        payload: user
      });
    } catch (error) {
      log.error('ERR_USER_EDIT-USER', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      return res.status(400).send('Error editing user');
    }
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.deleteUserById({ id });
    log.out('OK_USER_DELETE-USERS', {
      req: { body: req.body, params: req.params },
      res: { message: 'User deleted' }
    });
    return res.json({ message: 'User deleted' });
  } catch (error) {
    log.error('ERR_USER_DELETE-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error deleting user');
  }
};

const enableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.enableUser({ id });
    log.out('OK_USER_ENABLE-USERS', {
      req: { body: req.body, params: req.params },
      res: {
        message: 'User enabled',
        payload: user
      }
    });
    return res.json({
      message: 'User enabled',
      payload: user
    });
  } catch (error) {
    log.error('ERR_USER_ENABLE-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error enabling user');
  }
};

const disableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.disableUser({ id });
    log.out('OK_USER_DISABLE-USERS', {
      req: { body: req.body, params: req.params },
      res: {
        message: 'User disabled',
        payload: user
      }
    });
    return res.json({
      message: 'User disabled',
      payload: user
    });
  } catch (error) {
    log.error('ERR_USER_DISABLE-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error disabling user');
  }
};

// have to make sure only admin can do this
const changeUserRole = async (req, res) => {
  try {
    const { id, action } = req.params;
    const user = await userModel.changeUserRole({ id, action });
    log.out('OK_USER_CHANGE-USER-ROLE', {
      req: { body: req.body, params: req.params },
      res: {
        message: 'User role updated',
        payload: user
      }
    });
    return res.json({
      message: 'User role updated',
      payload: user
    });
  } catch (error) {
    log.error('ERR_USER_CHANGE-USER-ROLE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error changing user role');
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
      await userModel.changePassword({ updatedUser });
      await emailHelper.sendEmail({ recipientEmail, subject, content });
      log.out('OK_USER_SENT-EMAIL', {
        req: { body: req.body, params: req.params },
        res: {
          message: 'Email sent'
        }
      });
      return res.json({
        message: 'Email sent'
      });
    } else {
      log.error('ERR_USER_SEND', {
        err: 'Failed to send email as user is not registered',
        req: { body: req.body, params: req.params }
      });
      return res
        .status(400)
        .send('Failed to send email as user is not registered');
    }
  } catch (error) {
    log.error('ERR_USER_SEND', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error sending forget email password');
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { userEmail, currentPassword, newPassword } = req.body;
    if (currentPassword === newPassword) {
      log.error('ERR_USER_VERIFY-PW', {
        err: 'Old and new password cannot be the same'
      });
      res
        .status(400)
        .json({ message: 'Old and new password cannot be the same' });
    } else {
      const user = await userModel.findUserByEmail({ email: userEmail });

      if (user) {
        const is_equal = await userModel.verifyPassword({
          userEmail,
          currentPassword,
          newPassword
        });
        if (is_equal) {
          log.out('OK_USER_VERIFY-PW', {
            res: { message: 'Password verified' }
          });
          return res.status(200).json({ message: 'Password verified' });
        } else {
          log.error('ERR_USER_VERIFY-PW', {
            err: 'Passwords do not match'
          });
          return res.status(400).json({ message: 'Passwords do not match' });
        }
      } else {
        log.error('ERR_USER_VERIFY-PW', {
          err: 'User does not exist'
        });
        return res.status(400).json({ message: 'User does not exist' });
      }
    }
  } catch (error) {
    log.error('ERR_USER_VERIFY-PW', {
      err: error.message
    });
    return res.status(400).send('Error verifying password');
  }
};

const approveB2BUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.updateB2BUserStatus({
      id,
      status: UserStatus.ACTIVE
    });
    const { data } = await common.awaitWrap(userModel.generatePassword());
    user.password = data;
    await userModel.editUser({ updatedUser: user });
    await userModel.changePassword({ updatedUser: user });
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
    log.out('OK_USER_APPROVE-USER', {
      req: { body: req.body, params: req.params },
      res: {
        message: 'Account creation request approved.'
      }
    });
    return res.json({
      message: 'Account creation request approved.'
    });
  } catch (error) {
    log.error('ERR_USER_APPROVE-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error approving B2B user');
  }
};

const rejectB2BUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.updateB2BUserStatus({
      id,
      status: UserStatus.REJECTED
    });
    const content =
      'Hi ' +
      user.firstName +
      ' ' +
      user.lastName +
      '! Your request to create an account has been rejected. Please contact TKG at zac@thekettlegourmet.com.';
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
    log.out('OK_USER_REJECT-USER', {
      req: { body: req.body, params: req.params },
      res: {
        message: 'Account creation request rejected.',
        payload: user
      }
    });
    return res.json({
      message: 'Account creation request rejected.',
      payload: user
    });
  } catch (error) {
    log.error('ERR_USER_REJECT-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error rejecting B2B user');
  }
};

const getAllB2BUsers = async (req, res) => {
  try {
    const users = await userModel.getB2BUsers({});
    log.out('OK_USER_GET-B2B-USERS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(users)
    });
    return res.json(users);
  } catch (error) {
    log.error('ERR_USER_GET-B2B-USERS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting all B2B users');
  }
};

const getAllPendingB2BUsers = async (req, res) => {
  try {
    const users = await userModel.getB2BUsers({});
    log.out('OK_USER_GET-PENDING-B2B-USERS', {
      req: { body: req.body, params: req.params },
      res: users.filter((u) => u.status === UserStatus.PENDING)
    });
    return res.json(users.filter((u) => u.status === UserStatus.PENDING));
  } catch (error) {
    log.error('ERR_USER_GET-PENDING-B2B-USERS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting all pending B2B users');
  }
};

const getAllNonB2BUsers = async (req, res) => {
  try {
    const users = await userModel.getUsers();
    const filteredUsers = users.filter(
      (u) => u.id != req.user.userId && u.role !== UserRole.B2B
    );
    log.out('OK_USER_GET-NON-B2B-USERS', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(filteredUsers)
    });
    return res.json(filteredUsers);
  } catch (error) {
    log.error('ERR_USER_GET-NON-B2B-USERS', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting all non-B2B users');
  }
};

const getNumberOfPendingUsers = async (req, res) => {
  const users = await userModel.getB2BUsers({});
  const filtered = users.filter((u) => u.status === UserStatus.PENDING);
  log.out('OK_USER_GET-NUMBER-OF-PENDING-USERS', {
    req: { body: req.body, params: req.params },
    res: filtered.length
  });
  return res.json(filtered.length);
};

const getAllEmployees = async (req, res) => {
  try {
    const users = await userModel.getEmployees({});
    for (let u of users) {
      u.password = '';
      if (u.manager) u.manager.password = '';
      for (let s of u.subordinates) {
        s.password = '';
      }
    }
    log.out('OK_USER_GET-EMPLOYEES', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(users)
    });
    return res.json(users);
  } catch (error) {
    log.error('ERR_USER_GET-EMPLOYEES', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting all employees');
  }
};

const createJobRole = async (req, res) => {
  const { jobRole, description, usersInJobRole } = req.body;
  const role = await userModel.getJobRoleByName({ jobRole });
  if (role) {
    return res.status(400).send('Job role already exists!');
  } else {
    try {
      const data = await userModel.createJobRole({
        jobRole,
        description,
        usersInJobRole
      });
      for (let d of data.usersInJobRole) {
        d.password = '';
      }
      log.out('OK_USER_CREATE-JOB-ROLE', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    } catch (error) {
      log.error('ERR_USER_CREATE-JOB-ROLE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      return res.status(400).send('Error creating job role');
    }
  }
};

const editJobRole = async (req, res) => {
  const { id, jobRole, description, usersInJobRole } = req.body;
  const j = await userModel.getJobRoleByName({ jobRole });
  if (j && id !== j?.id) {
    return res.status(400).send('Job role already exists!');
  } else {
    try {
      const data = await userModel.editJobRole({
        id,
        jobRole,
        description,
        usersInJobRole
      });
      for (let d of data.usersInJobRole) {
        d.password = '';
      }
      log.out('OK_USER_EDIT-JOB-ROLE', {
        req: { body: req.body, params: req.params },
        res: JSON.stringify(data)
      });
      return res.json(data);
    } catch (error) {
      log.error('ERR_USER_EDIT-JOB-ROLE', {
        err: error.message,
        req: { body: req.body, params: req.params }
      });
      return res.status(400).send('Error editing job role');
    }
  }
};

const addJobRolesToUser = async (req, res) => {
  const { userId, jobRoles } = req.body;
  try {
    const data = await userModel.addJobRolesToUser({ userId, jobRoles });
    log.out('OK_USER_ADD-JOB-ROLES-TO-USER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    data.password = '';
    return res.json(data);
  } catch (error) {
    log.error('ERR_USER_ADD-JOB-ROLES-TO-USER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error adding job roles to users');
  }
};

const deleteJobRole = async (req, res) => {
  try {
    const { id } = req.params;
    await userModel.deleteJobRole({ id });
    log.out('OK_USER_DELETE-JOB-ROLE', {
      req: { body: req.body, params: req.params },
      res: { message: 'Job role deleted' }
    });
    return res.json({ message: 'Job role deleted' });
  } catch (error) {
    log.error('ERR_USER_DELETE-JOB-ROLE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error deleting job role');
  }
};

const getJobRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await userModel.getJobRole({ id });
    for (let j of job.usersInJobRole) {
      j.password = '';
    }
    log.out('OK_USER_GET-JOB-ROLE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(job)
    });
    return res.json(job);
  } catch (error) {
    log.error('ERR_USER_GET-JOB-ROLE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting job role');
  }
};

const getJobRoleByName = async (req, res) => {
  const { jobRole } = req.params;
  try {
    const job = await userModel.getJobRoleByName({ jobRole });
    for (let j of job.usersInJobRole) {
      j.password = '';
    }
    log.out('OK_USER_GET-JOB-ROLE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(job)
    });
    return res.json(job);
  } catch (error) {
    log.error('ERR_USER_GET-JOB-ROLE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting job role by name');
  }
};

const getAllJobRoles = async (req, res) => {
  try {
    const jobs = await userModel.getAllJobRoles({});
    for (let j of jobs) {
      for (let u of j.usersInJobRole) {
        u.password = '';
      }
    }
    log.out('OK_USER_GET-ALL-JOB-ROLE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(jobs)
    });
    return res.json(jobs);
  } catch (error) {
    log.error('ERR_USER_GET-ALL-JOB-ROLE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    return res.status(400).send('Error getting all job roles');
  }
};

const assignSubordinatesToManager = async (req, res) => {
  const { id, users } = req.body;
  const { data, error } = await common.awaitWrap(
    userModel.assignSubordinatesToManager({
      id,
      users
    })
  );

  if (error) {
    log.error('ERR_SUBJECT_ASSIGN-SUBORDINATES-TO-MANAGER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    data.password = '';
    if (data.manager) data.manager.password = '';
    for (let u of data.subordinates) {
      u.password = '';
    }
    log.out('OK_SUBJECT_ASSIGN-SUBORDINATES-TO-MANAGER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const unassignSubordinatesToManager = async (req, res) => {
  const { id, users } = req.body;
  const { data, error } = await common.awaitWrap(
    userModel.unassignSubordinatesToManager({
      id,
      users
    })
  );

  if (error) {
    log.error('ERR_SUBJECT_UNASSIGN-SUBORDINATES-TO-MANAGER', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    data.password = '';
    if (data.manager) data.manager.password = '';
    for (let u of data.subordinates) {
      u.password = '';
    }
    log.out('OK_SUBJECT_UNASSIGN-SUBORDINATES-TO-MANAGER', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const updateEmployee = async (req, res) => {
  const { id, jobRoles, managerId } = req.body;
  const employeeToUpdate = await userModel.findUserById({ id });
  if (employeeToUpdate && employeeToUpdate.managerId !== managerId) {
    if (managerId) {
      await userModel.assignSubordinatesToManager({
        id: managerId,
        users: [employeeToUpdate]
      });
    } else {
      await userModel.unassignSubordinatesToManager({
        id: employeeToUpdate.managerId,
        users: [employeeToUpdate]
      });
    }
  }
  const { data, error } = await common.awaitWrap(
    userModel.addJobRolesToUser({ userId: id, jobRoles })
  );

  if (error) {
    log.error('ERR_SUBJECT_UPDATE-EMPLOYEE', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  } else {
    if (data) data.password = '';
    log.out('OK_SUBJECT_UPDATE-EMPLOYEE', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(data)
    });
    return res.json(data);
  }
};

const setCEO = async (req, res) => {
  const { ceoId } = req.params;
  const prevCeo = await userModel.getCEO({});
  const employees = await userModel.getEmployees({});
  const subordinates = employees.filter(
    (e) => e.managerId === null || e.managerId === Number(prevCeo.id)
  );
  await userModel.setCEOMangerIdToOwnId({
    id: Number(ceoId)
  });
  try {
    const ceo = await userModel.assignSubordinatesToManager({
      id: Number(ceoId),
      users: subordinates
    });
    ceo.password = '';
    ceo.manager = ceoId;
    for (let s of ceo.subordinates) {
      s.password = '';
    }
    log.out('OK_SUBJECT_SET-CEO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(ceo)
    });
    return res.json(ceo);
  } catch (error) {
    log.error('ERR_SUBJECT_SET-CEO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
  }
};

const getCEO = async (req, res) => {
  const ceo = await userModel.getCEO({});
  if (ceo === null) {
    return res.status(400).json(null);
  } else {
    ceo.password = '';
    ceo.manager = null;
    for (let s of ceo.subordinates) {
      s.password = '';
    }
    log.out('OK_SUBJECT_GET-CEO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(ceo)
    });
    return res.status(200).json(ceo);
  }
};

const changeCEO = async (req, res) => {
  const { ceoId } = req.params;
  const prevCeo = await userModel.getCEO({});
  const employees = await userModel.getEmployees({});
  let subordinates = [];
  if (prevCeo !== null) {
    subordinates = employees.filter(
      (e) => e.managerId === null || e.managerId === Number(prevCeo.id)
    );
  } else {
    subordinates = employees.filter((e) => e.managerId === null);
  }
  try {
    await userModel.setCEOMangerIdToOwnId({
      id: Number(ceoId)
    });
    const ceo = await userModel.assignSubordinatesToManager({
      id: Number(ceoId),
      users: subordinates
    });
    ceo.password = '';
    ceo.manager = ceoId;
    for (let s of ceo.subordinates) {
      s.password = '';
    }
    log.out('OK_SUBJECT_CHANGE-CEO', {
      req: { body: req.body, params: req.params },
      res: JSON.stringify(ceo)
    });
    return res.json(ceo);
  } catch (error) {
    log.error('ERR_SUBJECT_CHANGE-CEO', {
      err: error.message,
      req: { body: req.body, params: req.params }
    });
    const e = Error.http(error);
    return res.status(e.code).json(e.message);
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
exports.getNumberOfPendingUsers = getNumberOfPendingUsers;
exports.getAllEmployees = getAllEmployees;
exports.createJobRole = createJobRole;
exports.editJobRole = editJobRole;
exports.addJobRolesToUser = addJobRolesToUser;
exports.deleteJobRole = deleteJobRole;
exports.getJobRoleById = getJobRoleById;
exports.getJobRoleByName = getJobRoleByName;
exports.getAllJobRoles = getAllJobRoles;
exports.assignSubordinatesToManager = assignSubordinatesToManager;
exports.unassignSubordinatesToManager = unassignSubordinatesToManager;
exports.updateEmployee = updateEmployee;
exports.setCEO = setCEO;
exports.getCEO = getCEO;
exports.changeCEO = changeCEO;
