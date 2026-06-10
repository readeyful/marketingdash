import { CARD_BG, INK, INK_MUTED, STAT_ACCENTS } from '../lib/theme'
import StatCard from './StatCard'

export default function PagePlaceholder({ title, description, stats }) {
  return (
    <div>
      <h1 className="font-display text-4xl" style={{ color: INK }}>
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm" style={{ color: INK_MUTED }}>
        {description}
      </p>

      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              accentColor={
                stat.color ?? STAT_ACCENTS[i % STAT_ACCENTS.length]
              }
            />
          ))}
        </div>
      )}

      <div
        className="mt-8 rounded-2xl p-12 text-center"
        style={{ backgroundColor: CARD_BG }}
      >
        <p className="font-display text-2xl" style={{ color: INK }}>
          Coming soon
        </p>
        <p
          className="mx-auto mt-2 max-w-md text-sm"
          style={{ color: INK_MUTED }}
        >
          This section is being built next. Check back soon for the full{' '}
          {title.toLowerCase()} experience.
        </p>
        <span
          className="mx-auto mt-6 block h-1 w-24 rounded-full"
          style={{ backgroundColor: INK }}
        />
      </div>
    </div>
  )
}
