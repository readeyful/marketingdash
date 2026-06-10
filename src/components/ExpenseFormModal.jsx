import { useState } from 'react'
import { EXPENSE_CATEGORIES, EXPENSE_PLATFORMS } from '../lib/constants'
import { INK, INK_MUTED, INPUT_CLASS, LABEL_CLASS } from '../lib/theme'
import Modal from './Modal'

function todayString() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const EMPTY_EXPENSE = {
  date: todayString(),
  platform: 'Instagram',
  description: '',
  amount: '',
  category: 'Boosted post',
}

export default function ExpenseFormModal({ open, onClose, onSave, onDelete, expense }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_EXPENSE,
    ...expense,
    amount: expense ? String(expense.amount) : '',
  }))

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      amount: Number(form.amount) || 0,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={expense ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Date
            </label>
            <input
              type="date"
              className={INPUT_CLASS}
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              required
            />
          </div>

          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={INPUT_CLASS}
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Platform
            </label>
            <select
              className={INPUT_CLASS}
              value={form.platform}
              onChange={(e) => update('platform', e.target.value)}
            >
              {EXPENSE_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Category
            </label>
            <select
              className={INPUT_CLASS}
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Description
          </label>
          <input
            type="text"
            className={INPUT_CLASS}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What was this spend for?"
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          {expense ? (
            <button
              type="button"
              onClick={() => onDelete(expense.id)}
              className="text-sm font-medium transition hover:opacity-70"
              style={{ color: '#C0524A' }}
            >
              Delete expense
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-black/5"
              style={{ color: INK_MUTED }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: INK }}
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
