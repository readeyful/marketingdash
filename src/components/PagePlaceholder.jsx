import { ACCENT_COLOR } from '../lib/theme'
import StatCard from './StatCard'

export default function PagePlaceholder({ title, description, stats }) {
  return (
    <div>
      <h1 className="font-display text-4xl text-[#1A1A1A]">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-gray-500">{description}</p>

      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              accentColor={stat.color ?? ACCENT_COLOR}
            />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-12 text-center">
        <p className="font-display text-2xl text-[#1A1A1A]">Coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          This section is being built next. Check back soon for the full{' '}
          {title.toLowerCase()} experience.
        </p>
        <span
          className="mx-auto mt-6 block h-1 w-24 rounded-full"
          style={{ backgroundColor: ACCENT_COLOR }}
        />
      </div>
    </div>
  )
}
