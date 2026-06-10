// All localStorage read/write lives here. Nothing else should touch
// localStorage directly — in Phase 2 this file is swapped for a
// Supabase-backed module with the same exported function signatures.

const KEYS = {
  workspaces: 'brandmark:workspaces',
  posts: 'brandmark:posts',
  expenses: 'brandmark:expenses',
  strategy: 'brandmark:strategy',
  activeWorkspace: 'brandmark:activeWorkspace',
}

const DEFAULT_WORKSPACES = [
  {
    id: 'ride-home-re',
    name: 'Ride Home RE',
    brandColor: '#5C2D6E',
    accentColor: '#AAFF00',
    monthlyAdBudget: 0,
  },
  {
    id: 'abigail-brand',
    name: 'Abigail Brand',
    brandColor: '#2D2D2D',
    accentColor: '#F5F5F5',
    monthlyAdBudget: 0,
  },
]

const STRATEGY_PLACEHOLDER = `<h1>Brand Mission</h1><p></p><h1>Target Audience</h1><p></p><h1>Content Pillars</h1><p></p><h1>Tone of Voice</h1><p></p><h1>Monthly Goals</h1><p></p>`

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

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export function getWorkspaces() {
  let workspaces = readJSON(KEYS.workspaces, null)
  if (!workspaces) {
    workspaces = DEFAULT_WORKSPACES
    writeJSON(KEYS.workspaces, workspaces)
  }
  return workspaces
}

export function getWorkspace(workspaceId) {
  return getWorkspaces().find((w) => w.id === workspaceId) ?? null
}

export function updateWorkspace(workspaceId, updates) {
  const workspaces = getWorkspaces().map((w) =>
    w.id === workspaceId ? { ...w, ...updates } : w,
  )
  writeJSON(KEYS.workspaces, workspaces)
  return workspaces
}

// ---------------------------------------------------------------------------
// Active workspace
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

export function getPosts(workspaceId) {
  const all = readJSON(KEYS.posts, [])
  return workspaceId ? all.filter((p) => p.workspaceId === workspaceId) : all
}

export function getPost(postId) {
  return readJSON(KEYS.posts, []).find((p) => p.id === postId) ?? null
}

export function savePost(post) {
  const all = readJSON(KEYS.posts, [])
  const now = new Date().toISOString()
  const idx = all.findIndex((p) => p.id === post.id)

  if (idx >= 0) {
    all[idx] = { ...all[idx], ...post, updatedAt: now }
  } else {
    all.push({
      status: 'Idea',
      scheduledDate: null,
      caption: '',
      notes: '',
      ...post,
      id: post.id ?? uuid(),
      createdAt: now,
      updatedAt: now,
    })
  }

  writeJSON(KEYS.posts, all)
  return all
}

export function deletePost(postId) {
  const all = readJSON(KEYS.posts, []).filter((p) => p.id !== postId)
  writeJSON(KEYS.posts, all)
  return all
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export function getExpenses(workspaceId) {
  const all = readJSON(KEYS.expenses, [])
  return workspaceId ? all.filter((e) => e.workspaceId === workspaceId) : all
}

export function saveExpense(expense) {
  const all = readJSON(KEYS.expenses, [])
  const idx = all.findIndex((e) => e.id === expense.id)

  if (idx >= 0) {
    all[idx] = { ...all[idx], ...expense }
  } else {
    all.push({
      ...expense,
      id: expense.id ?? uuid(),
      createdAt: new Date().toISOString(),
    })
  }

  writeJSON(KEYS.expenses, all)
  return all
}

export function deleteExpense(expenseId) {
  const all = readJSON(KEYS.expenses, []).filter((e) => e.id !== expenseId)
  writeJSON(KEYS.expenses, all)
  return all
}

// ---------------------------------------------------------------------------
// Strategy
// ---------------------------------------------------------------------------

export function getStrategy(workspaceId) {
  const all = readJSON(KEYS.strategy, {})
  return all[workspaceId] ?? STRATEGY_PLACEHOLDER
}

export function saveStrategy(workspaceId, content) {
  const all = readJSON(KEYS.strategy, {})
  all[workspaceId] = content
  writeJSON(KEYS.strategy, all)
}
