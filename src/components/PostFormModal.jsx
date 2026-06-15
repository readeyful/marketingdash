import { useState } from 'react'
import { CONTENT_PILLARS, PLATFORMS, POST_TYPES } from '../lib/constants'
import { ACCENT_SOLID_BG, ACCENT_SOLID_TEXT, INK_MUTED, INPUT_CLASS, LABEL_CLASS } from '../lib/theme'
import Modal from './Modal'

const EMPTY_POST = {
  title: '',
  platform: 'Instagram',
  scheduledDate: '',
  caption: '',
  notes: '',
  postType: '',
  pillar: '',
  imageUrl: null,
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    update('imageUrl', await readFileAsDataURL(file))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      scheduledDate: form.scheduledDate || null,
      postType: form.postType || null,
      pillar: form.pillar || null,
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

        <div className="grid grid-cols-3 gap-4">
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
              Post type
            </label>
            <select
              className={INPUT_CLASS}
              value={form.postType ?? ''}
              onChange={(e) => update('postType', e.target.value)}
            >
              <option value="">—</option>
              {POST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Content pillar
            </label>
            <select
              className={INPUT_CLASS}
              value={form.pillar ?? ''}
              onChange={(e) => update('pillar', e.target.value)}
            >
              <option value="">—</option>
              {CONTENT_PILLARS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            Image
          </label>
          {form.imageUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={form.imageUrl}
                alt=""
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => update('imageUrl', null)}
                className="text-sm font-medium transition hover:opacity-70"
                style={{ color: INK_MUTED }}
              >
                Remove image
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm"
              style={{ color: INK_MUTED }}
            />
          )}
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
