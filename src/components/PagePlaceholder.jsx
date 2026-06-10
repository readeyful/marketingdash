export default function PagePlaceholder({ title, description }) {
  return (
    <div>
      <h1 className="font-heading text-3xl text-[#1A1A1A]">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-gray-500">{description}</p>
      <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white/60 p-12 text-center text-sm text-gray-400">
        Coming soon
      </div>
    </div>
  )
}
