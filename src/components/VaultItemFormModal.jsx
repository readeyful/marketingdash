import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import Modal from './Modal'
import {
  AUDIENCES,
  CONTENT_PILLARS,
  PLATFORMS,
  POST_TYPES,
} from '../lib/constants'
import { getPosts, getVaultItems } from '../lib/storage'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  INPUT_CLASS,
  LABEL_CLASS,
} from '../lib/theme'

const EMPTY_FORM = {
  title: '',
  format: '',
  pillar: '',
  audience: '',
  images: [],
  caption: '',
  notes: '',
  platforms: [],
  candcName: '',
}

const URL_PATTERN = /^https?:\/\/\S+$/

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function SelectField({ label, value, options, onChange, placeholder = '—' }) {
  return (
    <div>
      <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
        {label}
      </label>
      <select className={INPUT_CLASS} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function PlatformMultiSelect({ value, onChange }) {
  return (
    <div>
      <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
        Platforms
      </label>
      <div className="flex gap-2">
        {PLATFORMS.map((p) => {
          const active = value.includes(p)
          return (
            <button
              key={p}
              type="button"
              onClick={() =>
                onChange(active ? value.filter((v) => v !== p) : [...value, p])
              }
              className="rounded-full px-3 py-1.5 text-xs font-medium transition"
              style={{
                backgroundColor: active ? ACCENT_SOLID_BG : CARD_BG,
                color: active ? ACCENT_SOLID_TEXT : INK_MUTED,
              }}
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ImageUpload({ images, onChange, max = 10 }) {
  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? []).slice(0, max - images.length)
    const dataUrls = await Promise.all(files.map(readFileAsDataURL))
    onChange([...images, ...dataUrls])
    e.target.value = ''
  }

  return (
    <div>
      <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
        Images {max > 1 && <span className="font-normal">(up to {max})</span>}
      </label>
      {images.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 rounded-full p-0.5 text-white shadow"
                style={{ backgroundColor: '#C0524A' }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length < max && (
        <input
          type="file"
          accept="image/*"
          multiple={max > 1}
          onChange={handleFiles}
          className="block w-full text-sm"
          style={{ color: INK_MUTED }}
        />
      )}
    </div>
  )
}

function TemplateTab({ form, update, isCandc }) {
  return (
    <>
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
          placeholder={isCandc ? 'Your name for it' : 'e.g. Monthly local roundup'}
        />
      </div>

      {isCandc && (
        <div>
          <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
            C&amp;C template name
          </label>
          <input
            type="text"
            className={INPUT_CLASS}
            value={form.candcName}
            onChange={(e) => update('candcName', e.target.value)}
            placeholder="The original name from C&C"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Post format"
          value={form.format}
          options={POST_TYPES}
          onChange={(v) => update('format', v)}
        />
        <SelectField
          label="Content pillar"
          value={form.pillar}
          options={CONTENT_PILLARS}
          onChange={(v) => update('pillar', v)}
        />
      </div>

      {!isCandc && (
        <SelectField
          label="Audience"
          value={form.audience}
          options={AUDIENCES}
          onChange={(v) => update('audience', v)}
        />
      )}

      <ImageUpload
        images={form.images}
        onChange={(imgs) => update('images', imgs)}
        max={isCandc ? 1 : 10}
      />

      {!isCandc && (
        <>
          <div>
            <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
              Caption
            </label>
            <textarea
              className={INPUT_CLASS}
              rows={3}
              value={form.caption}
              onChange={(e) => update('caption', e.target.value)}
              placeholder="Template caption — use [brackets] for fill-in-the-blank"
            />
          </div>
          <PlatformMultiSelect
            value={form.platforms}
            onChange={(v) => update('platforms', v)}
          />
        </>
      )}

      <div>
        <label className={LABEL_CLASS} style={{ color: INK_MUTED }}>
          Notes
        </label>
        <textarea
          className={INPUT_CLASS}
          rows={2}
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder={
            isCandc
              ? 'What you want to do differently, your spin on it'
              : 'Strategy notes — goal, approach, tips'
          }
        />
      </div>
    </>
  )
}

function FromInspoTab({ workspaceId, selectedIds, onToggle }) {
  // "Inspo" items are posts banked from a link on the Posts page: status
  // Idea with a URL in notes. Exclude ones already imported into the Vault.
  const candidates = useMemo(() => {
    const importedUrls = new Set(
      getVaultItems(workspaceId)
        .map((v) => v.sourceUrl)
        .filter(Boolean),
    )
    return getPosts(workspaceId).filter(
      (p) =>
        p.status === 'Idea' &&
        URL_PATTERN.test((p.sourceUrl ?? p.notes ?? '').trim()) &&
        !importedUrls.has((p.sourceUrl ?? p.notes).trim()),
    )
  }, [workspaceId])

  if (candidates.length === 0) {
    return (
      <p className="py-6 text-center text-sm" style={{ color: INK_MUTED }}>
        No saved inspo links to import. Bank a link from the Posts page first.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {candidates.map((post) => {
        const url = (post.sourceUrl ?? post.notes).trim()
        return (
          <label
            key={post.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl p-3"
            style={{ backgroundColor: CARD_BG }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(post.id)}
              onChange={() => onToggle(post.id)}
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium" style={{ color: INK }}>
                {post.title || url}
              </span>
              <span className="block truncate text-xs" style={{ color: INK_MUTED }}>
                {post.platform} · {url}
              </span>
            </span>
          </label>
        )
      })}
    </div>
  )
}

export default function VaultItemFormModal({ open, onClose, onSave, onImportInspo, item, workspaceId }) {
  const [tab, setTab] = useState(item ? (item.type === 'candc' ? 'candc' : 'template') : 'template')
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...item,
    format: item?.format ?? '',
    pillar: item?.pillar ?? '',
    audience: item?.audience ?? '',
    candcName: item?.candcName ?? '',
    images: item?.images ?? [],
    platforms: item?.platforms ?? [],
  }))
  const [selectedInspoIds, setSelectedInspoIds] = useState([])

  const isEditing = Boolean(item)
  const tabs = isEditing
    ? []
    : [
        { id: 'template', label: 'New Template' },
        { id: 'inspo', label: 'From Inspo' },
        { id: 'candc', label: 'C&C Reference' },
      ]

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (tab === 'inspo') {
      onImportInspo(selectedInspoIds)
      return
    }
    onSave({
      ...form,
      id: item?.id,
      type: item?.type ?? (tab === 'candc' ? 'candc' : 'template'),
      format: form.format || null,
      pillar: form.pillar || null,
      audience: form.audience || null,
      candcName: form.candcName || null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Vault Item' : 'Add to Vault'}>
      {tabs.length > 0 && (
        <div className="mb-4 flex rounded-full p-1" style={{ backgroundColor: CARD_BG }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition"
              style={{
                backgroundColor: tab === t.id ? ACCENT_SOLID_BG : 'transparent',
                color: tab === t.id ? ACCENT_SOLID_TEXT : INK_MUTED,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {tab === 'inspo' ? (
          <FromInspoTab
            workspaceId={workspaceId}
            selectedIds={selectedInspoIds}
            onToggle={(id) =>
              setSelectedInspoIds((ids) =>
                ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
              )
            }
          />
        ) : (
          <TemplateTab form={form} update={update} isCandc={tab === 'candc'} />
        )}

        <div className="mt-2 flex justify-end gap-2">
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
            disabled={tab === 'inspo' && selectedInspoIds.length === 0}
            className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
          >
            {tab === 'inspo' ? `Add Selected (${selectedInspoIds.length})` : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
