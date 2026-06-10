export default function StatCard({ label, value, accentColor }) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-black/5 bg-white p-5">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-display text-4xl text-[#1A1A1A]">{value}</span>
      <span
        className="block h-1 w-full rounded-full"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  )
}
