const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class User {
  static async create() {
    await prisma.user
      .create({
        data: {
          email: 'ariadne@prisma.io',
          name: 'Ariadne',
          posts: {
            create: [
              {
                title: 'My first day at Prisma',
                categories: {
                  create: {
                    name: 'Office'
                  }
                }
              },
              {
                title: 'How to connect to a SQLite database',
                categories: {
                  create: [{ name: 'Databases' }, { name: 'Tutorials' }]
                }
              }
            ]
          }
        }
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err))
      .finally(() => console.log('Test method created goodnight everybody!!'))
  }
}

module.exports = User
