/**
 * Export Utilities
 * Export transactions to CSV
 */

interface Transaction {
  date: string
  type: string
  category: string
  description: string
  merchantName?: string
  amount: number
  paymentMethod?: string
}

/**
 * Export transactions to CSV
 */
export function exportToCSV(transactions: Transaction[], filename = 'transactions.csv') {
  if (transactions.length === 0) {
    alert('No transactions to export')
    return
  }

  // CSV headers
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Merchant',
    'Amount (₹)',
    'Payment Method'
  ]

  // Convert transactions to CSV rows
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('en-IN'),
    t.type,
    t.category,
    t.description,
    t.merchantName || '-',
    t.amount.toFixed(2),
    t.paymentMethod || '-'
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export with summary
 */
export function exportToCSVWithSummary(
  transactions: Transaction[],
  filename = 'transactions_with_summary.csv'
) {
  if (transactions.length === 0) {
    alert('No transactions to export')
    return
  }

  // Calculate summary
  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // CSV content with summary
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Merchant',
    'Amount (₹)',
    'Payment Method'
  ]

  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('en-IN'),
    t.type,
    t.category,
    t.description,
    t.merchantName || '-',
    t.amount.toFixed(2),
    t.paymentMethod || '-'
  ])

  const csvContent = [
    '# Transaction Summary',
    `# Total Transactions: ${transactions.length}`,
    `# Total Income: ₹${totalIncome.toFixed(2)}`,
    `# Total Expenses: ₹${totalExpenses.toFixed(2)}`,
    `# Balance: ₹${balance.toFixed(2)}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
