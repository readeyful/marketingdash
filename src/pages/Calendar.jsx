import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PostDetailPanel from '../components/PostDetailPanel'
import PostFormModal from '../components/PostFormModal'
import { useWorkspace } from '../context/workspace-context'
import {
  PLATFORM_DOT_COLORS,
  PLATFORM_ICONS,
  PLATFORMS,
  POST_STATUSES,
  STATUS_COLORS,
} from '../lib/constants'
import { deletePost, getPosts, savePost } from '../lib/storage'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  PAGE_BG,
} from '../lib/theme'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_VISIBLE_POSTS = 3
const VIEW_OPTIONS = [
  { id: 'month', label: 'Month' },
  { id: 'twoWeek', label: '2 Weeks' },
  { id: 'week', label: 'Week' },
]

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfWeek(date) {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)
  return start
}

function getMonthGridDays(referenceDate) {
  const firstOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
  const gridStart = startOfWeek(firstOfMonth)
  const days = []
  for (let i = 0; i < 42; i++) {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + i)
    days.push(day)
  }
  return days
}

function getWeekDays(referenceDate) {
  const weekStart = startOfWeek(referenceDate)
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    days.push(day)
  }
  return days
}

function getTwoWeekDays(referenceDate) {
  const weekStart = startOfWeek(referenceDate)
  const days = []
  for (let i = 0; i < 14; i++) {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    days.push(day)
  }
  return days
}

function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full p-1" style={{ backgroundColor: CARD_BG }}>
      {['All', ...options].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="rounded-full px-3 py-1.5 text-xs font-medium transition"
          style={{
            backgroundColor: value === option ? ACCENT_SOLID_BG : 'transparent',
            color: value === option ? ACCENT_SOLID_TEXT : INK_MUTED,
          }}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function PostThumb({ post, isSelected, onClick, tall }) {
  const Icon = PLATFORM_ICONS[post.platform]
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick(post)
      }}
      className="relative w-full cursor-pointer overflow-hidden rounded-lg text-left transition duration-100 hover:scale-[1.02] hover:shadow-md"
      style={{
        backgroundColor: PAGE_BG,
        outline: isSelected ? `2px solid ${STATUS_COLORS[post.status]}` : 'none',
      }}
    >
      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt=""
          className={`w-full object-cover ${tall ? 'h-24' : 'h-12'}`}
        />
      ) : (
        <div
          className={`flex w-full items-center justify-center ${tall ? 'h-24' : 'h-12'}`}
          style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
        >
          <Icon size={tall ? 22 : 16} />
        </div>
      )}
      {/* Status dot — top right */}
      <span
        className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white/70"
        style={{ backgroundColor: STATUS_COLORS[post.status] }}
      />
      <div className="flex items-center justify-between gap-1 px-1.5 py-1">
        <span className="truncate text-[11px] font-medium" style={{ color: INK }}>
          {post.title || 'Untitled'}
        </span>
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: PLATFORM_DOT_COLORS[post.platform] }}
        />
      </div>
    </button>
  )
}

function DayCell({
  day,
  isCurrentMonth,
  isToday,
  posts,
  selectedPostId,
  onSelectDay,
  onSelectPost,
  compact,
}) {
  const overflowing = compact && posts.length > MAX_VISIBLE_POSTS
  const visiblePosts = overflowing ? posts.slice(0, 2) : posts
  const overflow = posts.length - visiblePosts.length

  return (
    <button
      type="button"
      onClick={() => onSelectDay(day)}
      className="flex min-h-[6rem] flex-col items-stretch gap-1 rounded-xl p-1.5 text-left transition hover:bg-(--border-soft) sm:min-h-[8rem]"
      style={{
        backgroundColor: isCurrentMonth ? PAGE_BG : CARD_BG,
        opacity: isCurrentMonth ? 1 : 0.5,
      }}
    >
      <span
        className="text-xs font-medium"
        style={{
          color: isToday ? ACCENT_SOLID_TEXT : INK_MUTED,
          backgroundColor: isToday ? ACCENT_SOLID_BG : 'transparent',
          borderRadius: '999px',
          width: '1.5rem',
          height: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {day.getDate()}
      </span>

      <div className="flex flex-col gap-1">
        {visiblePosts.map((post) => (
          <PostThumb
            key={post.id}
            post={post}
            tall={!compact}
            isSelected={post.id === selectedPostId}
            onClick={onSelectPost}
          />
        ))}
        {overflow > 0 && (
          <span
            className="rounded-full px-1.5 py-0.5 text-center text-[11px] font-medium"
            style={{ backgroundColor: CARD_BG, color: INK_MUTED }}
          >
            +{overflow} more
          </span>
        )}
      </div>
    </button>
  )
}

function CalendarView({ workspaceId }) {
  const [posts, setPosts] = useState(() => getPosts(workspaceId))
  const [referenceDate, setReferenceDate] = useState(() => new Date())
  const [view, setView] = useState('month')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [defaultDate, setDefaultDate] = useState(null)
  const [selectedPostId, setSelectedPostId] = useState(null)

  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId) ?? null,
    [posts, selectedPostId],
  )

  // Keep the last-shown post around so the panel content stays visible
  // while it slides out after closing.
  const [lastPanelPost, setLastPanelPost] = useState(null)
  if (selectedPost && selectedPost !== lastPanelPost) {
    setLastPanelPost(selectedPost)
  }
  const panelPost = selectedPost ?? lastPanelPost

  const filtersActive = platformFilter !== 'All' || statusFilter !== 'All'

  const filteredPosts = useMemo(
    () =>
      posts
        .filter((p) => platformFilter === 'All' || p.platform === platformFilter)
        .filter((p) => statusFilter === 'All' || p.status === statusFilter),
    [posts, platformFilter, statusFilter],
  )

  const postsByDate = useMemo(() => {
    const map = {}
    for (const post of filteredPosts) {
      if (!post.scheduledDate) continue
      if (!map[post.scheduledDate]) map[post.scheduledDate] = []
      map[post.scheduledDate].push(post)
    }
    return map
  }, [filteredPosts])

  const days = useMemo(() => {
    if (view === 'month') return getMonthGridDays(referenceDate)
    if (view === 'twoWeek') return getTwoWeekDays(referenceDate)
    return getWeekDays(referenceDate)
  }, [view, referenceDate])

  const visiblePostCount = useMemo(() => {
    const dayStrings = new Set(days.map(toDateString))
    return filteredPosts.filter(
      (p) => p.scheduledDate && dayStrings.has(p.scheduledDate),
    ).length
  }, [days, filteredPosts])

  const todayString = toDateString(new Date())

  function navigate(step) {
    setReferenceDate((prev) => {
      const next = new Date(prev)
      if (view === 'month') {
        next.setMonth(next.getMonth() + step)
      } else if (view === 'twoWeek') {
        next.setDate(next.getDate() + step * 14)
      } else {
        next.setDate(next.getDate() + step * 7)
      }
      return next
    })
  }

  function refresh(updatedAll) {
    setPosts(updatedAll.filter((p) => p.workspaceId === workspaceId))
  }

  function openNewPost(day) {
    setEditingPost(null)
    setDefaultDate(toDateString(day))
    setModalOpen(true)
  }

  function openEditPost(post) {
    setEditingPost(post)
    setDefaultDate(null)
    setModalOpen(true)
  }

  function handleSave(postData) {
    refresh(
      savePost({
        ...postData,
        id: editingPost?.id,
        workspaceId,
      }),
    )
    setModalOpen(false)
  }

  function handleUpdateSelected(updates) {
    if (!selectedPost) return
    refresh(savePost({ ...selectedPost, ...updates }))
  }

  function handleDelete(postId) {
    refresh(deletePost(postId))
    setModalOpen(false)
    if (postId === selectedPostId) setSelectedPostId(null)
  }

  const heading =
    view === 'month'
      ? referenceDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : (() => {
          const start = days[0]
          const end = days[days.length - 1]
          const sameMonth = start.getMonth() === end.getMonth()
          const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          const endLabel = end.toLocaleDateString(undefined, {
            month: sameMonth ? undefined : 'short',
            day: 'numeric',
            year: 'numeric',
          })
          return `${startLabel} – ${endLabel}`
        })()

  const calendarGrid = (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Previous"
            className="rounded-full p-2 transition hover:bg-(--border-soft)"
            style={{ color: INK_MUTED }}
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="min-w-[10rem] text-center font-display text-xl" style={{ color: INK }}>
            {heading}
          </h2>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Next"
            className="rounded-full p-2 transition hover:bg-(--border-soft)"
            style={{ color: INK_MUTED }}
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={() => setReferenceDate(new Date())}
            className="ml-1 rounded-full px-3 py-1.5 text-xs font-medium transition hover:bg-(--border-soft)"
            style={{ color: INK_MUTED, backgroundColor: CARD_BG }}
          >
            Today
          </button>
        </div>

        <div className="flex rounded-full p-1" style={{ backgroundColor: CARD_BG }}>
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition"
              style={{
                backgroundColor: view === option.id ? ACCENT_SOLID_BG : 'transparent',
                color: view === option.id ? ACCENT_SOLID_TEXT : INK_MUTED,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FilterPills options={PLATFORMS} value={platformFilter} onChange={setPlatformFilter} />
        <FilterPills options={POST_STATUSES} value={statusFilter} onChange={setStatusFilter} />
      </div>

      <div
        className="relative mt-4 grid grid-cols-7 gap-1 rounded-2xl p-2 sm:gap-2 sm:p-3"
        style={{ backgroundColor: CARD_BG }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-1 text-center text-xs font-medium uppercase"
            style={{ color: INK_MUTED }}
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const dateString = toDateString(day)
          return (
            <DayCell
              key={dateString}
              day={day}
              isCurrentMonth={view !== 'month' || day.getMonth() === referenceDate.getMonth()}
              isToday={dateString === todayString}
              posts={postsByDate[dateString] ?? []}
              selectedPostId={selectedPostId}
              onSelectDay={openNewPost}
              onSelectPost={(post) => setSelectedPostId(post.id)}
              compact={view !== 'week'}
            />
          )
        })}

        {visiblePostCount === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p
              className="rounded-full px-4 py-2 text-sm"
              style={{ backgroundColor: PAGE_BG, color: INK_MUTED }}
            >
              {filtersActive ? (
                <>
                  No posts match your filters.{' '}
                  <button
                    type="button"
                    className="pointer-events-auto font-medium underline"
                    style={{ color: INK }}
                    onClick={() => {
                      setPlatformFilter('All')
                      setStatusFilter('All')
                    }}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                `Nothing scheduled this ${
                  view === 'month' ? 'month' : view === 'twoWeek' ? 'period' : 'week'
                }. Click any day to add a post.`
              )}
            </p>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      <div className="relative">
        <div className="min-w-0">{calendarGrid}</div>

        {/* Backdrop — dims the calendar behind the overlay panel */}
        <div
          className="fixed inset-0 z-30 hidden bg-black/20 transition-opacity duration-200 ease-out lg:block"
          style={{
            opacity: selectedPost ? 1 : 0,
            pointerEvents: selectedPost ? 'auto' : 'none',
          }}
          onClick={() => setSelectedPostId(null)}
          aria-hidden={!selectedPost}
        />

        {/* Desktop detail panel — overlays on top of the calendar from the
            right edge of the viewport, transitioning at 200ms ease-out. */}
        {panelPost && (
          <aside
            className="fixed right-0 top-0 z-40 hidden h-full w-[42%] max-w-xl overflow-hidden border-l border-(--border-soft) shadow-xl transition-transform duration-200 ease-out lg:block"
            style={{
              backgroundColor: PAGE_BG,
              transform: selectedPost ? 'translateX(0)' : 'translateX(100%)',
              pointerEvents: selectedPost ? 'auto' : 'none',
            }}
            aria-hidden={!selectedPost}
          >
            <PostDetailPanel
              key={panelPost.id}
              post={panelPost}
              onClose={() => setSelectedPostId(null)}
              onUpdate={handleUpdateSelected}
              onEdit={openEditPost}
              onDelete={handleDelete}
            />
          </aside>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSelectedPostId(null)}
        >
          <div
            className="absolute inset-x-0 bottom-0 h-[75vh] overflow-hidden rounded-t-2xl"
            style={{ backgroundColor: PAGE_BG, animation: 'slide-in-up 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <PostDetailPanel
              key={selectedPost.id}
              post={selectedPost}
              onClose={() => setSelectedPostId(null)}
              onUpdate={handleUpdateSelected}
              onEdit={openEditPost}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      <PostFormModal
        key={`${editingPost?.id ?? 'new'}-${defaultDate ?? ''}`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        post={editingPost}
        defaultDate={defaultDate}
        defaultStatus="Scheduled"
      />
    </>
  )
}

export default function Calendar() {
  const { activeWorkspace } = useWorkspace()

  return (
    <div>
      <h1 className="font-display text-4xl" style={{ color: INK }}>
        Calendar
      </h1>
      <p className="mt-2 max-w-xl text-sm" style={{ color: INK_MUTED }}>
        See what&apos;s posting when, across all platforms.
      </p>

      {activeWorkspace && (
        <CalendarView key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
      )}
    </div>
  )
}
