import { useEffect, useState } from 'react'
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import CaptionGenerator from './CaptionGenerator'
import { PLATFORM_ICONS, STATUS_COLORS } from '../lib/constants'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  INPUT_CLASS,
} from '../lib/theme'

export function Toast({ message }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-lg"
      style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
    >
      {message}
    </div>
  )
}

export function ActionButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition hover:bg-(--border-soft)"
      style={{ color: danger ? '#C0524A' : INK_MUTED }}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

export function InlineField({ label, value, placeholder, onSave }) {
  const [draft, setDraft] = useState(value ?? '')

  return (
    <div>
      <span className="mb-1 block text-xs font-medium" style={{ color: INK_MUTED }}>
        {label}
      </span>
      <textarea
        rows={2}
        className={INPUT_CLASS}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== (value ?? '')) onSave(draft)
        }}
      />
    </div>
  )
}

export default function PostDetailPanel({
  post,
  onClose,
  onUpdate,
  onEdit,
  onDelete,
}) {
  const [captionDraft, setCaptionDraft] = useState(post.caption ?? '')
  const [notesOpen, setNotesOpen] = useState(true)
  const [toast, setToast] = useState('')

  // Note: callers render this panel with key={post.id}, so caption state
  // resets naturally when a different post is selected.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const Icon = PLATFORM_ICONS[post.platform]
  const hasStrategyNotes = post.postGoal || post.postStrategy || post.postTip

  function copyCaption() {
    navigator.clipboard.writeText(captionDraft)
    setToast('Caption copied!')
  }

  function handleDelete() {
    if (window.confirm('Delete this post?')) {
      onDelete(post.id)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1.5 transition hover:bg-(--border-soft)"
          style={{ color: INK_MUTED }}
        >
          <X size={18} />
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ isFavorited: !post.isFavorited })}
          aria-label="Favorite"
          title={post.isFavorited ? 'Remove favorite' : 'Favorite'}
          className="rounded-lg p-1.5 transition hover:bg-(--border-soft)"
          style={{ color: post.isFavorited ? '#E8C84A' : INK_MUTED }}
        >
          <Bookmark size={18} fill={post.isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Identity */}
      <h2 className="font-display text-2xl" style={{ color: INK }}>
        {post.title || 'Untitled post'}
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: CARD_BG, color: INK }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[post.status] }}
          />
          {post.status}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
        >
          <Icon size={12} />
          {post.platform}
        </span>
        {post.postType && (
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide"
            style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
          >
            {post.postType}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-1 border-y border-(--border-soft) py-2">
        {post.sourceUrl && (
          <ActionButton
            icon={ExternalLink}
            label="Open original"
            onClick={() => window.open(post.sourceUrl, '_blank', 'noreferrer')}
          />
        )}
        <ActionButton icon={Copy} label="Copy caption" onClick={copyCaption} />
        <ActionButton icon={Pencil} label="Edit post" onClick={() => onEdit(post)} />
        <ActionButton icon={Trash2} label="Delete" onClick={handleDelete} danger />
      </div>

      {/* Image preview */}
      <div className="mt-4">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            className="w-full rounded-xl object-cover"
          />
        ) : (
          <div
            className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl"
            style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
          >
            <Icon size={28} />
            <span className="text-xs font-medium uppercase tracking-wide">
              {post.postType ?? 'No image yet'}
            </span>
          </div>
        )}
      </div>

      {/* Strategy notes */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setNotesOpen((o) => !o)}
          className="flex w-full items-center gap-1.5 text-sm font-semibold"
          style={{ color: INK }}
        >
          {notesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          About this post
        </button>

        {notesOpen && (
          <div className="mt-3 flex flex-col gap-3">
            {!hasStrategyNotes && (
              <p className="text-xs" style={{ color: INK_MUTED }}>
                Add strategy notes — what's this post trying to achieve?
              </p>
            )}
            <InlineField
              label="Goal"
              value={post.postGoal}
              placeholder="e.g. Reach new local followers"
              onSave={(v) => onUpdate({ postGoal: v })}
            />
            <InlineField
              label="Strategy"
              value={post.postStrategy}
              placeholder="e.g. Monthly roundups get shared and saved"
              onSave={(v) => onUpdate({ postStrategy: v })}
            />
            <InlineField
              label="Extra tip"
              value={post.postTip}
              placeholder="e.g. Re-share to Stories the same day"
              onSave={(v) => onUpdate({ postTip: v })}
            />
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: INK }}>
            Caption
          </span>
          <button
            type="button"
            onClick={copyCaption}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:bg-(--border-soft)"
            style={{ color: INK_MUTED }}
          >
            <Copy size={12} />
            Copy Caption
          </button>
        </div>
        <textarea
          rows={5}
          className={INPUT_CLASS}
          value={captionDraft}
          placeholder="Write your caption..."
          onChange={(e) => setCaptionDraft(e.target.value)}
          onBlur={() => {
            if (captionDraft !== (post.caption ?? '')) {
              onUpdate({ caption: captionDraft })
            }
          }}
        />

        <div className="mt-4">
          <CaptionGenerator
            post={post}
            onUseCaption={(caption) => {
              setCaptionDraft(caption)
              onUpdate({ caption })
              setToast('Caption added!')
            }}
          />
        </div>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  )
}
