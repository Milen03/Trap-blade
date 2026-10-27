// Vector take on the TrapBlade mark: bucket hat with "TB", slanted banner and a straight razor.
function Logo({ className = '', badge = true, title = 'TrapBlade' }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      {badge && <circle cx="100" cy="100" r="100" fill="#07080a" />}

      {/* Razor behind the banner */}
      <polygon points="118,112 134,104 170,152 159,159" fill="#e6e9ee" />
      <polygon points="159,159 170,152 190,182 179,189" fill="#7d8691" stroke="#07080a" strokeWidth="2" />
      <line x1="163" y1="160" x2="181" y2="185" stroke="#c3c9d1" strokeWidth="2" />

      {/* Bucket hat */}
      <path
        d="M62 98 L70 50 Q73 30 100 30 Q127 30 130 50 L138 98 Z"
        fill="#07080a"
        stroke="#29b6f6"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path d="M36 108 Q100 80 164 108" fill="none" stroke="#29b6f6" strokeWidth="8" strokeLinecap="round" />
      <text
        x="100"
        y="82"
        textAnchor="middle"
        fontFamily="Rubik Mono One, sans-serif"
        fontSize="30"
        fill="#29b6f6"
      >
        TB
      </text>

      {/* Banner */}
      <g transform="rotate(-9 100 132)">
        <rect x="22" y="112" width="156" height="40" fill="#07080a" stroke="#fff" strokeWidth="4" />
        <text
          x="100"
          y="140"
          textAnchor="middle"
          fontFamily="Rubik Mono One, sans-serif"
          fontSize="18"
          fill="#fff"
          textLength="138"
          lengthAdjust="spacingAndGlyphs"
        >
          TRAPBLADE
        </text>
      </g>
    </svg>
  )
}

export default Logo
