import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Check, ChevronLeft, ChevronRight, GripVertical, Heart, Image } from 'lucide-react'
import { VAULT_TYPES } from '../lib/constants'
import { ACCENT_SOLID_BG, ACCENT_SOLID_TEXT, CARD_BG, INK, INK_MUTED, PAGE_BG } from '../lib/theme'

export default function VaultCard({ item, isSelected, onClick, onToggleFavorite }) {
  const [slide, setSlide] = useState(0)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const images = item.images ?? []
  const hasCarousel = images.length > 1
  const typeInfo = VAULT_TYPES[item.type] ?? VAULT_TYPES.template
  const isScheduled = (item.scheduledPostIds ?? []).length > 0

  return (
    <div
      ref={setNodeRef}
      className="group relative cursor-pointer rounded-2xl border border-(--border-soft) transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        backgroundColor: PAGE_BG,
        outline: isSelected ? `2px solid ${ACCENT_SOLID_BG}` : 'none',
        opacity: isDragging ? 0.85 : 1,
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px) rotate(3deg)`
          : undefined,
        zIndex: isDragging ? 50 : undefined,
      }}
      onClick={() => onClick(item)}
    >
      {/* Image area — fixed 4:5 */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
        {images.length > 0 ? (
          images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-150"
              style={{ opacity: i === slide ? 1 : 0 }}
            />
          ))
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2"
            style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
          >
            <Image size={28} />
            <span className="text-xs font-medium uppercase tracking-wide">
              {item.format ?? 'No image'}
            </span>
          </div>
        )}

        {/* Drag handle — top left, on hover */}
        <button
          type="button"
          aria-label="Drag to schedule"
          className="absolute left-2 top-2 cursor-grab rounded-lg p-1.5 opacity-0 shadow transition group-hover:opacity-100 active:cursor-grabbing"
          style={{ backgroundColor: PAGE_BG, color: INK_MUTED }}
          onClick={(e) => e.stopPropagation()}
          {...listeners}
          {...attributes}
        >
          <GripVertical size={14} />
        </button>

        {/* Favorite — top right, on hover (always visible when favorited) */}
        <button
          type="button"
          aria-label="Favorite"
          className={`absolute right-2 top-2 rounded-lg p-1.5 shadow transition ${
            item.isFavorited ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            backgroundColor: PAGE_BG,
            color: item.isFavorited ? '#E0524A' : INK_MUTED,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(item)
          }}
        >
          <Heart size={14} fill={item.isFavorited ? 'currentColor' : 'none'} />
        </button>

        {/* Scheduled badge — bottom left */}
        {isScheduled && (
          <span
            className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: '#22C55E' }}
          >
            <Check size={10} strokeWidth={3} />
            Scheduled
          </span>
        )}

        {/* Carousel nav — on hover */}
        {hasCarousel && (
          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              aria-label="Previous image"
              className="rounded-full p-1 shadow"
              style={{ backgroundColor: PAGE_BG, color: INK }}
              onClick={(e) => {
                e.stopPropagation()
                setSlide((s) => (s - 1 + images.length) % images.length)
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium shadow"
              style={{ backgroundColor: PAGE_BG, color: INK }}
            >
              {slide + 1} / {images.length}
            </span>
            <button
              type="button"
              aria-label="Next image"
              className="rounded-full p-1 shadow"
              style={{ backgroundColor: PAGE_BG, color: INK }}
              onClick={(e) => {
                e.stopPropagation()
                setSlide((s) => (s + 1) % images.length)
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium" style={{ color: INK }}>
          {item.title || 'Untitled'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.format && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
            >
              {item.format}
            </span>
          )}
          {item.pillar && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
            >
              {item.pillar}
            </span>
          )}
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white"
            style={{ backgroundColor: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
        </div>
      </div>
    </div>
  )
}
