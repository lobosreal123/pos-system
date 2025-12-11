import { IPHONE_MODELS, IPHONE_COLORS, IPHONE_STORAGE, CONDITIONS } from './iphoneModels'

export const generateTestInventory = () => {
  const items = []
  
  // Generate iPhone items
  const models = IPHONE_MODELS.slice(0, 10) // Use first 10 models
  const colors = IPHONE_COLORS.slice(0, 5)
  const storageOptions = IPHONE_STORAGE.slice(1, 4) // 128GB, 256GB, 512GB
  
  models.forEach(model => {
    colors.forEach(color => {
      storageOptions.forEach(storage => {
        CONDITIONS.forEach(condition => {
          items.push({
            name: `${model} ${color} ${storage} ${condition}`,
            model,
            color,
            storage,
            condition,
            price: Math.floor(Math.random() * 1000) + 400, // $400-$1400
            stock: Math.floor(Math.random() * 20) + 1,
            category: 'iPhone',
            isAccessory: false,
            createdAt: new Date().toISOString()
          })
        })
      })
    })
  })

  // Generate accessories
  const accessories = [
    { name: 'Lightning Cable', category: 'Cable' },
    { name: 'Wireless Charger', category: 'Charger' },
    { name: 'Phone Case', category: 'Case' },
    { name: 'Screen Protector', category: 'Protector' },
    { name: 'AirPods', category: 'Audio' },
    { name: 'AirPods Pro', category: 'Audio' },
    { name: 'Apple Watch Band', category: 'Accessory' },
    { name: 'Car Mount', category: 'Accessory' }
  ]

  accessories.forEach(acc => {
    items.push({
      name: acc.name,
      model: '',
      color: '',
      storage: '',
      condition: '',
      price: Math.floor(Math.random() * 100) + 10, // $10-$110
      stock: Math.floor(Math.random() * 50) + 5,
      category: acc.category,
      isAccessory: true,
      createdAt: new Date().toISOString()
    })
  })

  return items
}

export const generateTestSales = (inventory, cashiers) => {
  const sales = []
  const customers = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown']
  const phones = ['555-0100', '555-0101', '555-0102', '555-0103', '555-0104']
  
  const now = new Date()
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const saleDate = new Date(now)
    saleDate.setDate(saleDate.getDate() - daysAgo)
    saleDate.setHours(Math.floor(Math.random() * 12) + 8) // 8 AM - 8 PM
    saleDate.setMinutes(Math.floor(Math.random() * 60))

    const numItems = Math.floor(Math.random() * 3) + 1
    const saleItems = []
    let total = 0

    for (let j = 0; j < numItems; j++) {
      const item = inventory[Math.floor(Math.random() * inventory.length)]
      if (item && item.stock > 0) {
        const quantity = Math.min(Math.floor(Math.random() * 3) + 1, item.stock)
        saleItems.push({
          id: item.id,
          name: item.name || `${item.model} ${item.color} ${item.storage}`,
          quantity,
          price: item.price,
          imei1: `IMEI${Math.floor(Math.random() * 1000000000000000)}`,
          imei2: Math.random() > 0.5 ? `IMEI${Math.floor(Math.random() * 1000000000000000)}` : null,
          serialNumber: Math.random() > 0.5 ? `SN${Math.floor(Math.random() * 1000000)}` : null
        })
        total += item.price * quantity
      }
    }

    if (saleItems.length > 0) {
      const customerIndex = Math.floor(Math.random() * customers.length)
      const cashier = cashiers[Math.floor(Math.random() * cashiers.length)]
      const status = Math.random() > 0.2 ? 'paid' : (Math.random() > 0.5 ? 'partial' : 'unpaid')
      const paidAmount = status === 'paid' ? total : (status === 'partial' ? total * 0.5 : 0)

      sales.push({
        id: `sale-${Date.now()}-${i}`,
        items: saleItems,
        total,
        paidAmount,
        status,
        paymentMethod: ['Cash', 'Mobile Money', 'Card'][Math.floor(Math.random() * 3)],
        buyerName: customers[customerIndex],
        buyerPhone: phones[customerIndex],
        cashierName: cashier?.name || 'Admin',
        cashierId: cashier?.id,
        createdAt: saleDate.toISOString()
      })
    }
  }

  return sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const generateTestCustomers = () => {
  return [
    { name: 'John Doe', phone: '555-0100', email: 'john@example.com', address: '123 Main St' },
    { name: 'Jane Smith', phone: '555-0101', email: 'jane@example.com', address: '456 Oak Ave' },
    { name: 'Bob Johnson', phone: '555-0102', email: 'bob@example.com', address: '789 Pine Rd' },
    { name: 'Alice Williams', phone: '555-0103', email: 'alice@example.com', address: '321 Elm St' },
    { name: 'Charlie Brown', phone: '555-0104', email: 'charlie@example.com', address: '654 Maple Dr' }
  ]
}

