import { Loader2 } from 'lucide-react'
import { INK_MUTED } from '../lib/theme'

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={24} className="animate-spin" style={{ color: INK_MUTED }} />
    </div>
  )
}
