import { useEffect, useState } from 'react'
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Heart,
  Image,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CaptionGenerator from './CaptionGenerator'
import { ActionButton, InlineField, Toast } from './PostDetailPanel'
import { VAULT_TYPES } from '../lib/constants'
import { getPost } from '../lib/storage'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  INPUT_CLASS,
} from '../lib/theme'

function CopyIcon() {
  return <Copy size={16} />
}

export default function VaultDetailPanel({
  item,
  onClose,
  onUpdate,
  onEdit,
  onDuplicate,
  onDelete,
  onSchedule,
}) {
  const [captionDraft, setCaptionDraft] = useState(item.caption ?? '')
  const [toast, setToast] = useState('')
  const [slide, setSlide] = useState(0)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const typeInfo = VAULT_TYPES[item.type] ?? VAULT_TYPES.template
  const images = item.images ?? []
  const usedPosts = (item.scheduledPostIds ?? [])
    .map((id) => getPost(id))
    .filter(Boolean)

  function copyCaption() {
    navigator.clipboard.writeText(captionDraft)
    setToast('Caption copied!')
  }

  function handleDelete() {
    if (window.confirm('Delete this vault item?')) {
      onDelete(item.id)
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
          onClick={() => onUpdate({ isFavorited: !item.isFavorited })}
          aria-label="Favorite"
          className="rounded-lg p-1.5 transition hover:bg-(--border-soft)"
          style={{ color: item.isFavorited ? '#E0524A' : INK_MUTED }}
        >
          <Heart size={18} fill={item.isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h2 className="font-display text-2xl" style={{ color: INK }}>
        {item.title || 'Untitled'}
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide text-white"
          style={{ backgroundColor: typeInfo.color }}
        >
          {typeInfo.label}
        </span>
        {item.format && (
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide"
            style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
          >
            {item.format}
          </span>
        )}
        {item.pillar && (
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
          >
            {item.pillar}
          </span>
        )}
        {item.audience && (
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
          >
            {item.audience}
          </span>
        )}
        {(item.platforms ?? []).map((p) => (
          <span
            key={p}
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
          >
            {p}
          </span>
        ))}
      </div>

      {(item.sourceUrl || item.candcName) && (
        <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: INK_MUTED }}>
          Source:{' '}
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline"
              style={{ color: INK }}
            >
              {item.sourceUrl.length > 40 ? `${item.sourceUrl.slice(0, 40)}…` : item.sourceUrl}
              <ExternalLink size={11} />
            </a>
          ) : (
            <span style={{ color: INK }}>{item.candcName}</span>
          )}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-1 border-y border-(--border-soft) py-2">
        <ActionButton
          icon={CalendarPlus}
          label="Schedule"
          onClick={() => setDatePickerOpen((o) => !o)}
        />
        <ActionButton icon={Pencil} label="Edit" onClick={() => onEdit(item)} />
        <ActionButton icon={CopyIcon} label="Duplicate" onClick={() => onDuplicate(item.id)} />
        <ActionButton icon={Trash2} label="Delete" onClick={handleDelete} danger />
      </div>

      {datePickerOpen && (
        <div className="mt-3 flex items-end gap-2 rounded-xl p-3" style={{ backgroundColor: CARD_BG }}>
          <div className="flex-1">
            <span className="mb-1 block text-xs font-medium" style={{ color: INK_MUTED }}>
              Schedule for
            </span>
            <input
              type="date"
              className={INPUT_CLASS}
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={!scheduleDate}
            onClick={() => {
              onSchedule(item.id, scheduleDate)
              setDatePickerOpen(false)
              setScheduleDate('')
            }}
            className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
          >
            Schedule
          </button>
        </div>
      )}

      {/* Image preview */}
      <div className="relative mt-4">
        {images.length > 0 ? (
          <>
            <img src={images[slide]} alt="" className="w-full rounded-xl object-cover" />
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  aria-label="Previous image"
                  className="rounded-full p-1 shadow"
                  style={{ backgroundColor: 'var(--surface-page)', color: INK }}
                  onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
                >
                  <ChevronLeft size={14} />
                </button>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium shadow"
                  style={{ backgroundColor: 'var(--surface-page)', color: INK }}
                >
                  {slide + 1} / {images.length}
                </span>
                <button
                  type="button"
                  aria-label="Next image"
                  className="rounded-full p-1 shadow"
                  style={{ backgroundColor: 'var(--surface-page)', color: INK }}
                  onClick={() => setSlide((s) => (s + 1) % images.length)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl"
            style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
          >
            <Image size={28} />
            <span className="text-xs font-medium uppercase tracking-wide">
              {item.format ?? 'No image yet'}
            </span>
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
            if (captionDraft !== (item.caption ?? '')) {
              onUpdate({ caption: captionDraft })
            }
          }}
        />

        <div className="mt-4">
          <CaptionGenerator
            post={{
              platform: item.platforms?.[0] ?? 'Instagram',
              postType: item.format,
              title: item.title,
              postGoal: item.postGoal || [item.pillar, item.audience].filter(Boolean).join(' / '),
              postStrategy: item.postStrategy || item.notes,
            }}
            onUseCaption={(caption) => {
              setCaptionDraft(caption)
              onUpdate({ caption })
              setToast('Caption added!')
            }}
          />
        </div>
      </div>

      {/* Strategy notes */}
      <div className="mt-5 flex flex-col gap-3">
        <span className="text-sm font-semibold" style={{ color: INK }}>
          Strategy notes
        </span>
        <InlineField
          label="Goal"
          value={item.postGoal}
          placeholder="e.g. Reach new local followers"
          onSave={(v) => onUpdate({ postGoal: v })}
        />
        <InlineField
          label="Strategy"
          value={item.postStrategy}
          placeholder="e.g. Monthly roundups get shared and saved"
          onSave={(v) => onUpdate({ postStrategy: v })}
        />
        <InlineField
          label="Extra tip"
          value={item.postTip}
          placeholder="e.g. Re-share to Stories the same day"
          onSave={(v) => onUpdate({ postTip: v })}
        />
        <InlineField
          label="Notes"
          value={item.notes}
          placeholder="Anything else about this idea"
          onSave={(v) => onUpdate({ notes: v })}
        />
      </div>

      {/* Usage history */}
      <div className="mt-5 border-t border-(--border-soft) pt-4 pb-2">
        <span className="text-sm font-semibold" style={{ color: INK }}>
          Usage
        </span>
        {usedPosts.length === 0 ? (
          <p className="mt-1 text-xs" style={{ color: INK_MUTED }}>
            Not yet scheduled
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-1.5">
            <p className="text-xs" style={{ color: INK_MUTED }}>
              Used {usedPosts.length} {usedPosts.length === 1 ? 'time' : 'times'}
            </p>
            {usedPosts.map((post) => (
              <Link
                key={post.id}
                to="/calendar"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs transition hover:bg-(--border-soft)"
                style={{ backgroundColor: CARD_BG, color: INK }}
              >
                <span className="truncate font-medium">{post.title || 'Untitled'}</span>
                <span style={{ color: INK_MUTED }}>{post.scheduledDate ?? 'Not scheduled'}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast} />}
    </div>
  )
}
