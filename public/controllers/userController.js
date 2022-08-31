const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const common = require('@kelchy/common');
const Error = require('../helpers/error');
const { use } = require('../routes/userRoutes');

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
        console.log('user created');
        res.json({ message: 'User created' });
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

/**
 * Authenticates a user with the given email and password, and returns a signed JWT token as a response
 */
const auth = async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findUserByEmail({
        email
    });

    if (user && (await bcrypt.compare(password, user.password))) {
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

exports.create = create;
exports.getUser = getUser;
exports.auth = auth;
