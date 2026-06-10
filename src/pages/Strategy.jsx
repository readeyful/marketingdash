import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import {
  Bold,
  ExternalLink,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
} from 'lucide-react'
import { useWorkspace } from '../context/workspace-context'
import { BRAND_BOOKS } from '../lib/constants'
import { getStrategy, saveStrategy } from '../lib/storage'
import { ACCENT_SOLID_BG, ACCENT_SOLID_TEXT, CARD_BG, INK, INK_MUTED } from '../lib/theme'

const AUTOSAVE_INTERVAL = 30000

function ToolbarButton({ onClick, isActive, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-lg p-2 transition hover:bg-(--border-soft)"
      style={{
        color: isActive ? INK : INK_MUTED,
        backgroundColor: isActive ? CARD_BG : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

function formatTimestamp(date) {
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function StrategyEditor({ workspaceId }) {
  const [lastSavedAt, setLastSavedAt] = useState(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: getStrategy(workspaceId),
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none min-h-[400px] max-w-none',
      },
    },
  })

  // Auto-save on an interval, and once more on unmount.
  useEffect(() => {
    if (!editor) return

    function save() {
      saveStrategy(workspaceId, editor.getHTML())
      setLastSavedAt(new Date())
    }

    const interval = setInterval(save, AUTOSAVE_INTERVAL)
    return () => {
      clearInterval(interval)
      save()
    }
  }, [editor, workspaceId])

  if (!editor) return null

  return (
    <>
      <div
        className="mt-8 rounded-2xl p-2 sm:p-6"
        style={{ backgroundColor: CARD_BG }}
      >
        <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-(--border-soft) pb-3">
          <ToolbarButton
            label="Heading 1"
            isActive={editor.isActive('heading', { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Bold"
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={18} />
          </ToolbarButton>
        </div>

        <EditorContent editor={editor} />
      </div>

      <p className="mt-3 text-xs" style={{ color: INK_MUTED }}>
        {lastSavedAt
          ? `Last saved at ${formatTimestamp(lastSavedAt)}`
          : 'Not saved yet — autosaves every 30 seconds'}
      </p>
    </>
  )
}

function BrandBookView({ src, label }) {
  return (
    <div
      className="mt-8 overflow-hidden rounded-2xl"
      style={{ backgroundColor: CARD_BG }}
    >
      <div className="flex items-center justify-between border-b border-(--border-soft) px-4 py-3">
        <span className="text-sm font-medium" style={{ color: INK_MUTED }}>
          {label}
        </span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition hover:bg-(--border-soft)"
          style={{ color: INK }}
        >
          <ExternalLink size={14} />
          Open in new tab
        </a>
      </div>
      <iframe
        src={src}
        title={label}
        className="h-[80vh] w-full border-0"
      />
    </div>
  )
}

function StrategyContent({ workspaceId }) {
  const brandBook = BRAND_BOOKS[workspaceId]
  const [activeTab, setActiveTab] = useState('notes')

  return (
    <>
      {brandBook && (
        <div className="mt-6 flex gap-1 rounded-full p-1" style={{ backgroundColor: CARD_BG, width: 'fit-content' }}>
          {[
            { id: 'notes', label: 'Strategy Notes' },
            { id: 'brand-book', label: brandBook.label },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition"
              style={{
                backgroundColor: activeTab === tab.id ? ACCENT_SOLID_BG : 'transparent',
                color: activeTab === tab.id ? ACCENT_SOLID_TEXT : INK_MUTED,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'notes' || !brandBook ? (
        <StrategyEditor workspaceId={workspaceId} />
      ) : (
        <BrandBookView src={brandBook.src} label={brandBook.label} />
      )}
    </>
  )
}

export default function Strategy() {
  const { activeWorkspace } = useWorkspace()

  return (
    <div>
      <h1 className="font-display text-4xl" style={{ color: INK }}>
        Strategy
      </h1>
      <p className="mt-2 max-w-xl text-sm" style={{ color: INK_MUTED }}>
        A living doc for brand direction — always accessible, easy to edit.
      </p>

      {activeWorkspace && (
        <StrategyContent key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
      )}
    </div>
  )
}
