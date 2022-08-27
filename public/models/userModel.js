const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

class UserModel {
  static async create(req) {
    const { email, password } = req

    const res = await prisma.User.create({
      data: {
        email,
        password
      }
    })

    return res
  }
}

module.exports = UserModel
