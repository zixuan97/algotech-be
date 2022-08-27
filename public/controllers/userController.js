const userModel = require('../models/userModel')

class UserController {
  static async create(req, res) {
    const { email, password } = req.body

    userModel.create({
      email,
      password
    })
    return res.json({ message: 'User created' })
  }
}

module.exports = UserController
