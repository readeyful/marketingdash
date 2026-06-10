import { useState } from 'react'
import { PLATFORMS, POST_STATUSES } from '../lib/constants'
import { INK, INK_MUTED, INPUT_CLASS, LABEL_CLASS } from '../lib/theme'
import Modal from './Modal'

const EMPTY_POST = {
  title: '',
  platform: 'Instagram',
  status: 'Idea',
  scheduledDate: '',
  caption: '',
  notes: '',
}

export default function PostFormModal({
  open,
  onClose,
  onSave,
  onDelete,
  post,
  defaultDate,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_POST,
    scheduledDate: defaultDate ?? '',
    ...post,
  }))

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      scheduledDate: form.scheduledDate || null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={post ? 'Edit Post' : 'New Post'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Title
          </label>
          <input
            type="text"
            className={INPUT_CLASS}
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Internal label, not published"
          />
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
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Status
            </label>
            <select
              className={INPUT_CLASS}
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
            >
              {POST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Scheduled date
          </label>
          <input
            type="date"
            className={INPUT_CLASS}
            value={form.scheduledDate ?? ''}
            onChange={(e) => update('scheduledDate', e.target.value)}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Caption
          </label>
          <textarea
            className={INPUT_CLASS}
            rows={3}
            value={form.caption}
            onChange={(e) => update('caption', e.target.value)}
            placeholder="The actual post copy"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Notes
          </label>
          <textarea
            className={INPUT_CLASS}
            rows={2}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Internal only"
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          {post ? (
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="text-sm font-medium transition hover:opacity-70"
              style={{ color: '#C0524A' }}
            >
              Delete post
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
