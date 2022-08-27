const userModel = require('../models/userModel')

class UserController {
  static async create(req, res) {
    const { email, password } = req.body

    const response = await userModel.create({
      email,
      password
    })
    return res.json({ message: 'User created', response })
  }
}

module.exports = UserController
