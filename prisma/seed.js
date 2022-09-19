const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const encryptedPassword = await bcrypt.hash('password', 10);

  await prisma.User.create({
    data: {
      firstName: 'Wee Kek',
      lastName: 'Tan',
      email: 'tanwk@comp.nus.edu.sg',
      password: encryptedPassword,
      role: 'ADMIN',
      isVerified: false
    }
  });

  await prisma.User.create({
    data: {
      firstName: 'Wee Kek',
      lastName: 'Tan',
      email: 'tanwk+user@comp.nus.edu.sg',
      password: encryptedPassword,
      role: 'FULLTIME',
      isVerified: false
    }
  });

  await prisma.brand.create({
    data: {
      name: 'The Kettle Gourmet'
    }
  });

  await prisma.brand.create({
    data: {
      name: 'Popcorn Maker'
    }
  });

  await prisma.category.create({
    data: {
      name: 'Asian Favourites'
    }
  });

  await prisma.category.create({
    data: {
      name: 'Spicy Snacks'
    }
  });

  await prisma.location.create({
    data: {
      name: 'Punggol Warehouse',
      address: 'Blk 303B Punggol Central #05-792'
    }
  });

  await prisma.location.create({
    data: {
      name: 'Bishan Warehouse',
      address: 'Blk 117 Ang Mo Kio Ave 4 #08-467'
    }
  });

  await prisma.supplier.create({
    data: {
      email: 'tanwk@comp.nus.edu.sg',
      name: 'Wee Kek',
      address: 'Blk 117 Ang Mo Kio Ave 4 #08-467'
    }
  });

  await prisma.product.create({
    data: {
      sku: 'SKU123',
      name: 'Nasi Lemak Popcorn',
      description: 'Delicious',
      brandId: 1,
      qtyThreshold: 20,
      productCategory: {
        create: [
          {
            categoryName: 'Asian Favourites',
            productSku: 'SKU123',
            category: {
              connect: {
                name: 'Asian Favourites'
              }
            }
          }
        ]
      },
      stockQuantity: {
        create: [
          {
            productName: 'Nasi Lemak Popcorn',
            productSku: 'SKU123',
            quantity: 20,
            price: 2,
            locationName: 'Punggol Warehouse',
            location: {
              connect: {
                id: 1
              }
            }
          }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      sku: 'SKU124',
      name: 'Curry Popcorn',
      description: 'Spicy',
      brandId: 1,
      qtyThreshold: 20,
      productCategory: {
        create: [
          {
            categoryName: 'Asian Favourites',
            productSku: 'SKU124',
            category: {
              connect: {
                name: 'Asian Favourites'
              }
            }
          }
        ]
      },
      stockQuantity: {
        create: [
          {
            productName: 'Curry Popcorn',
            productSku: 'SKU124',
            quantity: 50,
            price: 2,
            locationName: 'Punggol Warehouse',
            location: {
              connect: {
                id: 1
              }
            }
          }
        ]
      }
    }
  });

  await prisma.ProcurementOrder.create({
    data: {
      orderDate: new Date(),
      description: 'Procurement Order',
      totalAmount: 20,
      paymentStatus: 'PENDING',
      fulfilmentStatus: 'CREATED',
      warehouseAddress: 'Blk 303B Punggol Central #05-792',
      procOrderItems: {
        create: [
          {
            quantity: 20,
            productSku: 'SKU123',
            productName: 'Nasi Lemak Popcorn',
            rate: 16
          }
        ]
      },
      supplierId: 1,
      supplierName: 'Wee Kek',
      supplierAddress: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
      supplierEmail: 'tanwk@comp.nus.edu.sg'
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
