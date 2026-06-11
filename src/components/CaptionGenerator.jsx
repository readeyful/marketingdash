import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { generateCaption, hasApiKey } from '../lib/ai'
import { setAnthropicApiKey } from '../lib/storage'
import {
  ACCENT_SOLID_BG,
  ACCENT_SOLID_TEXT,
  CARD_BG,
  INK,
  INK_MUTED,
  INPUT_CLASS,
} from '../lib/theme'

// `post` is anything shaped like a post for prompting purposes:
// { platform, postType, title, postGoal, postStrategy }.
export default function CaptionGenerator({ post, onUseCaption }) {
  const [keyDraft, setKeyDraft] = useState('')
  const [keySet, setKeySet] = useState(() => hasApiKey())
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState('')
  const [error, setError] = useState('')

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      setGenerated(await generateCaption(post))
    } catch (err) {
      setError(err?.message ?? 'Something went wrong generating the caption.')
    } finally {
      setGenerating(false)
    }
  }

  if (!keySet) {
    return (
      <div className="rounded-xl p-4" style={{ backgroundColor: CARD_BG }}>
        <p className="text-sm" style={{ color: INK_MUTED }}>
          To use the AI caption generator, paste your Anthropic API key. It's
          stored only in this browser.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            className={INPUT_CLASS}
            placeholder="sk-ant-..."
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
          />
          <button
            type="button"
            disabled={!keyDraft.trim()}
            onClick={() => {
              setAnthropicApiKey(keyDraft.trim())
              setKeySet(true)
            }}
            className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
      >
        {generating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Caption
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm" style={{ color: '#C0524A' }}>
          {error}
        </p>
      )}

      {generated && !generating && (
        <div className="mt-3 rounded-xl p-4" style={{ backgroundColor: CARD_BG }}>
          <p className="whitespace-pre-wrap text-sm" style={{ color: INK }}>
            {generated}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onUseCaption(generated)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
              style={{ backgroundColor: ACCENT_SOLID_BG, color: ACCENT_SOLID_TEXT }}
            >
              Use this
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition hover:bg-(--border-soft)"
              style={{ color: INK_MUTED }}
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
