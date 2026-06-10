import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PostFormModal from '../components/PostFormModal'
import { useWorkspace } from '../context/workspace-context'
import { PLATFORM_ICONS, PLATFORMS, POST_STATUSES, STATUS_COLORS } from '../lib/constants'
import { deletePost, getPosts, savePost } from '../lib/storage'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  INPUT_CLASS,
  PAGE_BG,
} from '../lib/theme'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_VISIBLE_POSTS = 3

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

function PostChip({ post, onClick }) {
  const Icon = PLATFORM_ICONS[post.platform]
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick(post)
      }}
      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs transition hover:bg-(--border-soft)"
      style={{ color: INK }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: STATUS_COLORS[post.status] }}
      />
      <Icon size={12} className="shrink-0" style={{ color: INK_MUTED }} />
      <span className="truncate">{post.title || 'Untitled post'}</span>
    </button>
  )
}

function DayCell({ day, isCurrentMonth, isToday, posts, onSelectDay, onSelectPost, compact }) {
  const visiblePosts = compact ? posts.slice(0, MAX_VISIBLE_POSTS) : posts
  const overflow = compact ? posts.length - visiblePosts.length : 0

  return (
    <button
      type="button"
      onClick={() => onSelectDay(day)}
      className="flex min-h-[6rem] flex-col items-stretch gap-1 rounded-xl p-2 text-left transition hover:bg-(--border-soft) sm:min-h-[8rem]"
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

      <div className="flex flex-col gap-0.5">
        {visiblePosts.map((post) => (
          <PostChip key={post.id} post={post} onClick={onSelectPost} />
        ))}
        {overflow > 0 && (
          <span className="px-1.5 text-xs" style={{ color: INK_MUTED }}>
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

  const days = useMemo(
    () => (view === 'month' ? getMonthGridDays(referenceDate) : getWeekDays(referenceDate)),
    [view, referenceDate],
  )

  const todayString = toDateString(new Date())

  function navigate(step) {
    setReferenceDate((prev) => {
      const next = new Date(prev)
      if (view === 'month') {
        next.setMonth(next.getMonth() + step)
      } else {
        next.setDate(next.getDate() + step * 7)
      }
      return next
    })
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
    const updated = savePost({
      ...postData,
      id: editingPost?.id,
      workspaceId,
    })
    setPosts(updated.filter((p) => p.workspaceId === workspaceId))
    setModalOpen(false)
  }

  function handleDelete(postId) {
    setPosts(deletePost(postId).filter((p) => p.workspaceId === workspaceId))
    setModalOpen(false)
  }

  const heading =
    view === 'month'
      ? referenceDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : (() => {
          const week = getWeekDays(referenceDate)
          const start = week[0]
          const end = week[6]
          const sameMonth = start.getMonth() === end.getMonth()
          const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          const endLabel = end.toLocaleDateString(undefined, {
            month: sameMonth ? undefined : 'short',
            day: 'numeric',
            year: 'numeric',
          })
          return `${startLabel} – ${endLabel}`
        })()

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
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

        <div className="flex flex-wrap items-center gap-3">
          <select
            className={`${INPUT_CLASS} w-auto`}
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="All">All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            className={`${INPUT_CLASS} w-auto`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All statuses</option>
            {POST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="flex rounded-full p-1" style={{ backgroundColor: CARD_BG }}>
            {['month', 'week'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition"
                style={{
                  backgroundColor: view === option ? ACCENT_SOLID_BG : 'transparent',
                  color: view === option ? ACCENT_SOLID_TEXT : INK_MUTED,
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-6 grid grid-cols-7 gap-1 rounded-2xl p-2 sm:gap-2 sm:p-3"
        style={{ backgroundColor: CARD_BG }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-1 text-center text-xs font-medium"
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
              isCurrentMonth={view === 'week' || day.getMonth() === referenceDate.getMonth()}
              isToday={dateString === todayString}
              posts={postsByDate[dateString] ?? []}
              onSelectDay={openNewPost}
              onSelectPost={openEditPost}
              compact={view === 'month'}
            />
          )
        })}
      </div>

      <PostFormModal
        key={`${editingPost?.id ?? 'new'}-${defaultDate ?? ''}`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        post={editingPost}
        defaultDate={defaultDate}
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
