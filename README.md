# POS System - Advanced Retail Management

A comprehensive Point of Sale (POS) system with IMEI tracking, multi-store support, and advanced inventory management features.

## Features

### ✅ Multi-item Shopping Cart
- Device selection from inventory
- Real-time stock checking
- Flexible payment system (cash, mobile money, split payments)
- Partial payment support

### ✅ IMEI & Device Tracking
- IMEI 1 (required for all devices)
- IMEI 2 (optional for dual SIM)
- Serial Number (optional for custom items)
- Multi-device sales with individual IMEI tracking
- IMEI display in Sales History
- Search functionality across all IMEIs

### ✅ Cashier Management
- Multi-user cashier system (up to 20 users)
- Secure login with password authentication
- Session persistence across app restarts
- Smart navigation (back without logout goes to dashboard)
- Cashier name tracked on all sales

### ✅ Inventory Management
- Add/edit devices with model, storage, color, condition
- Real-time stock adjustments
- Custom items (non-iPhone products)
- Accessory management
- Inventory value tracking
- Test data generation for quick setup

### ✅ Sales Management
- Complete sales history with date grouping
- Search by IMEI, model, cashier, buyer name
- Detailed sale view with all information
- Delete sales with admin password protection
- Payment status tracking (paid, unpaid, partial)

### ✅ Customer Management
- Add/manage customers
- View purchase history
- Contact information tracking

### ✅ Multi-Currency Support
- USD ($) formatting
- Ghanaian Cedi (₵) formatting
- Currency preference in Admin Settings
- Persistent currency selection

### ✅ Admin Features
- Password-protected admin panel (default: admin123)
- Three management tabs: Inventory, Accessories, Users, Settings
- Inventory value summary
- Cashier user creation/management
- Custom items administration

### ✅ Dashboard
- Today's revenue
- Total revenue
- Recent transactions
- Unpaid orders alert
- Quick access to POS, sales history, customers

### ✅ iPhone-Specific Features
- iPhone model catalog (iPhone 17 and earlier)
- Color options (Desert Titanium, Midnight Black, Arctic Blue, Rose Gold, Natural Titanium)
- Storage options (up to 2TB)
- Condition tracking (New, Refurbished, Used)
- IMEI 2 and Serial hidden for iPhone models

### ✅ Sales Analytics and Charts
- Daily/weekly/monthly summaries
- Inventory movement reports
- Top selling devices
- Top performing cashiers

### ✅ CSV Export of Sales Data
- Inventory export
- Automatic backup system
- Data restore functionality

### ✅ Multiple Store Locations
- Store-specific inventory
- Consolidated reporting
- Per-store settings
- Inter-store transfers

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Default Login

- **Username:** admin
- **Password:** admin123

## Usage

1. **Login**: Use the default admin credentials or create a new cashier account
2. **POS**: Add items to cart, enter IMEI information, and process payments
3. **Dashboard**: View sales statistics and quick actions
4. **Sales History**: Search and view all past transactions
5. **Customers**: Manage customer information and view purchase history
6. **Admin Panel**: 
   - Manage inventory and accessories
   - Create and manage cashier accounts
   - View analytics and reports
   - Manage multiple store locations
   - Configure system settings

## Data Storage

All data is stored locally in the browser using localStorage. Each store has its own separate inventory, sales, and customer data.

## Backup & Restore

Use the Settings tab in the Admin Panel to:
- Create backups of all data
- Restore from backup files
- Export inventory and sales data as CSV

## Technologies Used

- React 18
- React Router 6
- Tailwind CSS
- Recharts (for analytics)
- date-fns (for date formatting)
- lucide-react (for icons)
- Vite (build tool)

## License

MIT

