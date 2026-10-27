function SectionTitle({ kicker, children }) {
  return (
    <div className="mb-14">
      <p className="font-brand text-3xl text-ice">{kicker}</p>
      <h2 className="mt-1 font-display text-3xl uppercase sm:text-5xl">{children}</h2>
      <div className="mt-5 h-1 w-24 -skew-x-12 bg-ice" />
    </div>
  )
}

export default SectionTitle
