import { useMemo, useState } from 'react'
import { Link2, Plus, Search } from 'lucide-react'
import PostFormModal from '../components/PostFormModal'
import StatCard from '../components/StatCard'
import { useWorkspace } from '../context/workspace-context'
import {
  PLATFORM_ICONS,
  PLATFORMS,
  POST_STATUSES,
  STATUS_COLORS,
  detectPlatformFromUrl,
} from '../lib/constants'
import { deletePost, getPosts, savePost } from '../lib/storage'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  INPUT_CLASS,
  STAT_ACCENTS,
} from '../lib/theme'

function formatDate(dateString) {
  if (!dateString) return '—'
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StatusPill({ status }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: CARD_BG, color: INK }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: STATUS_COLORS[status] }}
      />
      {status}
    </span>
  )
}

function PostsList({ workspaceId }) {
  const [posts, setPosts] = useState(() => getPosts(workspaceId))
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [editingPost, setEditingPost] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [ideaLink, setIdeaLink] = useState('')

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return posts
      .filter((p) => platformFilter === 'All' || p.platform === platformFilter)
      .filter((p) => statusFilter === 'All' || p.status === statusFilter)
      .filter(
        (p) =>
          !query ||
          p.title.toLowerCase().includes(query) ||
          p.caption.toLowerCase().includes(query),
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [posts, search, platformFilter, statusFilter])

  const stats = useMemo(
    () => [
      { label: 'Total Posts', value: posts.length },
      {
        label: 'Scheduled',
        value: posts.filter((p) => p.status === 'Scheduled').length,
      },
      {
        label: 'Drafts',
        value: posts.filter((p) => p.status === 'Draft').length,
      },
      {
        label: 'Posted',
        value: posts.filter((p) => p.status === 'Posted').length,
      },
    ],
    [posts],
  )

  function openNewPost() {
    setEditingPost(null)
    setModalOpen(true)
  }

  function openEditPost(post) {
    setEditingPost(post)
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

  function handleBankIdea(e) {
    e.preventDefault()
    const url = ideaLink.trim()
    if (!url) return

    const updated = savePost({
      workspaceId,
      title: '',
      platform: detectPlatformFromUrl(url),
      status: 'Idea',
      notes: url,
    })
    setPosts(updated.filter((p) => p.workspaceId === workspaceId))
    setIdeaLink('')
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            accentColor={STAT_ACCENTS[i % STAT_ACCENTS.length]}
          />
        ))}
      </div>

      <form
        onSubmit={handleBankIdea}
        className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl p-4"
        style={{ backgroundColor: CARD_BG }}
      >
        <Link2 size={18} style={{ color: INK_MUTED }} className="shrink-0" />
        <input
          type="url"
          placeholder="Paste a link from Instagram (or anywhere) to bank it as an idea..."
          value={ideaLink}
          onChange={(e) => setIdeaLink(e.target.value)}
          className={`${INPUT_CLASS} flex-1 min-w-[200px]`}
        />
        <button
          type="submit"
          disabled={!ideaLink.trim()}
          className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
        >
          Save idea
        </button>
      </form>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: INK_MUTED }}
          />
          <input
            type="text"
            placeholder="Search title or caption..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT_CLASS} pl-9`}
          />
        </div>

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

        <button
          type="button"
          onClick={openNewPost}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
          style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
        >
          <Plus size={16} />
          Add Post
        </button>
      </div>

      <div
        className="mt-6 overflow-hidden rounded-2xl"
        style={{ backgroundColor: CARD_BG }}
      >
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-2xl" style={{ color: INK }}>
              No posts yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: INK_MUTED }}>
              {posts.length === 0
                ? 'Add your first post to start building your library.'
                : 'No posts match your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: INK_MUTED }}>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Scheduled</th>
                  <th className="px-5 py-3 font-medium">Last edited</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => {
                  const Icon = PLATFORM_ICONS[post.platform]
                  return (
                    <tr
                      key={post.id}
                      onClick={() => openEditPost(post)}
                      className="cursor-pointer border-t border-(--border-soft) transition hover:bg-(--border-soft)"
                    >
                      <td className="px-5 py-3 font-medium" style={{ color: INK }}>
                        {post.title || 'Untitled post'}
                      </td>
                      <td className="px-5 py-3" style={{ color: INK_MUTED }}>
                        <Icon size={16} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={post.status} />
                      </td>
                      <td className="px-5 py-3" style={{ color: INK_MUTED }}>
                        {formatDate(post.scheduledDate)}
                      </td>
                      <td className="px-5 py-3" style={{ color: INK_MUTED }}>
                        {formatDateTime(post.updatedAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PostFormModal
        key={editingPost?.id ?? 'new'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        post={editingPost}
      />
    </>
  )
}

export default function Posts() {
  const { activeWorkspace } = useWorkspace()

  return (
    <div>
      <h1 className="font-display text-4xl" style={{ color: INK }}>
        Posts
      </h1>
      <p className="mt-2 max-w-xl text-sm" style={{ color: INK_MUTED }}>
        Your full post library — searchable, filterable, and ready to plan.
      </p>

      {activeWorkspace && (
        <PostsList key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
      )}
    </div>
  )
}
