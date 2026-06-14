import { useMemo, useState } from 'react'
import { LayoutGrid, Link2, List, Plus, Search } from 'lucide-react'
import PostFormModal from '../components/PostFormModal'
import StatCard from '../components/StatCard'
import { useWorkspace } from '../context/workspace-context'
import {
  PLATFORM_ICONS,
  PLATFORMS,
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

function PostCard({ post, onClick }) {
  const Icon = PLATFORM_ICONS[post.platform]
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
      style={{ backgroundColor: CARD_BG }}
    >
      <Icon size={18} style={{ color: INK_MUTED }} />
      <h3 className="font-display text-lg" style={{ color: INK }}>
        {post.title || 'Untitled post'}
      </h3>
      {(post.caption || post.notes) && (
        <p className="line-clamp-3 text-sm" style={{ color: INK_MUTED }}>
          {post.caption || post.notes}
        </p>
      )}
      <div
        className="mt-auto flex items-center justify-between border-t border-(--border-soft) pt-3 text-xs"
        style={{ color: INK_MUTED }}
      >
        <span>Scheduled: {formatDate(post.scheduledDate)}</span>
        <span>Edited {formatDateTime(post.updatedAt)}</span>
      </div>
    </button>
  )
}

function PostsList({ workspaceId }) {
  const [posts, setPosts] = useState(() => getPosts(workspaceId))
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [editingPost, setEditingPost] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [ideaLink, setIdeaLink] = useState('')
  const [view, setView] = useState('table')

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return posts
      .filter((p) => platformFilter === 'All' || p.platform === platformFilter)
      .filter(
        (p) =>
          !query ||
          p.title.toLowerCase().includes(query) ||
          p.caption.toLowerCase().includes(query),
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [posts, search, platformFilter])

  const stats = useMemo(() => {
    const todayString = new Date().toISOString().slice(0, 10)
    return [
      { label: 'Total Posts', value: posts.length },
      { label: 'Ideas', value: posts.filter((p) => p.isIdea).length },
      {
        label: 'Scheduled',
        value: posts.filter((p) => p.scheduledDate && p.scheduledDate >= todayString).length,
      },
      {
        label: 'Posted',
        value: posts.filter((p) => p.scheduledDate && p.scheduledDate < todayString).length,
      },
    ]
  }, [posts])

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
      isIdea: true,
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

        <button
          type="button"
          onClick={openNewPost}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90"
          style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
        >
          <Plus size={16} />
          Add Post
        </button>

        <div className="flex rounded-full p-1" style={{ backgroundColor: CARD_BG }}>
          {[
            { id: 'table', icon: List, label: 'Table view' },
            { id: 'cards', icon: LayoutGrid, label: 'Card view' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-label={label}
              title={label}
              className="rounded-full p-1.5 transition"
              style={{
                backgroundColor: view === id ? ACCENT_SOLID_BG : 'transparent',
                color: view === id ? ACCENT_SOLID_TEXT : INK_MUTED,
              }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="mt-6 rounded-2xl p-12 text-center" style={{ backgroundColor: CARD_BG }}>
          <p className="font-display text-2xl" style={{ color: INK }}>
            No posts yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: INK_MUTED }}>
            {posts.length === 0
              ? 'Add your first post to start building your library.'
              : 'No posts match your search or filters.'}
          </p>
        </div>
      ) : view === 'cards' ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => openEditPost(post)} />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl" style={{ backgroundColor: CARD_BG }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: INK_MUTED }}>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Platform</th>
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
        </div>
      )}

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
