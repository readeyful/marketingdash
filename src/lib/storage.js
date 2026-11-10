// Local storage only — no Supabase. All data-fetching functions are async
// so component call sites (which use await) work without changes.

const KEYS = {
  workspaces: 'brandmark:workspaces',
  posts: 'brandmark:posts',
  expenses: 'brandmark:expenses',
  activities: 'brandmark:activities',
  vault: 'brandmark:vault',
  strategy: 'brandmark:strategy',
  activeWorkspace: 'brandmark:activeWorkspace',
  theme: 'brandmark:theme',
  anthropicApiKey: 'brandmark:anthropicApiKey',
}

const STRATEGY_PLACEHOLDER = `<h1>Brand Mission</h1><p></p><h1>Target Audience</h1><p></p><h1>Content Pillars</h1><p></p><h1>Tone of Voice</h1><p></p><h1>Monthly Goals</h1><p></p>`

const DEFAULT_WORKSPACES = [
  { id: 'workspace-1', name: 'My Workspace', accentColor: '#6B7280', monthlyAdBudget: 0 },
]

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export async function getWorkspaces() {
  const stored = readJSON(KEYS.workspaces, null)
  if (!stored) {
    writeJSON(KEYS.workspaces, DEFAULT_WORKSPACES)
    return DEFAULT_WORKSPACES
  }
  return stored
}

export async function getWorkspace(id) {
  const all = await getWorkspaces()
  return all.find((w) => w.id === id) ?? null
}

export async function updateWorkspace(id, updates) {
  const all = await getWorkspaces()
  const next = all.map((w) => (w.id === id ? { ...w, ...updates } : w))
  writeJSON(KEYS.workspaces, next)
  return next
}

// ---------------------------------------------------------------------------
// Active workspace (UI preference — stays local)
// ---------------------------------------------------------------------------

export function getActiveWorkspaceId() {
  return readJSON(KEYS.activeWorkspace, null)
}

export function setActiveWorkspaceId(workspaceId) {
  if (workspaceId === null) {
    localStorage.removeItem(KEYS.activeWorkspace)
  } else {
    writeJSON(KEYS.activeWorkspace, workspaceId)
  }
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function getPosts(workspaceId) {
  const all = readJSON(KEYS.posts, [])
  return workspaceId ? all.filter((p) => p.workspaceId === workspaceId) : all
}

export async function getPost(postId) {
  const all = readJSON(KEYS.posts, [])
  return all.find((p) => p.id === postId) ?? null
}

export async function savePost(post) {
  const all = readJSON(KEYS.posts, [])
  const now = new Date().toISOString()
  let next
  if (post.id) {
    next = all.map((p) => (p.id === post.id ? { ...p, ...post, updatedAt: now } : p))
  } else {
    const newPost = {
      isIdea: false,
      scheduledDate: null,
      caption: '',
      notes: '',
      postType: null,
      pillar: null,
      imageUrl: null,
      postGoal: '',
      postStrategy: '',
      postTip: '',
      sourceUrl: null,
      isFavorited: false,
      vaultItemId: null,
      ...post,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    }
    next = [...all, newPost]
  }
  writeJSON(KEYS.posts, next)
  return getPosts(post.workspaceId)
}

export async function deletePost(postId) {
  const all = readJSON(KEYS.posts, [])
  const post = all.find((p) => p.id === postId)
  const next = all.filter((p) => p.id !== postId)
  writeJSON(KEYS.posts, next)
  return post ? getPosts(post.workspaceId) : []
}

// ---------------------------------------------------------------------------
// Vault
// ---------------------------------------------------------------------------

const NEW_ITEM_WINDOW_MS = 14 * 24 * 60 * 60 * 1000

export function isVaultItemNew(item) {
  return Date.now() - new Date(item.createdAt).getTime() < NEW_ITEM_WINDOW_MS
}

export async function getVaultItems(workspaceId) {
  const all = readJSON(KEYS.vault, [])
  return workspaceId ? all.filter((v) => v.workspaceId === workspaceId) : all
}

export async function getVaultItem(itemId) {
  const all = readJSON(KEYS.vault, [])
  return all.find((v) => v.id === itemId) ?? null
}

export async function saveVaultItem(item) {
  const all = readJSON(KEYS.vault, [])
  const now = new Date().toISOString()
  let next
  if (item.id) {
    next = all.map((v) => (v.id === item.id ? { ...v, ...item, updatedAt: now } : v))
  } else {
    const newItem = {
      type: 'template',
      title: '',
      format: null,
      pillar: null,
      audience: null,
      platforms: [],
      images: [],
      caption: '',
      notes: '',
      postGoal: '',
      postStrategy: '',
      postTip: '',
      sourceUrl: null,
      candcName: null,
      isFavorited: false,
      scheduledPostIds: [],
      ...item,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    }
    next = [...all, newItem]
  }
  writeJSON(KEYS.vault, next)
  return getVaultItems(item.workspaceId)
}

export async function duplicateVaultItem(itemId) {
  const source = await getVaultItem(itemId)
  if (!source) return getVaultItems()
  return saveVaultItem({
    ...source,
    id: undefined,
    title: `${source.title || 'Untitled'} (copy)`,
    scheduledPostIds: [],
    isFavorited: false,
  })
}

export async function deleteVaultItem(itemId) {
  const all = readJSON(KEYS.vault, [])
  const item = all.find((v) => v.id === itemId)
  writeJSON(KEYS.vault, all.filter((v) => v.id !== itemId))
  return item ? getVaultItems(item.workspaceId) : []
}

export function inspoPostToVaultItem(post, workspaceId) {
  const url = (post.sourceUrl ?? post.notes ?? '').trim()
  return {
    workspaceId,
    type: 'inspo',
    title: post.title || url,
    platforms: post.platform ? [post.platform] : [],
    sourceUrl: url,
    caption: post.caption ?? '',
  }
}

export async function scheduleVaultItem(itemId, date) {
  const item = await getVaultItem(itemId)
  if (!item) return null
  const posts = await savePost({
    workspaceId: item.workspaceId,
    title: item.title,
    platform: item.platforms[0] ?? 'Instagram',
    scheduledDate: date,
    caption: item.caption,
    notes: item.notes,
    postType: item.format,
    imageUrl: item.images[0] ?? null,
    postGoal: item.postGoal,
    postStrategy: item.postStrategy,
    postTip: item.postTip,
    sourceUrl: item.sourceUrl,
  })
  const newPost = posts[posts.length - 1]
  await saveVaultItem({
    id: item.id,
    scheduledPostIds: [...(item.scheduledPostIds ?? []), newPost.id],
  })
  return newPost
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export async function getActivities(workspaceId) {
  const all = readJSON(KEYS.activities, [])
  return workspaceId ? all.filter((a) => a.workspaceId === workspaceId) : all
}

export async function getActivity(activityId) {
  const all = readJSON(KEYS.activities, [])
  return all.find((a) => a.id === activityId) ?? null
}

export async function saveActivity(activity) {
  const all = readJSON(KEYS.activities, [])
  const now = new Date().toISOString()
  let next
  if (activity.id) {
    next = all.map((a) => (a.id === activity.id ? { ...a, ...activity, updatedAt: now } : a))
  } else {
    next = [...all, {
      title: '',
      type: 'Other',
      date: null,
      startTime: null,
      endTime: null,
      note: null,
      ...activity,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    }]
  }
  writeJSON(KEYS.activities, next)
  return getActivities(activity.workspaceId)
}

export async function deleteActivity(activityId) {
  const all = readJSON(KEYS.activities, [])
  const activity = all.find((a) => a.id === activityId)
  writeJSON(KEYS.activities, all.filter((a) => a.id !== activityId))
  return activity ? getActivities(activity.workspaceId) : []
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export async function getExpenses(workspaceId) {
  const all = readJSON(KEYS.expenses, [])
  return workspaceId ? all.filter((e) => e.workspaceId === workspaceId) : all
}

export async function getExpense(expenseId) {
  const all = readJSON(KEYS.expenses, [])
  return all.find((e) => e.id === expenseId) ?? null
}

export async function saveExpense(expense) {
  const all = readJSON(KEYS.expenses, [])
  const now = new Date().toISOString()
  let next
  if (expense.id) {
    next = all.map((e) => (e.id === expense.id ? { ...e, ...expense } : e))
  } else {
    next = [...all, { ...expense, id: uid(), createdAt: now }]
  }
  writeJSON(KEYS.expenses, next)
  return getExpenses(expense.workspaceId)
}

export async function deleteExpense(expenseId) {
  const all = readJSON(KEYS.expenses, [])
  const expense = all.find((e) => e.id === expenseId)
  writeJSON(KEYS.expenses, all.filter((e) => e.id !== expenseId))
  return expense ? getExpenses(expense.workspaceId) : []
}

// ---------------------------------------------------------------------------
// Strategy
// ---------------------------------------------------------------------------

export async function getStrategy(workspaceId) {
  const all = readJSON(KEYS.strategy, {})
  return all[workspaceId] ?? STRATEGY_PLACEHOLDER
}

export async function saveStrategy(workspaceId, content) {
  const all = readJSON(KEYS.strategy, {})
  writeJSON(KEYS.strategy, { ...all, [workspaceId]: content })
}

// ---------------------------------------------------------------------------
// Theme (UI preference — stays local)
// ---------------------------------------------------------------------------

export function getTheme() {
  return readJSON(KEYS.theme, 'light')
}

export function setTheme(theme) {
  writeJSON(KEYS.theme, theme)
}

// ---------------------------------------------------------------------------
// Anthropic API key
// ---------------------------------------------------------------------------

export function getAnthropicApiKey() {
  return readJSON(KEYS.anthropicApiKey, '')
}

export function setAnthropicApiKey(key) {
  writeJSON(KEYS.anthropicApiKey, key)
}
