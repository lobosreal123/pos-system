export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(amount))
}

export const formatCurrencyGHS = (amount) => {
  // Format with just the cedi symbol, no "GH" prefix
  const rounded = Math.round(amount)
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rounded)
  return `₵${formatted}`
}

export const getCurrencySymbol = (currency) => {
  return currency === 'GHS' ? '₵' : '$'
}

