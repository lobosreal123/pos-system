import QRCode from 'qrcode'

/**
 * Generate QR code as data URL
 * @param {string} text - Text to encode in QR code
 * @param {object} options - QR code options
 * @returns {Promise<string>} Data URL of QR code image
 */
export const generateQRCode = async (text, options = {}) => {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  }

  try {
    const dataURL = await QRCode.toDataURL(text, defaultOptions)
    return dataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

/**
 * Generate QR code as SVG string
 * @param {string} text - Text to encode in QR code
 * @param {object} options - QR code options
 * @returns {Promise<string>} SVG string
 */
export const generateQRCodeSVG = async (text, options = {}) => {
  const defaultOptions = {
    width: 300,
    margin: 2,
    ...options
  }

  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      ...defaultOptions
    })
    return svg
  } catch (error) {
    console.error('Error generating QR code SVG:', error)
    throw error
  }
}

/**
 * Generate QR code for sale receipt
 * @param {object} sale - Sale object
 * @returns {Promise<string>} Data URL of QR code
 */
export const generateReceiptQRCode = async (sale) => {
  const receiptData = {
    saleId: sale.id,
    date: sale.createdAt,
    total: sale.total,
    items: sale.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))
  }

  const text = JSON.stringify(receiptData)
  return generateQRCode(text, { width: 200 })
}

