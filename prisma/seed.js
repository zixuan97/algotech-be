const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const encryptedPassword = await bcrypt.hash('password', 10);

  await prisma.User.create({
    data: {
      first_name: 'Wee Kek',
      last_name: 'Tan',
      email: 'tanwk@comp.nus.edu.sg',
      password: encryptedPassword,
      role: 'ADMIN',
      isVerified: false
    }
  });

  await prisma.User.create({
    data: {
      first_name: 'Wee Kek',
      last_name: 'Tan',
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
      brand_id: 1,
      qtyThreshold: 20,
      productCategory: {
        create: [
          {
            category_name: 'Asian Favourites',
            product_sku: 'SKU123',
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
            product_name: 'Nasi Lemak Popcorn',
            product_sku: 'SKU123',
            quantity: 20,
            price: 2,
            location_name: 'Punggol Warehouse',
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
      brand_id: 1,
      qtyThreshold: 20,
      productCategory: {
        create: [
          {
            category_name: 'Asian Favourites',
            product_sku: 'SKU124',
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
            product_name: 'Curry Popcorn',
            product_sku: 'SKU124',
            quantity: 50,
            price: 2,
            location_name: 'Punggol Warehouse',
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
      order_date: new Date(),
      description: 'Procurement Order',
      total_amount: 20,
      payment_status: 'PENDING',
      fulfilment_status: 'CREATED',
      warehouse_address: 'Blk 303B Punggol Central #05-792',
      proc_order_items: {
        create: [
          {
            quantity: 20,
            product_sku: 'SKU123',
            product_name: 'Nasi Lemak Popcorn',
            rate: 16
          }
        ]
      },
      supplier_id: 1,
      supplier_name: 'Wee Kek',
      supplier_address: 'Blk 117 Ang Mo Kio Ave 4 #08-467',
      supplier_email: 'tanwk@comp.nus.edu.sg'
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
