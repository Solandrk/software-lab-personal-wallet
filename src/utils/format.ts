const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'IRR',
  maximumFractionDigits: 0,
})

export const formatCurrency = (value: number, currency?: string) => {
  if (Number.isNaN(value)) return '0'

  if (currency && currency !== 'IRR') {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    })
    return formatter.format(value)
  }

  return currencyFormatter.format(value)
}

export const formatDate = (value: string | Date, locales: string | string[] = 'en-GB') => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locales, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
