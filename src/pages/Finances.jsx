import { useMemo, useState } from 'react'
import { Download, Plus } from 'lucide-react'
import ExpenseFormModal from '../components/ExpenseFormModal'
import StatCard from '../components/StatCard'
import { useWorkspace } from '../context/workspace-context'
import { PLATFORM_ICONS } from '../lib/constants'
import { deleteExpense, getExpenses, saveExpense } from '../lib/storage'
import { CARD_BG, INK, INK_MUTED, INPUT_CLASS, LABEL_CLASS, STAT_ACCENTS } from '../lib/theme'

function todayDate() {
  return new Date()
}

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfMonthString(date) {
  return toDateString(new Date(date.getFullYear(), date.getMonth(), 1))
}

function endOfMonthString(date) {
  return toDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

function formatCurrency(amount) {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function downloadCSV(expenses, filename) {
  const header = ['Date', 'Platform', 'Description', 'Amount', 'Category']
  const rows = expenses.map((e) => [
    e.date,
    e.platform,
    e.description ?? '',
    e.amount,
    e.category,
  ])

  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((field) => {
          const value = String(field)
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(','),
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function FinancesView({ workspaceId }) {
  const { activeWorkspace, updateActiveWorkspace } = useWorkspace()
  const [expenses, setExpenses] = useState(() => getExpenses(workspaceId))
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const today = todayDate()
  const monthStart = startOfMonthString(today)
  const monthEnd = endOfMonthString(today)

  const [exportStart, setExportStart] = useState(monthStart)
  const [exportEnd, setExportEnd] = useState(monthEnd)

  const budget = activeWorkspace?.monthlyAdBudget ?? 0

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date >= monthStart && e.date <= monthEnd),
    [expenses, monthStart, monthEnd],
  )

  const totalSpend = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses],
  )

  const remaining = budget - totalSpend

  const spendByPlatform = useMemo(() => {
    const totals = {}
    for (const e of monthExpenses) {
      totals[e.platform] = (totals[e.platform] ?? 0) + e.amount
    }
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [monthExpenses])

  const maxPlatformSpend = spendByPlatform.length > 0 ? spendByPlatform[0][1] : 0

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [expenses],
  )

  function openNewExpense() {
    setEditingExpense(null)
    setModalOpen(true)
  }

  function openEditExpense(expense) {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  function handleSave(expenseData) {
    const updated = saveExpense({
      ...expenseData,
      id: editingExpense?.id,
      workspaceId,
    })
    setExpenses(updated.filter((e) => e.workspaceId === workspaceId))
    setModalOpen(false)
  }

  function handleDelete(expenseId) {
    setExpenses(deleteExpense(expenseId).filter((e) => e.workspaceId === workspaceId))
    setModalOpen(false)
  }

  function handleExport() {
    const inRange = expenses.filter((e) => e.date >= exportStart && e.date <= exportEnd)
    downloadCSV(inRange, `expenses_${exportStart}_to_${exportEnd}.csv`)
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Spend This Month"
          value={formatCurrency(totalSpend)}
          accentColor={STAT_ACCENTS[0]}
        />
        <StatCard
          label="Remaining Budget"
          value={formatCurrency(remaining)}
          accentColor={STAT_ACCENTS[1]}
        />
        <StatCard
          label="Monthly Budget"
          value={formatCurrency(budget)}
          accentColor={STAT_ACCENTS[2]}
        />
        <StatCard
          label="Expenses Logged"
          value={expenses.length}
          accentColor={STAT_ACCENTS[3]}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl p-5" style={{ backgroundColor: CARD_BG }}>
          <h3 className="font-display text-lg" style={{ color: INK }}>
            Monthly budget
          </h3>
          <p className="mt-1 text-sm" style={{ color: INK_MUTED }}>
            Set the target ad spend for this workspace.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm" style={{ color: INK_MUTED }}>
              $
            </span>
            <input
              type="number"
              min="0"
              step="1"
              className={INPUT_CLASS}
              value={budget}
              onChange={(e) =>
                updateActiveWorkspace({ monthlyAdBudget: Number(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: CARD_BG }}>
          <h3 className="font-display text-lg" style={{ color: INK }}>
            Spend by platform
          </h3>
          <p className="mt-1 text-sm" style={{ color: INK_MUTED }}>
            This month
          </p>

          {spendByPlatform.length === 0 ? (
            <p className="mt-4 text-sm" style={{ color: INK_MUTED }}>
              No spend logged yet this month.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {spendByPlatform.map(([platform, amount], i) => (
                <div key={platform}>
                  <div className="mb-1 flex items-center justify-between text-xs" style={{ color: INK_MUTED }}>
                    <span>{platform}</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full" style={{ backgroundColor: '#FFFFFF' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${maxPlatformSpend > 0 ? (amount / maxPlatformSpend) * 100 : 0}%`,
                        backgroundColor: STAT_ACCENTS[i % STAT_ACCENTS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              From
            </label>
            <input
              type="date"
              className={INPUT_CLASS}
              value={exportStart}
              onChange={(e) => setExportStart(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              To
            </label>
            <input
              type="date"
              className={INPUT_CLASS}
              value={exportEnd}
              onChange={(e) => setExportEnd(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-black/5"
            style={{ color: INK, backgroundColor: CARD_BG }}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <button
          type="button"
          onClick={openNewExpense}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: INK }}
        >
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl" style={{ backgroundColor: CARD_BG }}>
        {sortedExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-2xl" style={{ color: INK }}>
              No expenses yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: INK_MUTED }}>
              Log your first ad expense to start tracking spend.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: INK_MUTED }}>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.map((expense) => {
                  const Icon = PLATFORM_ICONS[expense.platform]
                  return (
                    <tr
                      key={expense.id}
                      onClick={() => openEditExpense(expense)}
                      className="cursor-pointer border-t border-black/5 transition hover:bg-black/5"
                    >
                      <td className="px-5 py-3" style={{ color: INK_MUTED }}>
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-5 py-3" style={{ color: INK_MUTED }}>
                        {Icon ? <Icon size={16} /> : expense.platform}
                      </td>
                      <td className="px-5 py-3" style={{ color: INK }}>
                        {expense.description || '—'}
                      </td>
                      <td className="px-5 py-3" style={{ color: INK_MUTED }}>
                        {expense.category}
                      </td>
                      <td className="px-5 py-3 text-right font-medium" style={{ color: INK }}>
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExpenseFormModal
        key={editingExpense?.id ?? 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        expense={editingExpense}
      />
    </>
  )
}

export default function Finances() {
  const { activeWorkspace } = useWorkspace()

  return (
    <div>
      <h1 className="font-display text-4xl" style={{ color: INK }}>
        Finances
      </h1>
      <p className="mt-2 max-w-xl text-sm" style={{ color: INK_MUTED }}>
        Track marketing spend against your monthly ad budget.
      </p>

      {activeWorkspace && (
        <FinancesView key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
      )}
    </div>
  )
}
