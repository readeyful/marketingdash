import { useEffect, useRef, useState } from 'react'
import { ACTIVITY_TYPES, formatActivityTimeRange } from '../lib/constants'
import { CARD_BG, INK, INK_MUTED, PAGE_BG } from '../lib/theme'

const POPOVER_WIDTH = 260

function formatDateLabel(dateString) {
  const [y, m, d] = dateString.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function ActivityPopover({ activity, anchorRect, onClose, onEdit, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [onClose])

  const config = ACTIVITY_TYPES[activity.type] ?? ACTIVITY_TYPES.Other
  const Icon = config.icon
  const timeRange = activity.startTime
    ? formatActivityTimeRange(activity.startTime, activity.endTime)
    : ''

  let left = anchorRect.left
  let top = anchorRect.bottom + 6
  if (left + POPOVER_WIDTH > window.innerWidth - 16) {
    left = window.innerWidth - POPOVER_WIDTH - 16
  }
  if (top + 180 > window.innerHeight) {
    top = Math.max(16, anchorRect.top - 180)
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 rounded-2xl border border-(--border-soft) p-4 shadow-xl"
      style={{ backgroundColor: PAGE_BG, width: POPOVER_WIDTH, left, top }}
    >
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: config.text }}>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
          style={{ backgroundColor: config.bg, borderColor: config.border }}
        >
          <Icon size={15} />
        </span>
        {activity.type}
      </div>
      <p className="mt-2 truncate text-sm font-medium" style={{ color: INK }}>
        {activity.title}
      </p>
      <p className="mt-1 text-xs" style={{ color: INK_MUTED }}>
        {formatDateLabel(activity.date)}
        {timeRange && ` · ${timeRange}`}
      </p>
      {activity.note && (
        <p className="mt-2 text-xs" style={{ color: INK_MUTED }}>
          Note: {activity.note}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-(--border-soft) pt-3">
        {confirmingDelete ? (
          <div className="flex w-full items-center justify-between text-sm">
            <span style={{ color: INK }}>Delete this activity?</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onDelete(activity.id)}
                className="font-medium"
                style={{ color: '#C0524A' }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                style={{ color: INK_MUTED }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(activity)}
              className="rounded-full px-3 py-1.5 text-sm font-medium transition hover:bg-(--border-soft)"
              style={{ color: INK, backgroundColor: CARD_BG }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-full px-3 py-1.5 text-sm font-medium transition hover:bg-(--border-soft)"
              style={{ color: '#C0524A' }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
