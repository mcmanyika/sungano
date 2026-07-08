/** Abstract constitutional-themed SVG illustration for the hero */
export function ConstitutionalGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F3D91" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#1F8A70" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="heroGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C9A227" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="250" cy="250" r="200" stroke="#0F3D91" strokeWidth="1" strokeOpacity="0.15" />
      <circle cx="250" cy="250" r="160" stroke="#1F8A70" strokeWidth="1" strokeOpacity="0.2" />
      <circle cx="250" cy="250" r="120" fill="url(#heroGrad1)" />

      {/* Scales of justice abstraction */}
      <path
        d="M250 120 L250 320"
        stroke="#0F3D91"
        strokeWidth="2"
        strokeOpacity="0.4"
      />
      <path
        d="M180 180 L320 180"
        stroke="#0F3D91"
        strokeWidth="2"
        strokeOpacity="0.4"
      />
      <path
        d="M180 180 C180 220 160 240 160 260 C160 280 190 290 210 270"
        stroke="#1F8A70"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
      />
      <path
        d="M320 180 C320 220 340 240 340 260 C340 280 310 290 290 270"
        stroke="#1F8A70"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
      />

      {/* Document lines */}
      <rect x="210" y="300" width="80" height="100" rx="4" fill="white" fillOpacity="0.9" stroke="#0F3D91" strokeWidth="1" strokeOpacity="0.2" />
      <line x1="225" y1="325" x2="275" y2="325" stroke="#0F3D91" strokeWidth="1.5" strokeOpacity="0.15" />
      <line x1="225" y1="345" x2="265" y2="345" stroke="#0F3D91" strokeWidth="1.5" strokeOpacity="0.15" />
      <line x1="225" y1="365" x2="270" y2="365" stroke="#0F3D91" strokeWidth="1.5" strokeOpacity="0.15" />

      {/* Decorative arcs */}
      <path
        d="M100 250 A150 150 0 0 1 400 250"
        stroke="url(#heroGrad2)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M130 250 A120 120 0 0 0 370 250"
        stroke="#C9A227"
        strokeWidth="1"
        strokeOpacity="0.2"
        fill="none"
      />

      {/* People dots representing civic unity */}
      {[
        [250, 80],
        [200, 100],
        [300, 100],
        [170, 140],
        [330, 140],
        [150, 200],
        [350, 200],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="4"
          fill="#C9A227"
          fillOpacity={0.3 + i * 0.05}
        />
      ))}
    </svg>
  );
}

/** Stylized Zimbabwe map placeholder */
export function ZimbabweMapPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Map of Zimbabwe"
      role="img"
    >
      <rect width="400" height="300" rx="16" fill="#0F3D91" fillOpacity="0.05" />
      {/* Simplified Zimbabwe outline */}
      <path
        d="M80 120 L120 80 L180 70 L240 85 L300 75 L340 100 L350 150 L330 200 L280 230 L220 240 L160 220 L100 200 L70 160 Z"
        fill="#0F3D91"
        fillOpacity="0.12"
        stroke="#0F3D91"
        strokeWidth="2"
        strokeOpacity="0.3"
      />
      {/* Province markers */}
      {[
        [200, 130],
        [150, 160],
        [250, 150],
        [180, 190],
        [220, 200],
        [130, 140],
        [280, 170],
        [200, 210],
        [160, 120],
        [270, 130],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="6" fill="#C9A227" fillOpacity="0.8" />
          <circle cx={cx} cy={cy} r="10" stroke="#C9A227" strokeWidth="1" strokeOpacity="0.4" fill="none" />
        </g>
      ))}
      <text x="200" y="270" textAnchor="middle" fill="#0F3D91" fillOpacity="0.5" fontSize="12" fontFamily="sans-serif">
        Interactive Map — Select a Province
      </text>
    </svg>
  );
}
