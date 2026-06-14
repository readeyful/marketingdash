import { Camera, Zap } from 'lucide-react'
import Modal from './Modal'
import { CARD_BG, INK } from '../lib/theme'

export default function AddChoiceModal({ open, onClose, onChoosePost, onChooseActivity }) {
  return (
    <Modal open={open} onClose={onClose} title="What are you adding?">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onChoosePost}
          className="flex flex-1 flex-col items-center gap-2 rounded-2xl p-6 text-sm font-medium transition hover:opacity-80"
          style={{ backgroundColor: CARD_BG, color: INK }}
        >
          <Camera size={24} />
          Post
        </button>
        <button
          type="button"
          onClick={onChooseActivity}
          className="flex flex-1 flex-col items-center gap-2 rounded-2xl p-6 text-sm font-medium transition hover:opacity-80"
          style={{ backgroundColor: CARD_BG, color: INK }}
        >
          <Zap size={24} />
          Activity
        </button>
      </div>
    </Modal>
  )
}
