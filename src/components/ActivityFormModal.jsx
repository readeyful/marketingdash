import { useState } from 'react'
import Modal from './Modal'
import { ACTIVITY_TYPE_OPTIONS } from '../lib/constants'
import { ACCENT_SOLID_BG, ACCENT_SOLID_TEXT, INK_MUTED, INPUT_CLASS, LABEL_CLASS } from '../lib/theme'

const EMPTY_ACTIVITY = {
  title: '',
  type: ACTIVITY_TYPE_OPTIONS[0],
  date: '',
  startTime: '',
  endTime: '',
  note: '',
}

export default function ActivityFormModal({ open, onClose, onSave, onDelete, activity, defaultDate }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_ACTIVITY,
    date: defaultDate ?? '',
    ...activity,
    startTime: activity?.startTime ?? '',
    endTime: activity?.endTime ?? '',
    note: activity?.note ?? '',
  }))

  function update(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'startTime' && !value) next.endTime = ''
      return next
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      id: activity?.id,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      note: form.note || null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={activity ? 'Edit Activity' : 'New Activity'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Title
          </label>
          <input
            type="text"
            required
            className={INPUT_CLASS}
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. 123 Maple St Open House"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Type
            </label>
            <select
              className={INPUT_CLASS}
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
            >
              {ACTIVITY_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Date
            </label>
            <input
              type="date"
              required
              className={INPUT_CLASS}
              value={form.date ?? ''}
              onChange={(e) => update('date', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Start time
            </label>
            <input
              type="time"
              className={INPUT_CLASS}
              value={form.startTime ?? ''}
              onChange={(e) => update('startTime', e.target.value)}
            />
          </div>

          {form.startTime && (
            <div>
              <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
                End time
              </label>
              <input
                type="time"
                className={INPUT_CLASS}
                value={form.endTime ?? ''}
                onChange={(e) => update('endTime', e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Note
          </label>
          <textarea
            className={INPUT_CLASS}
            rows={2}
            value={form.note ?? ''}
            onChange={(e) => update('note', e.target.value)}
            placeholder="Optional internal note"
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          {activity ? (
            <button
              type="button"
              onClick={() => onDelete(activity.id)}
              className="text-sm font-medium transition hover:opacity-70"
              style={{ color: '#C0524A' }}
            >
              Delete activity
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-(--border-soft)"
              style={{ color: INK_MUTED }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
