# APPLE BAZAAR - POS System

Advanced Point of Sale (POS) System with IMEI Tracking, Multi-Store Support, and Comprehensive Sales Management.

## Features

- 🛒 **Multi-Item Shopping Cart** - Add items with quantity control
- 📱 **IMEI & Device Tracking** - Track IMEI 1, IMEI 2, and Serial Numbers
- 💰 **Flexible Payment Options** - Cash, Mobile Money, Split Payment
- 👥 **Cashier Management** - Multi-user support with secure login
- 📊 **Inventory Management** - Real-time stock tracking, low stock alerts
- 📈 **Sales Analytics** - Comprehensive dashboard with charts and reports
- 🏪 **Multi-Store Support** - Manage multiple store locations
- 💵 **Multi-Currency** - Support for USD and GHS (Ghanaian Cedi)
- 🖨️ **Receipt Printing** - Print receipts with QR codes
- 📱 **Barcode Scanner** - Scan barcodes using web camera
- 📦 **CSV Export** - Export sales and inventory data
- 💾 **Backup & Restore** - Automatic backup functionality

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build Tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling (Glassmorphism UI)
- **Recharts** - Data Visualization
- **LocalStorage** - Data Persistence

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/lobosreal123/pos-system.git

# Navigate to project directory
cd pos-system

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Quick Deploy Options

#### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel auto-detects and deploys

#### Option 2: Netlify
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your GitHub repository
4. Netlify auto-detects and deploys

Both platforms will automatically redeploy when you push to the `main` branch.

### Manual Deployment

See [HOSTING_GUIDE.md](./HOSTING_GUIDE.md) for detailed instructions.

## Automatic Updates

The project is configured for automatic deployments:

### GitHub Actions (CI/CD)
- Automatically builds and deploys when you push to `main` branch
- Configuration: `.github/workflows/deploy.yml`

### Setup Automatic Deployment:

**For Vercel:**
1. Connect your GitHub repo to Vercel
2. Vercel automatically deploys on every push

**For Netlify:**
1. Connect your GitHub repo to Netlify
2. Netlify automatically deploys on every push

**For GitHub Actions:**
1. Add secrets in GitHub repo settings:
   - `VERCEL_TOKEN` (for Vercel)
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - Or `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` (for Netlify)

## Making Updates

1. **Make your code changes**
2. **Test locally:**
   ```bash
   npm run dev
   ```
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. **Automatic deployment** - Your hosting platform will automatically rebuild and deploy

## Project Structure

```
pos-system/
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # React Context (State Management)
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── dist/               # Production build (generated)
├── .github/            # GitHub Actions workflows
├── vercel.json         # Vercel configuration
├── netlify.toml        # Netlify configuration
└── package.json        # Dependencies and scripts
```

## Default Login Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Cashier:**
- Username: `cashier`
- Password: `cashier123`

**⚠️ Important:** Change these passwords in production!

## Data Storage

Currently, the app uses **localStorage** for data persistence:
- Data is stored in the user's browser
- Data is NOT shared across devices
- Data is lost if browser cache is cleared

For production with shared data, consider migrating to:
- Firebase Firestore
- Supabase
- MongoDB Atlas
- PostgreSQL with backend API

## Environment Variables

No environment variables required for basic setup.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push
5. Create a Pull Request

## License

Private project - All rights reserved

## Support

For issues or questions:
1. Check the documentation files
2. Review the code comments
3. Create an issue on GitHub

## Version

Current version: 1.0.0

---

Built with ❤️ for APPLE BAZAAR
