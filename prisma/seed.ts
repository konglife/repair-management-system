import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (in dependency order)
  await prisma.usedPart.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.repair.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.purchaseRecord.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.category.deleteMany()
  await prisma.unit.deleteMany()
  
  console.log('🧹 Cleared existing data')

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics' } }),
    prisma.category.create({ data: { name: 'Phone Parts' } }),
    prisma.category.create({ data: { name: 'Computer Parts' } }),
    prisma.category.create({ data: { name: 'Accessories' } }),
    prisma.category.create({ data: { name: 'Tools' } }),
  ])
  console.log(`✅ Created ${categories.length} categories`)

  // Create Units
  const units = await Promise.all([
    prisma.unit.create({ data: { name: 'piece' } }),
    prisma.unit.create({ data: { name: 'set' } }),
    prisma.unit.create({ data: { name: 'pack' } }),
    prisma.unit.create({ data: { name: 'box' } }),
  ])
  console.log(`✅ Created ${units.length} units`)

  // Create Products with varied stock levels and costs
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: 'iPhone Screen Replacement',
        salePrice: 2500.00,
        quantity: 15,
        averageCost: 1800.00,
        categoryId: categories[1].id,
        unitId: units[0].id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy Screen',
        salePrice: 2200.00,
        quantity: 8,
        averageCost: 1500.00,
        categoryId: categories[1].id,
        unitId: units[0].id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Phone Battery',
        salePrice: 800.00,
        quantity: 25,
        averageCost: 500.00,
        categoryId: categories[1].id,
        unitId: units[0].id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Charging Port Module',
        salePrice: 600.00,
        quantity: 12,
        averageCost: 350.00,
        categoryId: categories[1].id,
        unitId: units[0].id,
      }
    }),
    // Computer Parts
    prisma.product.create({
      data: {
        name: 'Laptop Keyboard',
        salePrice: 1200.00,
        quantity: 6,
        averageCost: 800.00,
        categoryId: categories[2].id,
        unitId: units[0].id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'RAM 8GB DDR4',
        salePrice: 1500.00,
        quantity: 10,
        averageCost: 1100.00,
        categoryId: categories[2].id,
        unitId: units[0].id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'SSD 256GB',
        salePrice: 2000.00,
        quantity: 4, // Low stock for alerts
        averageCost: 1400.00,
        categoryId: categories[2].id,
        unitId: units[0].id,
      }
    }),
    // Accessories  
    prisma.product.create({
      data: {
        name: 'USB Cable Type-C',
        salePrice: 150.00,
        quantity: 30,
        averageCost: 80.00,
        categoryId: categories[3].id,
        unitId: units[0].id,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Phone Case Universal',
        salePrice: 300.00,
        quantity: 20,
        averageCost: 150.00,
        categoryId: categories[3].id,
        unitId: units[0].id,
      }
    }),
    // Tools
    prisma.product.create({
      data: {
        name: 'Screwdriver Set',
        salePrice: 500.00,
        quantity: 3, // Low stock
        averageCost: 300.00,
        categoryId: categories[4].id,
        unitId: units[1].id,
      }
    }),
  ])
  console.log(`✅ Created ${products.length} products`)

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Somchai Jaidee',
        phone: '086-123-4567',
        address: '123 Sukhumvit Road, Bangkok 10110'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Siriporn Tanaka',
        phone: '087-234-5678',
        address: '456 Silom Road, Bangkok 10500'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Niran Wongphan',
        phone: '089-345-6789',
        address: '789 Phahonyothin Road, Bangkok 10400'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Patcharee Smith',
        phone: '084-456-7890',
        address: '321 Rama IV Road, Bangkok 10120'
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Kittipong Lee',
        phone: '085-567-8901',
      }
    }),
  ])
  console.log(`✅ Created ${customers.length} customers`)

  // Create Purchase Records (spread over last 2 months for trend data)
  const now = new Date()
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const purchaseRecords = await Promise.all([
    // Two months ago purchases
    prisma.purchaseRecord.create({
      data: {
        productId: products[0].id,
        quantity: 10,
        costPerUnit: 1750.00,
        purchaseDate: new Date(twoMonthsAgo.getTime() + 5 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.purchaseRecord.create({
      data: {
        productId: products[1].id,
        quantity: 8,
        costPerUnit: 1450.00,
        purchaseDate: new Date(twoMonthsAgo.getTime() + 10 * 24 * 60 * 60 * 1000)
      }
    }),
    // Last month purchases
    prisma.purchaseRecord.create({
      data: {
        productId: products[2].id,
        quantity: 20,
        costPerUnit: 480.00,
        purchaseDate: new Date(lastMonth.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.purchaseRecord.create({
      data: {
        productId: products[4].id,
        quantity: 5,
        costPerUnit: 780.00,
        purchaseDate: new Date(lastMonth.getTime() + 15 * 24 * 60 * 60 * 1000)
      }
    }),
    // This month purchases
    prisma.purchaseRecord.create({
      data: {
        productId: products[5].id,
        quantity: 8,
        costPerUnit: 1080.00,
        purchaseDate: new Date(thisMonth.getTime() + 3 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.purchaseRecord.create({
      data: {
        productId: products[6].id,
        quantity: 5,
        costPerUnit: 1350.00,
        purchaseDate: new Date(thisMonth.getTime() + 8 * 24 * 60 * 60 * 1000)
      }
    }),
  ])
  console.log(`✅ Created ${purchaseRecords.length} purchase records`)

  // Create Sales (spread over last month and this month)
  const sales = []
  
  // Last month sales
  for (let i = 1; i <= 8; i++) {
    const saleDate = new Date(lastMonth.getTime() + i * 3 * 24 * 60 * 60 * 1000)
    const customerIndex = i % customers.length
    
    const sale = await prisma.sale.create({
      data: {
        customerId: customers[customerIndex].id,
        totalAmount: 0, // Will calculate after creating sale items
        totalCost: 0,   // Will calculate after creating sale items
        createdAt: saleDate,
      }
    })
    
    // Add sale items
    const saleItems = []
    if (i % 3 === 1) {
      // iPhone screen repair
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[0].id,
          quantity: 1,
          priceAtTime: products[0].salePrice,
          costAtTime: products[0].averageCost,
        }
      }))
    } else if (i % 3 === 2) {
      // Battery + Charging port
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[2].id,
          quantity: 1,
          priceAtTime: products[2].salePrice,
          costAtTime: products[2].averageCost,
        }
      }))
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[3].id,
          quantity: 1,
          priceAtTime: products[3].salePrice,
          costAtTime: products[3].averageCost,
        }
      }))
    } else {
      // Accessories
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[7].id,
          quantity: 2,
          priceAtTime: products[7].salePrice,
          costAtTime: products[7].averageCost,
        }
      }))
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[8].id,
          quantity: 1,
          priceAtTime: products[8].salePrice,
          costAtTime: products[8].averageCost,
        }
      }))
    }
    
    // Calculate totals
    const totalAmount = saleItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0)
    const totalCost = saleItems.reduce((sum, item) => sum + (item.costAtTime * item.quantity), 0)
    
    await prisma.sale.update({
      where: { id: sale.id },
      data: { totalAmount, totalCost }
    })
    
    sales.push(sale)
  }

  // This month sales
  for (let i = 1; i <= 5; i++) {
    const saleDate = new Date(thisMonth.getTime() + i * 4 * 24 * 60 * 60 * 1000)
    const customerIndex = i % customers.length
    
    const sale = await prisma.sale.create({
      data: {
        customerId: customers[customerIndex].id,
        totalAmount: 0,
        totalCost: 0,
        createdAt: saleDate,
      }
    })
    
    const saleItems = []
    if (i === 1) {
      // Samsung screen
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[1].id,
          quantity: 1,
          priceAtTime: products[1].salePrice,
          costAtTime: products[1].averageCost,
        }
      }))
    } else if (i === 2) {
      // Computer repair - keyboard + RAM
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[4].id,
          quantity: 1,
          priceAtTime: products[4].salePrice,
          costAtTime: products[4].averageCost,
        }
      }))
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[5].id,
          quantity: 1,
          priceAtTime: products[5].salePrice,
          costAtTime: products[5].averageCost,
        }
      }))
    } else {
      // Mix of accessories
      saleItems.push(await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: products[7].id,
          quantity: 1,
          priceAtTime: products[7].salePrice,
          costAtTime: products[7].averageCost,
        }
      }))
    }
    
    const totalAmount = saleItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0)
    const totalCost = saleItems.reduce((sum, item) => sum + (item.costAtTime * item.quantity), 0)
    
    await prisma.sale.update({
      where: { id: sale.id },
      data: { totalAmount, totalCost }
    })
    
    sales.push(sale)
  }
  
  console.log(`✅ Created ${sales.length} sales transactions`)

  // Create Repairs (spread over last month and this month)
  const repairs = []
  
  // Last month repairs
  for (let i = 1; i <= 4; i++) {
    const repairDate = new Date(lastMonth.getTime() + i * 5 * 24 * 60 * 60 * 1000)
    const customerIndex = (i + 2) % customers.length
    
    const repair = await prisma.repair.create({
      data: {
        customerId: customers[customerIndex].id,
        description: i === 1 ? 'iPhone water damage repair' : 
                    i === 2 ? 'Laptop keyboard replacement and cleaning' :
                    i === 3 ? 'Samsung screen replacement' : 'Phone charging port repair',
        totalCost: 0,
        partsCost: 0,
        laborCost: i * 200, // Varied labor costs
        createdAt: repairDate,
      }
    })
    
    // Add used parts
    const usedParts = []
    if (i === 1) {
      // iPhone repair - screen + battery
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[0].id,
          quantity: 1,
          costAtTime: products[0].averageCost,
        }
      }))
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[2].id,
          quantity: 1,
          costAtTime: products[2].averageCost,
        }
      }))
    } else if (i === 2) {
      // Laptop repair
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[4].id,
          quantity: 1,
          costAtTime: products[4].averageCost,
        }
      }))
    } else if (i === 3) {
      // Samsung screen
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[1].id,
          quantity: 1,
          costAtTime: products[1].averageCost,
        }
      }))
    } else {
      // Charging port
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[3].id,
          quantity: 1,
          costAtTime: products[3].averageCost,
        }
      }))
    }
    
    const partsCost = usedParts.reduce((sum, part) => sum + (part.costAtTime * part.quantity), 0)
    const totalCost = partsCost + repair.laborCost
    
    await prisma.repair.update({
      where: { id: repair.id },
      data: { partsCost, totalCost }
    })
    
    repairs.push(repair)
  }

  // This month repairs
  for (let i = 1; i <= 3; i++) {
    const repairDate = new Date(thisMonth.getTime() + i * 6 * 24 * 60 * 60 * 1000)
    const customerIndex = (i + 1) % customers.length
    
    const repair = await prisma.repair.create({
      data: {
        customerId: customers[customerIndex].id,
        description: i === 1 ? 'Computer SSD upgrade' : 
                    i === 2 ? 'Phone screen and battery replacement' : 'Laptop RAM upgrade',
        totalCost: 0,
        partsCost: 0,
        laborCost: i * 150,
        createdAt: repairDate,
      }
    })
    
    const usedParts = []
    if (i === 1) {
      // SSD upgrade
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[6].id,
          quantity: 1,
          costAtTime: products[6].averageCost,
        }
      }))
    } else if (i === 2) {
      // Phone repair
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[0].id,
          quantity: 1,
          costAtTime: products[0].averageCost,
        }
      }))
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[2].id,
          quantity: 1,
          costAtTime: products[2].averageCost,
        }
      }))
    } else {
      // RAM upgrade
      usedParts.push(await prisma.usedPart.create({
        data: {
          repairId: repair.id,
          productId: products[5].id,
          quantity: 1,
          costAtTime: products[5].averageCost,
        }
      }))
    }
    
    const partsCost = usedParts.reduce((sum, part) => sum + (part.costAtTime * part.quantity), 0)
    const totalCost = partsCost + repair.laborCost
    
    await prisma.repair.update({
      where: { id: repair.id },
      data: { partsCost, totalCost }
    })
    
    repairs.push(repair)
  }
  
  console.log(`✅ Created ${repairs.length} repair jobs`)

  console.log('🎉 Database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log(`   - Categories: ${categories.length}`)
  console.log(`   - Units: ${units.length}`)  
  console.log(`   - Products: ${products.length}`)
  console.log(`   - Customers: ${customers.length}`)
  console.log(`   - Purchase Records: ${purchaseRecords.length}`)
  console.log(`   - Sales: ${sales.length}`)
  console.log(`   - Repairs: ${repairs.length}`)
  console.log('💡 Your dashboard should now show realistic data!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })