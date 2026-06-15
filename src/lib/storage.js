// Phase 2: reads/writes go through Supabase. Local-only UI preferences
// (active workspace, theme, Anthropic key) still live in localStorage.
// Every exported function below keeps the same name and argument shape
// as Phase 1 — the data-fetching ones now return Promises.

import { supabase } from './supabase'

const LOCAL_KEYS = {
  activeWorkspace: 'brandmark:activeWorkspace',
  theme: 'brandmark:theme',
  anthropicApiKey: 'brandmark:anthropicApiKey',
}

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

// ---------------------------------------------------------------------------
// camelCase <-> snake_case row conversion
// ---------------------------------------------------------------------------

function camelToSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function toSnakeRow(obj) {
  const row = {}
  for (const [key, value] of Object.entries(obj)) {
    row[camelToSnake(key)] = value
  }
  return row
}

function toCamelRow(row) {
  if (!row) return row
  const obj = {}
  for (const [key, value] of Object.entries(row)) {
    obj[snakeToCamel(key)] = value
  }
  return obj
}

function unwrap({ data, error }) {
  if (error) throw error
  return data
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser()
  return data?.user?.id ?? null
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export async function getWorkspaces() {
  const data = unwrap(await supabase.from('workspaces').select())
  return data.map(toCamelRow)
}

export async function getWorkspace(workspaceId) {
  const { data, error } = await supabase
    .from('workspaces')
    .select()
    .eq('id', workspaceId)
    .single()
  if (error) return null
  return toCamelRow(data)
}

export async function updateWorkspace(workspaceId, updates) {
  unwrap(
    await supabase.from('workspaces').update(toSnakeRow(updates)).eq('id', workspaceId),
  )
  return getWorkspaces()
}

// ---------------------------------------------------------------------------
// Active workspace (UI preference — stays local)
// ---------------------------------------------------------------------------

export function getActiveWorkspaceId() {
  return readJSON(LOCAL_KEYS.activeWorkspace, null)
}

export function setActiveWorkspaceId(workspaceId) {
  if (workspaceId === null) {
    localStorage.removeItem(LOCAL_KEYS.activeWorkspace)
  } else {
    writeJSON(LOCAL_KEYS.activeWorkspace, workspaceId)
  }
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function getPosts(workspaceId) {
  let query = supabase.from('posts').select()
  if (workspaceId) query = query.eq('workspace_id', workspaceId)
  const data = unwrap(await query.order('created_at', { ascending: true }))
  return data.map(toCamelRow)
}

export async function getPost(postId) {
  const { data, error } = await supabase.from('posts').select().eq('id', postId).single()
  if (error) return null
  return toCamelRow(data)
}

export async function savePost(post) {
  const now = new Date().toISOString()

  if (post.id) {
    unwrap(
      await supabase
        .from('posts')
        .update(toSnakeRow({ ...post, updatedAt: now }))
        .eq('id', post.id),
    )
  } else {
    unwrap(
      await supabase.from('posts').insert(
        toSnakeRow({
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
          createdAt: now,
          updatedAt: now,
          createdBy: await getCurrentUserId(),
        }),
      ),
    )
  }

  return getPosts(post.workspaceId)
}

export async function deletePost(postId) {
  const post = await getPost(postId)
  unwrap(await supabase.from('posts').delete().eq('id', postId))
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
  let query = supabase.from('vault').select()
  if (workspaceId) query = query.eq('workspace_id', workspaceId)
  const data = unwrap(await query.order('created_at', { ascending: true }))
  return data.map(toCamelRow)
}

export async function getVaultItem(itemId) {
  const { data, error } = await supabase.from('vault').select().eq('id', itemId).single()
  if (error) return null
  return toCamelRow(data)
}

export async function saveVaultItem(item) {
  const now = new Date().toISOString()

  if (item.id) {
    unwrap(
      await supabase
        .from('vault')
        .update(toSnakeRow({ ...item, updatedAt: now }))
        .eq('id', item.id),
    )
  } else {
    unwrap(
      await supabase.from('vault').insert(
        toSnakeRow({
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
          createdAt: now,
          updatedAt: now,
          createdBy: await getCurrentUserId(),
        }),
      ),
    )
  }

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
  const item = await getVaultItem(itemId)
  unwrap(await supabase.from('vault').delete().eq('id', itemId))
  return item ? getVaultItems(item.workspaceId) : []
}

// Builds a vault item from a post banked via the Posts page link box
// (an idea with a URL in notes/sourceUrl).
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

// Creates a calendar post from a vault item and records the link back
// on the vault item's scheduledPostIds.
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
  let query = supabase.from('activities').select()
  if (workspaceId) query = query.eq('workspace_id', workspaceId)
  const data = unwrap(await query.order('created_at', { ascending: true }))
  return data.map(toCamelRow)
}

export async function getActivity(activityId) {
  const { data, error } = await supabase
    .from('activities')
    .select()
    .eq('id', activityId)
    .single()
  if (error) return null
  return toCamelRow(data)
}

export async function saveActivity(activity) {
  const now = new Date().toISOString()

  if (activity.id) {
    unwrap(
      await supabase
        .from('activities')
        .update(toSnakeRow({ ...activity, updatedAt: now }))
        .eq('id', activity.id),
    )
  } else {
    unwrap(
      await supabase.from('activities').insert(
        toSnakeRow({
          title: '',
          type: 'Other',
          date: null,
          startTime: null,
          endTime: null,
          note: null,
          ...activity,
          createdAt: now,
          updatedAt: now,
          createdBy: await getCurrentUserId(),
        }),
      ),
    )
  }

  return getActivities(activity.workspaceId)
}

export async function deleteActivity(activityId) {
  const activity = await getActivity(activityId)
  unwrap(await supabase.from('activities').delete().eq('id', activityId))
  return activity ? getActivities(activity.workspaceId) : []
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export async function getExpenses(workspaceId) {
  let query = supabase.from('expenses').select()
  if (workspaceId) query = query.eq('workspace_id', workspaceId)
  const data = unwrap(await query.order('created_at', { ascending: true }))
  return data.map(toCamelRow)
}

export async function getExpense(expenseId) {
  const { data, error } = await supabase
    .from('expenses')
    .select()
    .eq('id', expenseId)
    .single()
  if (error) return null
  return toCamelRow(data)
}

export async function saveExpense(expense) {
  if (expense.id) {
    unwrap(
      await supabase.from('expenses').update(toSnakeRow(expense)).eq('id', expense.id),
    )
  } else {
    unwrap(
      await supabase.from('expenses').insert(
        toSnakeRow({
          ...expense,
          createdAt: new Date().toISOString(),
          createdBy: await getCurrentUserId(),
        }),
      ),
    )
  }

  return getExpenses(expense.workspaceId)
}

export async function deleteExpense(expenseId) {
  const expense = await getExpense(expenseId)
  unwrap(await supabase.from('expenses').delete().eq('id', expenseId))
  return expense ? getExpenses(expense.workspaceId) : []
}

// ---------------------------------------------------------------------------
// Strategy
// ---------------------------------------------------------------------------

export async function getStrategy(workspaceId) {
  const { data, error } = await supabase
    .from('strategy')
    .select()
    .eq('workspace_id', workspaceId)
    .maybeSingle()
  if (error) throw error
  return data?.content ?? STRATEGY_PLACEHOLDER
}

export async function saveStrategy(workspaceId, content) {
  unwrap(
    await supabase.from('strategy').upsert(toSnakeRow({ workspaceId, content })),
  )
}

// ---------------------------------------------------------------------------
// Theme (UI preference — stays local)
// ---------------------------------------------------------------------------

export function getTheme() {
  return readJSON(LOCAL_KEYS.theme, 'light')
}

export function setTheme(theme) {
  writeJSON(LOCAL_KEYS.theme, theme)
}

// ---------------------------------------------------------------------------
// Anthropic API key (Phase 1 only — moves behind a serverless function later)
// ---------------------------------------------------------------------------

export function getAnthropicApiKey() {
  return readJSON(LOCAL_KEYS.anthropicApiKey, '')
}

export function setAnthropicApiKey(key) {
  writeJSON(LOCAL_KEYS.anthropicApiKey, key)
}
