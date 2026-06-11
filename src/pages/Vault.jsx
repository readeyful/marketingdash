import { useEffect, useMemo, useState } from 'react'
import { DndContext, useDroppable } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight, Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import VaultCard from '../components/VaultCard'
import VaultDetailPanel from '../components/VaultDetailPanel'
import VaultItemFormModal from '../components/VaultItemFormModal'
import { useWorkspace } from '../context/workspace-context'
import { AUDIENCES, CONTENT_PILLARS, POST_TYPES, VAULT_SORTS } from '../lib/constants'
import {
  deleteVaultItem,
  duplicateVaultItem,
  getPost,
  getVaultItems,
  inspoPostToVaultItem,
  isVaultItemNew,
  saveVaultItem,
  scheduleVaultItem,
} from '../lib/storage'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  PAGE_BG,
} from '../lib/theme'

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function FilterSelect({ value, options, allLabel, onChange }) {
  return (
    <select
      className="rounded-full border border-(--border-strong) bg-(--surface-page) px-3 py-1.5 text-xs font-medium text-(--text-ink) focus:outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

function QuickPill({ label, active, count, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition"
      style={{
        backgroundColor: active ? ACCENT_SOLID_BG : CARD_BG,
        color: active ? ACCENT_SOLID_TEXT : INK_MUTED,
      }}
    >
      {Icon && <Icon size={12} fill={active ? 'currentColor' : 'none'} />}
      {label}
      {count > 0 && (
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: '#E0524A' }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// Compact droppable day cell for the mini calendar drag target.
function MiniDay({ day, isCurrentMonth }) {
  const dateString = toDateString(day)
  const { isOver, setNodeRef } = useDroppable({ id: `day-${dateString}` })

  return (
    <div
      ref={setNodeRef}
      className="flex h-8 items-center justify-center rounded-lg text-xs transition"
      style={{
        color: isCurrentMonth ? INK : INK_MUTED,
        opacity: isCurrentMonth ? 1 : 0.4,
        backgroundColor: isOver ? ACCENT_SOLID_BG : 'transparent',
        ...(isOver ? { color: ACCENT_SOLID_TEXT } : {}),
      }}
    >
      {day.getDate()}
    </div>
  )
}

function MiniCalendar({ referenceDate, onNavigate }) {
  const days = useMemo(() => {
    const first = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
    const start = new Date(first)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [referenceDate])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl border border-(--border-soft) p-4 shadow-2xl"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => onNavigate(-1)}
          className="rounded-full p-1 transition hover:bg-(--border-soft)"
          style={{ color: INK_MUTED }}
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold" style={{ color: INK }}>
          {referenceDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => onNavigate(1)}
          className="rounded-full p-1 transition hover:bg-(--border-soft)"
          style={{ color: INK_MUTED }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium" style={{ color: INK_MUTED }}>
            {d}
          </div>
        ))}
        {days.map((day) => (
          <MiniDay
            key={toDateString(day)}
            day={day}
            isCurrentMonth={day.getMonth() === referenceDate.getMonth()}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[11px]" style={{ color: INK_MUTED }}>
        Drop on a day to schedule
      </p>
    </div>
  )
}

function VaultView({ workspaceId }) {
  const [items, setItems] = useState(() => getVaultItems(workspaceId))
  const [formatFilter, setFormatFilter] = useState('')
  const [pillarFilter, setPillarFilter] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('')
  const [newOnly, setNewOnly] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [includeScheduled, setIncludeScheduled] = useState(true)
  const [sort, setSort] = useState('Newest')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [miniCalDate, setMiniCalDate] = useState(() => new Date())
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const selectedItem = items.find((v) => v.id === selectedItemId) ?? null

  // Keep the last-shown item around so the panel can slide out after closing.
  const [lastPanelItem, setLastPanelItem] = useState(null)
  if (selectedItem && selectedItem !== lastPanelItem) {
    setLastPanelItem(selectedItem)
  }
  const panelItem = selectedItem ?? lastPanelItem

  const newCount = useMemo(() => items.filter(isVaultItemNew).length, [items])

  const filtered = useMemo(() => {
    let result = items
      .filter((v) => !formatFilter || v.format === formatFilter)
      .filter((v) => !pillarFilter || v.pillar === pillarFilter)
      .filter((v) => !audienceFilter || v.audience === audienceFilter)
      .filter((v) => !newOnly || isVaultItemNew(v))
      .filter((v) => !favoritesOnly || v.isFavorited)
      .filter((v) => includeScheduled || (v.scheduledPostIds ?? []).length === 0)

    const byTitle = (a, b) => (a.title || '').localeCompare(b.title || '')
    const byCreated = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    if (sort === 'Newest') result = [...result].sort(byCreated)
    if (sort === 'Oldest') result = [...result].sort((a, b) => byCreated(b, a))
    if (sort === 'A–Z') result = [...result].sort(byTitle)
    if (sort === 'Most Used')
      result = [...result].sort(
        (a, b) => (b.scheduledPostIds?.length ?? 0) - (a.scheduledPostIds?.length ?? 0),
      )
    return result
  }, [items, formatFilter, pillarFilter, audienceFilter, newOnly, favoritesOnly, includeScheduled, sort])

  const filtersActive =
    formatFilter || pillarFilter || audienceFilter || newOnly || favoritesOnly

  function refresh(updatedAll) {
    setItems(updatedAll.filter((v) => v.workspaceId === workspaceId))
  }

  function handleSave(itemData) {
    refresh(saveVaultItem({ ...itemData, workspaceId }))
    setModalOpen(false)
    setEditingItem(null)
  }

  function handleImportInspo(postIds) {
    let all
    for (const postId of postIds) {
      const post = getPost(postId)
      if (post) all = saveVaultItem(inspoPostToVaultItem(post, workspaceId))
    }
    if (all) refresh(all)
    setModalOpen(false)
  }

  function handleUpdateSelected(updates) {
    if (!selectedItem) return
    refresh(saveVaultItem({ id: selectedItem.id, ...updates }))
  }

  function handleDelete(itemId) {
    refresh(deleteVaultItem(itemId))
    if (itemId === selectedItemId) setSelectedItemId(null)
  }

  function handleSchedule(itemId, date) {
    const post = scheduleVaultItem(itemId, date)
    refresh(getVaultItems())
    if (post) {
      setToast({ date })
    }
  }

  function handleDragEnd(event) {
    setDragging(false)
    const overId = event.over?.id
    if (typeof overId === 'string' && overId.startsWith('day-')) {
      handleSchedule(event.active.id, overId.slice(4))
    }
  }

  function clearFilters() {
    setFormatFilter('')
    setPillarFilter('')
    setAudienceFilter('')
    setNewOnly(false)
    setFavoritesOnly(false)
  }

  return (
    <DndContext onDragStart={() => setDragging(true)} onDragEnd={handleDragEnd} onDragCancel={() => setDragging(false)}>
      <div className="relative">
        <div className="min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-4xl" style={{ color: INK }}>
                Vault
              </h1>
              <p className="mt-2 max-w-xl text-sm" style={{ color: INK_MUTED }}>
                Your content library — everything you're building toward, before
                it hits the calendar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          {/* Filter bar */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <FilterSelect
              value={formatFilter}
              options={POST_TYPES}
              allLabel="All Formats"
              onChange={setFormatFilter}
            />
            <FilterSelect
              value={pillarFilter}
              options={CONTENT_PILLARS}
              allLabel="All Pillars"
              onChange={setPillarFilter}
            />
            <FilterSelect
              value={audienceFilter}
              options={AUDIENCES}
              allLabel="All Audiences"
              onChange={setAudienceFilter}
            />
            <span className="mx-1 h-5 w-px bg-(--border-strong)" />
            <QuickPill
              label="New"
              active={newOnly}
              count={newCount}
              onClick={() => setNewOnly((v) => !v)}
            />
            <QuickPill
              label="Favorites"
              icon={Heart}
              active={favoritesOnly}
              onClick={() => setFavoritesOnly((v) => !v)}
            />

            <div className="ml-auto">
              <select
                className="rounded-full border border-(--border-strong) bg-(--surface-page) px-3 py-1.5 text-xs font-medium text-(--text-ink) focus:outline-none"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {VAULT_SORTS.map((s) => (
                  <option key={s} value={s}>
                    Sort By: {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count + include scheduled */}
          <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: INK_MUTED }}>
            <span>
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </span>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={includeScheduled}
                onChange={(e) => setIncludeScheduled(e.target.checked)}
              />
              Include scheduled
            </label>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-4 text-center">
              <p className="max-w-sm text-sm" style={{ color: INK_MUTED }}>
                {items.length === 0
                  ? 'Your vault is empty. Add a template, import from Inspo, or log a C&C reference to get started.'
                  : favoritesOnly && !filtersActiveExceptFavorites(formatFilter, pillarFilter, audienceFilter, newOnly)
                    ? "You haven't favorited anything yet. Heart a card to save it here."
                    : 'No items match your filters.'}
              </p>
              {items.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
                  style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
                >
                  <Plus size={16} />
                  Add Item
                </button>
              ) : (
                filtersActive && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium underline"
                    style={{ color: INK }}
                  >
                    Clear filters
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((item) => (
                <VaultCard
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedItemId}
                  onClick={(v) => setSelectedItemId(v.id)}
                  onToggleFavorite={(v) =>
                    refresh(saveVaultItem({ id: v.id, isFavorited: !v.isFavorited }))
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Backdrop */}
        <div
          className="fixed inset-0 z-30 hidden bg-black/20 transition-opacity duration-200 ease-out lg:block"
          style={{
            opacity: selectedItem ? 1 : 0,
            pointerEvents: selectedItem ? 'auto' : 'none',
          }}
          onClick={() => setSelectedItemId(null)}
          aria-hidden={!selectedItem}
        />

        {/* Detail panel — overlay from the right, same as Calendar */}
        {panelItem && (
          <aside
            className="fixed right-0 top-0 z-40 hidden h-full w-[42%] max-w-xl overflow-hidden border-l border-(--border-soft) shadow-xl transition-transform duration-200 ease-out lg:block"
            style={{
              backgroundColor: PAGE_BG,
              transform: selectedItem ? 'translateX(0)' : 'translateX(100%)',
              pointerEvents: selectedItem ? 'auto' : 'none',
            }}
            aria-hidden={!selectedItem}
          >
            <VaultDetailPanel
              key={panelItem.id}
              item={panelItem}
              onClose={() => setSelectedItemId(null)}
              onUpdate={handleUpdateSelected}
              onEdit={(v) => {
                setEditingItem(v)
                setModalOpen(true)
              }}
              onDuplicate={(id) => refresh(duplicateVaultItem(id))}
              onDelete={handleDelete}
              onSchedule={handleSchedule}
            />
          </aside>
        )}

        {/* Mobile detail bottom sheet */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSelectedItemId(null)}
          >
            <div
              className="absolute inset-x-0 bottom-0 h-[75vh] overflow-hidden rounded-t-2xl"
              style={{ backgroundColor: PAGE_BG, animation: 'slide-in-up 0.2s ease-out' }}
              onClick={(e) => e.stopPropagation()}
            >
              <VaultDetailPanel
                key={selectedItem.id}
                item={selectedItem}
                onClose={() => setSelectedItemId(null)}
                onUpdate={handleUpdateSelected}
                onEdit={(v) => {
                  setEditingItem(v)
                  setModalOpen(true)
                }}
                onDuplicate={(id) => refresh(duplicateVaultItem(id))}
                onDelete={handleDelete}
                onSchedule={handleSchedule}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mini calendar drop target while dragging */}
      {dragging && (
        <MiniCalendar
          referenceDate={miniCalDate}
          onNavigate={(step) =>
            setMiniCalDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + step, 1))
          }
        />
      )}

      {/* Schedule toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg"
          style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
        >
          Scheduled for {toast.date}
          <Link to="/calendar" className="underline">
            View →
          </Link>
        </div>
      )}

      {modalOpen && (
        <VaultItemFormModal
          key={editingItem?.id ?? 'new'}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingItem(null)
          }}
          onSave={handleSave}
          onImportInspo={handleImportInspo}
          item={editingItem}
          workspaceId={workspaceId}
        />
      )}
    </DndContext>
  )
}

function filtersActiveExceptFavorites(format, pillar, audience, newOnly) {
  return Boolean(format || pillar || audience || newOnly)
}

export default function Vault() {
  const { activeWorkspace } = useWorkspace()

  return (
    <div>
      {activeWorkspace && (
        <VaultView key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
      )}
    </div>
  )
}
