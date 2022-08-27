const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

class UserModel {
  static async create(req) {
    const { email, password } = req

    prisma.User.create({
      data: {
        email,
        password
      }
    })
  }
}

module.exports = UserModel
