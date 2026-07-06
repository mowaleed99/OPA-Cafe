import { Product, Category, Supplier, Purchase, UserRole, CafeSettings, Order, ActivityLog, Table, DailyClosing, CustomerDebt } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Espresso Bar', order: 1 },
  { id: 'cat-2', name: 'Specialty Teas', order: 2 },
  { id: 'cat-3', name: 'Baked Pastries', order: 3 },
  { id: 'cat-4', name: 'All-Day Brunch', order: 4 },
  { id: 'cat-5', name: 'Cold Beverages', order: 5 },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Espresso Bar
  { id: 'p-1', name: 'Double Espresso', categoryId: 'cat-1', price: 3.50, cost: 0.80, stock: 999, minStock: 20, status: 'active', notes: 'House blend, standard 18g double shot' },
  { id: 'p-2', name: 'Flat White', categoryId: 'cat-1', price: 4.50, cost: 1.20, stock: 120, minStock: 30, status: 'active', notes: 'Double shot with velvety microfoam' },
  { id: 'p-3', name: 'Spanish Latte', categoryId: 'cat-1', price: 5.20, cost: 1.50, stock: 85, minStock: 15, status: 'active', notes: 'Sweetened milk base, high seller' },
  { id: 'p-4', name: 'Cappuccino', categoryId: 'cat-1', price: 4.50, cost: 1.10, stock: 150, minStock: 25, status: 'active' },
  { id: 'p-5', name: 'Cold Brew Coffee', categoryId: 'cat-1', price: 4.80, cost: 1.00, stock: 45, minStock: 15, status: 'active', notes: '18-hour steep, served over ice' },
  { id: 'p-6', name: 'Pistachio Latte', categoryId: 'cat-1', price: 5.80, cost: 1.90, stock: 8, minStock: 10, status: 'active', notes: 'Premium pistachio paste infusion (Low Stock Alert)' },

  // Specialty Teas
  { id: 'p-7', name: 'Ceremonial Matcha Latte', categoryId: 'cat-2', price: 5.50, cost: 1.60, stock: 60, minStock: 12, status: 'active', notes: 'Uji ceremonial grade matcha, sweetened or unsweetened' },
  { id: 'p-8', name: 'Hibiscus Iced Infusion', categoryId: 'cat-2', price: 4.20, cost: 0.70, stock: 110, minStock: 20, status: 'active', notes: 'Caffeine free, sweetened with raw honey' },
  { id: 'p-9', name: 'Organic Earl Grey', categoryId: 'cat-2', price: 3.80, cost: 0.50, stock: 200, minStock: 15, status: 'active' },

  // Baked Pastries
  { id: 'p-10', name: 'Butter Croissant', categoryId: 'cat-3', price: 3.50, cost: 0.90, stock: 4, minStock: 10, status: 'active', notes: 'French laminated butter pastry (Low Stock Alert)' },
  { id: 'p-11', name: 'Pistachio Supreme Croissant', categoryId: 'cat-3', price: 5.50, cost: 1.80, stock: 12, minStock: 5, status: 'active', notes: 'Filled with pure Sicilian pistachio cream' },
  { id: 'p-12', name: 'Almond Pain au Chocolat', categoryId: 'cat-3', price: 4.80, cost: 1.30, stock: 18, minStock: 5, status: 'active' },
  { id: 'p-13', name: 'Blueberry Crumble Muffin', categoryId: 'cat-3', price: 4.00, cost: 1.00, stock: 0, minStock: 8, status: 'active', notes: 'Fresh berries with oat crumble (Out of Stock Alert)' },

  // All-Day Brunch
  { id: 'p-14', name: 'Avocado Sourdough Toast', categoryId: 'cat-4', price: 11.50, cost: 3.50, stock: 40, minStock: 10, status: 'active', notes: 'Smashed Hass avocado, poached eggs, feta, microgreens' },
  { id: 'p-15', name: 'Shakshuka Skillet', categoryId: 'cat-4', price: 12.50, cost: 4.00, stock: 25, minStock: 5, status: 'active', notes: 'Spiced tomato ragout, organic baked eggs, baked sourdough' },
  { id: 'p-16', name: 'Eggs Benedict Trio', categoryId: 'cat-4', price: 13.50, cost: 4.80, stock: 30, minStock: 5, status: 'active', notes: 'Poached eggs, smoked turkey ham, house hollandaise' },

  // Cold Beverages
  { id: 'p-17', name: 'Sunset Citrus Cold Press', categoryId: 'cat-5', price: 6.20, cost: 1.80, stock: 18, minStock: 8, status: 'active', notes: 'Blood orange, grapefruit, ginger' },
  { id: 'p-18', name: 'Green Detox Press Juice', categoryId: 'cat-5', price: 6.50, cost: 2.00, stock: 15, minStock: 8, status: 'active', notes: 'Spinach, cucumber, celery, green apple' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's-1', name: 'Arabica Craft Roasters', contactName: 'Mark Higgins', phone: '+1 (555) 019-2834', email: 'orders@arabicacraft.com', address: '482 Bean Alley, Seattle, WA' },
  { id: 's-2', name: 'Valley Organic Dairy', contactName: 'Elena Rostova', phone: '+1 (555) 014-9921', email: 'elena@valleydairy.org', address: '90 Pasture Road, Tillamook, OR' },
  { id: 's-3', name: 'Le Parisien Bakery Wholesalers', contactName: 'Jean-Luc Godard', phone: '+1 (555) 012-7744', email: 'jeanluc@leparisienbakery.com', address: '12 Lamination Way, Portland, OR' },
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'pur-1',
    supplierId: 's-1',
    supplierName: 'Arabica Craft Roasters',
    date: '2026-07-05T09:00:00Z',
    items: [
      { productName: 'Single-Origin Ethiopian Yirgacheffe Beans (10kg)', quantity: 2, unitPrice: 180.00, total: 360.00 },
      { productName: 'Signature House Espresso Blend (20kg)', quantity: 3, unitPrice: 220.00, total: 660.00 },
    ],
    totalAmount: 1020.00,
    amountPaid: 600.00,
    amountRemaining: 420.00,
    paymentStatus: 'Partial',
    payments: [
      { id: 'pay-pur-1-1', date: '2026-07-05T09:10:00Z', amount: 600.00, notes: 'Initial delivery deposit' }
    ]
  },
  {
    id: 'pur-2',
    supplierId: 's-2',
    supplierName: 'Valley Organic Dairy',
    date: '2026-07-06T07:15:00Z',
    items: [
      { productName: 'Organic Barista Whole Milk (Case of 12)', quantity: 15, unitPrice: 24.00, total: 360.00 },
      { productName: 'Oat Milk Barista Edition (Case of 12)', quantity: 8, unitPrice: 32.00, total: 256.00 },
    ],
    totalAmount: 616.00,
    amountPaid: 616.00,
    amountRemaining: 0.00,
    paymentStatus: 'Paid',
    payments: [
      { id: 'pay-pur-2-1', date: '2026-07-06T07:20:00Z', amount: 616.00, notes: 'Full cash payment' }
    ]
  },
];

export const INITIAL_TABLES: Table[] = [
  { id: 'table-1', number: 1, name: 'Table 1', status: 'available', cartItems: [], discountPercent: 0 },
  { id: 'table-2', number: 2, name: 'Table 2', status: 'available', cartItems: [], discountPercent: 0 },
  { id: 'table-3', number: 3, name: 'Table 3', status: 'available', cartItems: [], discountPercent: 0 },
  { id: 'table-4', number: 4, name: 'Table 4', status: 'available', cartItems: [], discountPercent: 0 },
  { id: 'table-5', number: 5, name: 'Table 5', status: 'available', cartItems: [], discountPercent: 0 },
  { id: 'table-6', number: 6, name: 'Table 6', status: 'available', cartItems: [], discountPercent: 0 },
  { id: 'table-7', number: 7, name: 'Table 7', status: 'available', cartItems: [], discountPercent: 0 },
  { id: 'table-8', number: 8, name: 'Table 8', status: 'available', cartItems: [], discountPercent: 0 },
];

export const INITIAL_DAILY_CLOSINGS: DailyClosing[] = [
  {
    id: 'dc-2026-07-01',
    date: '2026-07-01',
    timestamp: '2026-07-01T21:00:00Z',
    totalSales: 184.50,
    totalOrders: 12,
    closedBy: 'Youssef Aly',
    productBreakdown: [
      { productId: 'p-1', productName: 'Double Espresso', quantity: 15, revenue: 52.50 },
      { productId: 'p-2', productName: 'Flat White', quantity: 12, revenue: 54.00 },
      { productId: 'p-10', productName: 'Butter Croissant', quantity: 10, revenue: 35.00 },
      { productId: 'p-14', productName: 'Avocado Sourdough Toast', quantity: 3, revenue: 34.50 },
      { productId: 'p-5', productName: 'Cold Brew Coffee', quantity: 2, revenue: 9.60 }
    ]
  },
  {
    id: 'dc-2026-07-02',
    date: '2026-07-02',
    timestamp: '2026-07-02T21:00:00Z',
    totalSales: 215.20,
    totalOrders: 15,
    closedBy: 'Youssef Aly',
    productBreakdown: [
      { productId: 'p-1', productName: 'Double Espresso', quantity: 20, revenue: 70.00 },
      { productId: 'p-2', productName: 'Flat White', quantity: 14, revenue: 63.00 },
      { productId: 'p-11', productName: 'Pistachio Supreme Croissant', quantity: 8, revenue: 44.00 },
      { productId: 'p-7', productName: 'Ceremonial Matcha Latte', quantity: 6, revenue: 33.00 },
      { productId: 'p-3', productName: 'Spanish Latte', quantity: 1, revenue: 5.20 }
    ]
  },
  {
    id: 'dc-2026-07-03',
    date: '2026-07-03',
    timestamp: '2026-07-03T21:00:00Z',
    totalSales: 162.00,
    totalOrders: 10,
    closedBy: 'Sarah Connor',
    productBreakdown: [
      { productId: 'p-5', productName: 'Cold Brew Coffee', quantity: 15, revenue: 72.00 },
      { productId: 'p-10', productName: 'Butter Croissant', quantity: 10, revenue: 35.00 },
      { productId: 'p-12', productName: 'Almond Pain au Chocolat', quantity: 5, revenue: 24.00 },
      { productId: 'p-2', productName: 'Flat White', quantity: 7, revenue: 31.00 }
    ]
  },
  {
    id: 'dc-2026-07-04',
    date: '2026-07-04',
    timestamp: '2026-07-04T21:00:00Z',
    totalSales: 298.40,
    totalOrders: 18,
    closedBy: 'Sarah Connor',
    productBreakdown: [
      { productId: 'p-14', productName: 'Avocado Sourdough Toast', quantity: 12, revenue: 138.00 },
      { productId: 'p-15', productName: 'Shakshuka Skillet', quantity: 6, revenue: 75.00 },
      { productId: 'p-16', productName: 'Eggs Benedict Trio', quantity: 4, revenue: 54.00 },
      { productId: 'p-2', productName: 'Flat White', quantity: 7, revenue: 31.40 }
    ]
  },
  {
    id: 'dc-2026-07-05',
    date: '2026-07-05',
    timestamp: '2026-07-05T21:00:00Z',
    totalSales: 310.50,
    totalOrders: 22,
    closedBy: 'Youssef Aly',
    productBreakdown: [
      { productId: 'p-2', productName: 'Flat White', quantity: 18, revenue: 81.00 },
      { productId: 'p-10', productName: 'Butter Croissant', quantity: 15, revenue: 52.50 },
      { productId: 'p-11', productName: 'Pistachio Supreme Croissant', quantity: 12, revenue: 66.00 },
      { productId: 'p-3', productName: 'Spanish Latte', quantity: 10, revenue: 52.00 },
      { productId: 'p-7', productName: 'Ceremonial Matcha Latte', quantity: 10, revenue: 55.00 },
      { productId: 'p-5', productName: 'Cold Brew Coffee', quantity: 1, revenue: 4.00 }
    ]
  }
];

export const INITIAL_USERS: UserRole[] = [
  { id: 'u-1', name: 'Youssef Aly', role: 'Owner', permissions: ['all_access', 'view_reports', 'edit_products', 'manage_settings', 'pos_checkout'], status: 'active' },
  { id: 'u-2', name: 'Sarah Connor', role: 'Cashier', permissions: ['pos_checkout', 'edit_products', 'manage_debts'], status: 'active' },
  { id: 'u-3', name: 'Karim Refaat', role: 'Cashier', permissions: ['pos_checkout'], status: 'active' },
];

export const INITIAL_SETTINGS: CafeSettings = {
  cafeName: 'O P A CAFE',
  logoUrl: '',
  currency: '$',
  taxPercent: 8,
  paymentMethods: ['Cash', 'Visa', 'Instapay'],
  receiptHeader: 'O P A CAFE\n100 Craftsmanship Blvd, Portland\nTel: (555) 789-1234',
  receiptFooter: 'Thank you for supporting small coffee shops!\nFollow us on Instagram @cremabrews',
};

// Realistic order list for graphs and stats
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    date: '2026-07-05T08:15:00Z',
    items: [
      { productId: 'p-2', productName: 'Flat White', quantity: 2, price: 4.50 },
      { productId: 'p-10', productName: 'Butter Croissant', quantity: 2, price: 3.50 }
    ],
    paymentMethod: 'Cash',
    subtotal: 16.00,
    discount: 0,
    tax: 1.28,
    total: 17.28,
    cashierId: 'u-2',
    cashierName: 'Sarah Connor',
    status: 'completed'
  },
  {
    id: 'ord-2',
    date: '2026-07-05T10:42:00Z',
    items: [
      { productId: 'p-14', productName: 'Avocado Sourdough Toast', quantity: 1, price: 11.50 },
      { productId: 'p-7', productName: 'Ceremonial Matcha Latte', quantity: 1, price: 5.50 }
    ],
    paymentMethod: 'Visa',
    subtotal: 17.00,
    discount: 1.70, // 10%
    tax: 1.22,
    total: 16.52,
    cashierId: 'u-3',
    cashierName: 'Karim Refaat',
    status: 'completed'
  },
  {
    id: 'ord-3',
    date: '2026-07-05T14:10:00Z',
    items: [
      { productId: 'p-5', productName: 'Cold Brew Coffee', quantity: 3, price: 4.80 }
    ],
    paymentMethod: 'Instapay',
    subtotal: 14.40,
    discount: 0,
    tax: 1.15,
    total: 15.55,
    cashierId: 'u-2',
    cashierName: 'Sarah Connor',
    status: 'completed'
  },
  {
    id: 'ord-4',
    date: '2026-07-05T17:30:00Z',
    items: [
      { productId: 'p-11', productName: 'Pistachio Supreme Croissant', quantity: 2, price: 5.50 },
      { productId: 'p-3', productName: 'Spanish Latte', quantity: 2, price: 5.20 }
    ],
    paymentMethod: 'Credit', // Added to Marcus' tab
    subtotal: 21.40,
    discount: 0,
    tax: 1.71,
    total: 23.11,
    cashierId: 'u-2',
    cashierName: 'Sarah Connor',
    status: 'completed'
  },
  // Today's Orders (July 6, 2026)
  {
    id: 'ord-5',
    date: '2026-07-06T07:45:00Z',
    items: [
      { productId: 'p-1', productName: 'Double Espresso', quantity: 1, price: 3.50 },
      { productId: 'p-10', productName: 'Butter Croissant', quantity: 1, price: 3.50 }
    ],
    paymentMethod: 'Cash',
    subtotal: 7.00,
    discount: 0,
    tax: 0.56,
    total: 7.56,
    cashierId: 'u-2',
    cashierName: 'Sarah Connor',
    status: 'completed'
  },
  {
    id: 'ord-6',
    date: '2026-07-06T08:30:00Z',
    items: [
      { productId: 'p-2', productName: 'Flat White', quantity: 3, price: 4.50 },
      { productId: 'p-11', productName: 'Pistachio Supreme Croissant', quantity: 3, price: 5.50 },
      { productId: 'p-14', productName: 'Avocado Sourdough Toast', quantity: 1, price: 11.50 }
    ],
    paymentMethod: 'Visa',
    subtotal: 41.50,
    discount: 4.15, // 10% loyalty discount
    tax: 2.99,
    total: 40.34,
    cashierId: 'u-2',
    cashierName: 'Sarah Connor',
    status: 'completed'
  },
  {
    id: 'ord-7',
    date: '2026-07-06T09:15:00Z',
    items: [
      { productId: 'p-15', productName: 'Shakshuka Skillet', quantity: 2, price: 12.50 },
      { productId: 'p-17', productName: 'Sunset Citrus Cold Press', quantity: 2, price: 6.20 }
    ],
    paymentMethod: 'Instapay',
    subtotal: 37.40,
    discount: 0,
    tax: 2.99,
    total: 40.39,
    cashierId: 'u-3',
    cashierName: 'Karim Refaat',
    status: 'completed'
  },
  {
    id: 'ord-8',
    date: '2026-07-06T10:30:00Z',
    items: [
      { productId: 'p-3', productName: 'Spanish Latte', quantity: 1, price: 5.20 },
      { productId: 'p-12', productName: 'Almond Pain au Chocolat', quantity: 2, price: 4.80 }
    ],
    paymentMethod: 'Cash',
    subtotal: 14.80,
    discount: 0,
    tax: 1.18,
    total: 15.98,
    cashierId: 'u-3',
    cashierName: 'Karim Refaat',
    status: 'completed'
  },
  {
    id: 'ord-9',
    date: '2026-07-06T11:45:00Z',
    items: [
      { productId: 'p-6', productName: 'Pistachio Latte', quantity: 1, price: 5.80 },
      { productId: 'p-16', productName: 'Eggs Benedict Trio', quantity: 2, price: 13.50 }
    ],
    paymentMethod: 'Credit', // Tabs
    subtotal: 32.80,
    discount: 0,
    tax: 2.62,
    total: 35.42,
    cashierId: 'u-2',
    cashierName: 'Sarah Connor',
    status: 'completed'
  },
];

export const INITIAL_LOGS: ActivityLog[] = [
  { id: 'log-1', time: '2026-07-06T07:15:00Z', user: 'Youssef Aly', action: 'Supplier Purchase', details: 'Ordered organic milk and oat milk case from Valley Organic Dairy', type: 'purchase' },
  { id: 'log-2', time: '2026-07-06T07:30:00Z', user: 'Sarah Connor', action: 'Drawer Opened', details: 'Shift started with $150 float', type: 'system' },
  { id: 'log-3', time: '2026-07-06T09:15:00Z', user: 'Karim Refaat', action: 'Checkout', details: 'Order #ord-7 completed for $40.39 via Instapay', type: 'sale' },
  { id: 'log-4', time: '2026-07-06T11:45:00Z', user: 'Sarah Connor', action: 'Record Debt', details: 'Added $35.42 to Marcus Aurelius account credit tab', type: 'debt' },
  { id: 'log-5', time: '2026-07-06T12:00:00Z', user: 'Youssef Aly', action: 'Product Update', details: 'Updated stock level for "Double Espresso"', type: 'product' },
];

export const INITIAL_DEBTS: CustomerDebt[] = [];

