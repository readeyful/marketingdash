import { X } from 'lucide-react'
import { INK, INK_MUTED, PAGE_BG } from '../lib/theme'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-lg rounded-2xl p-6 shadow-xl"
        style={{ backgroundColor: PAGE_BG }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl" style={{ color: INK }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 transition hover:bg-black/5"
            style={{ color: INK_MUTED }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
