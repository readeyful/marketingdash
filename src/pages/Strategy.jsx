import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
} from 'lucide-react'
import { useWorkspace } from '../context/workspace-context'
import { getStrategy, saveStrategy } from '../lib/storage'
import { CARD_BG, INK, INK_MUTED } from '../lib/theme'

const AUTOSAVE_INTERVAL = 30000

function ToolbarButton({ onClick, isActive, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-lg p-2 transition hover:bg-black/5"
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
        <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-black/5 pb-3">
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
        <StrategyEditor key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
      )}
    </div>
  )
}
