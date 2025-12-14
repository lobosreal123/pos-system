import { format } from 'date-fns'
import { generateReceiptQRCode } from './qrcode'

/**
 * Generate receipt HTML for printing
 */
export const generateReceiptHTML = async (sale, settings = {}) => {
  const {
    storeName = 'APPLE BAZAAR',
    storeAddress = '',
    storePhone = '',
    showQRCode = true,
    paperWidth = '80mm' // 80mm thermal printer standard
  } = settings

  let qrCodeDataURL = ''
  if (showQRCode) {
    try {
      qrCodeDataURL = await generateReceiptQRCode(sale)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const formatMoney = (amount) => {
    const rounded = Math.round(amount)
    if (sale.currency === 'GHS') {
      // For GHS, show just the cedi symbol without "GH" prefix
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(rounded)
      return `₵${formatted}`
    }
    // For USD, use standard currency formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(rounded)
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @media print {
      @page {
        size: ${paperWidth};
        margin: 0;
      }
      body {
        margin: 0;
        padding: 10px;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: ${paperWidth};
      padding: 10px;
      line-height: 1.4;
    }
    
    .receipt-header {
      text-align: center;
      border-bottom: 2px dashed #000;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    
    .store-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .store-info {
      font-size: 10px;
      margin: 2px 0;
    }
    
    .receipt-body {
      margin: 10px 0;
    }
    
    .receipt-line {
      border-top: 1px dashed #000;
      margin: 10px 0;
    }
    
    .item-row {
      margin: 5px 0;
    }
    
    .item-name {
      font-weight: bold;
    }
    
    .item-details {
      font-size: 10px;
      margin-left: 10px;
      color: #666;
    }
    
    .item-total {
      text-align: right;
      margin-top: 2px;
    }
    
    .receipt-footer {
      margin-top: 10px;
      border-top: 2px dashed #000;
      padding-top: 10px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      font-weight: bold;
    }
    
    .grand-total {
      font-size: 16px;
      border-top: 2px solid #000;
      padding-top: 5px;
      margin-top: 5px;
    }
    
    .payment-info {
      margin: 10px 0;
      font-size: 11px;
    }
    
    .qr-code {
      text-align: center;
      margin: 10px 0;
    }
    
    .qr-code img {
      width: 150px;
      height: 150px;
    }
    
    .footer-text {
      text-align: center;
      font-size: 10px;
      margin-top: 10px;
      color: #666;
    }
    
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 10px;
      margin: 5px 0;
    }
    
    .status-paid {
      background: #d4edda;
      color: #155724;
    }
    
    .status-partial {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-unpaid {
      background: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <div class="receipt-header">
    <div class="store-name">${storeName}</div>
    ${storeAddress ? `<div class="store-info">${storeAddress}</div>` : ''}
    ${storePhone ? `<div class="store-info">${storePhone}</div>` : ''}
  </div>
  
  <div class="receipt-body">
    <div><strong>Sale ID:</strong> ${sale.id}</div>
    <div><strong>Date:</strong> ${sale.createdAt ? format(new Date(sale.createdAt), 'PPpp') : format(new Date(), 'PPpp')}</div>
    <div><strong>Cashier:</strong> ${sale.cashierName || 'N/A'}</div>
    <div><strong>Customer:</strong> ${sale.buyerName || 'Walk-in Customer'}</div>
    ${sale.buyerPhone ? `<div><strong>Phone:</strong> ${sale.buyerPhone}</div>` : ''}
    
    <div class="receipt-line"></div>
    
    <div><strong>ITEMS:</strong></div>
    ${sale.items.map(item => `
      <div class="item-row">
        <div class="item-name">${item.name} x${item.quantity}</div>
        ${item.imei1 ? `<div class="item-details">IMEI 1: ${item.imei1}</div>` : ''}
        ${item.imei2 ? `<div class="item-details">IMEI 2: ${item.imei2}</div>` : ''}
        ${item.serialNumber ? `<div class="item-details">Serial: ${item.serialNumber}</div>` : ''}
        <div class="item-total">${formatMoney(item.price)} × ${item.quantity} = ${formatMoney(item.price * item.quantity)}</div>
      </div>
    `).join('')}
    
    <div class="receipt-line"></div>
    
    <div class="receipt-footer">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${formatMoney(sale.total)}</span>
      </div>
      ${sale.status !== 'paid' ? `
        <div class="total-row">
          <span>Paid:</span>
          <span>${formatMoney(sale.paidAmount || 0)}</span>
        </div>
        <div class="total-row">
          <span>Balance:</span>
          <span>${formatMoney(sale.total - (sale.paidAmount || 0))}</span>
        </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <span>${formatMoney(sale.total)}</span>
      </div>
      
      <div class="payment-info">
        <div><strong>Payment Method:</strong> ${sale.paymentMethod || 'N/A'}</div>
        ${(sale.cashAmount > 0 || sale.mobileMoneyAmount > 0) ? `
          <div class="receipt-line"></div>
          <div><strong>Payment Breakdown:</strong></div>
          ${sale.cashAmount > 0 ? `
            <div class="total-row">
              <span>Cash:</span>
              <span>${formatMoney(sale.cashAmount)}</span>
            </div>
          ` : ''}
          ${sale.mobileMoneyAmount > 0 ? `
            <div class="total-row">
              <span>Mobile Money:</span>
              <span>${formatMoney(sale.mobileMoneyAmount)}</span>
            </div>
          ` : ''}
          <div class="total-row">
            <span><strong>Total Paid:</strong></span>
            <span><strong>${formatMoney((sale.cashAmount || 0) + (sale.mobileMoneyAmount || 0))}</strong></span>
          </div>
        ` : ''}
        <div class="status-badge status-${sale.status || 'pending'}">
          ${(sale.status || 'pending').toUpperCase()}
        </div>
      </div>
      
      ${qrCodeDataURL ? `
        <div class="qr-code">
          <img src="${qrCodeDataURL}" alt="Receipt QR Code" />
          <div class="footer-text">Scan QR code for receipt details</div>
        </div>
      ` : ''}
      
      <div class="footer-text">
        Thank you for your purchase!<br>
        ${format(new Date(), 'PPp')}
      </div>
    </div>
  </div>
</body>
</html>
  `

  return html
}

/**
 * Print receipt
 */
export const printReceipt = async (sale, settings = {}) => {
  const html = await generateReceiptHTML(sale, settings)
  
  const printWindow = window.open('', '_blank', 'width=400,height=600')
  if (!printWindow) {
    alert('Please allow popups to print receipts')
    return
  }

  printWindow.document.write(html)
  printWindow.document.close()

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // Close window after printing (optional)
      // printWindow.close()
    }, 250)
  }
}

/**
 * Generate receipt as PDF (for email)
 */
export const generateReceiptPDF = async (sale, settings = {}) => {
  const html = await generateReceiptHTML(sale, settings)
  
  // For PDF generation, you would use jsPDF with html2canvas
  // This is a simplified version - you may want to use a library like react-pdf
  return html
}

