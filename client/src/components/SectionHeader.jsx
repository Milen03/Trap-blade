function SectionHeader({ title,}) {
  return (
    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="text-5xl font-bold uppercase leading-none sm:text-6xl">{title}</h2>
    </div>
  )
}

export default SectionHeader
