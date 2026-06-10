import { CARD_BG, INK, INK_MUTED } from '../lib/theme'

export default function StatCard({ label, value, accentColor }) {
  return (
    <div
      className="flex flex-col gap-6 rounded-2xl p-5"
      style={{ backgroundColor: CARD_BG }}
    >
      <span className="text-sm" style={{ color: INK_MUTED }}>
        {label}
      </span>
      <span className="font-display text-4xl" style={{ color: INK }}>
        {value}
      </span>
      <span
        className="block h-1 w-full rounded-full"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  )
}
