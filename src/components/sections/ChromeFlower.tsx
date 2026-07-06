export default function ChromeFlower() {
  return (
    <svg viewBox="0 0 200 200" className="chrome-flower" aria-hidden="true">
      <defs>
        <linearGradient id="chromeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="35%" stopColor="#b8b8b8" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#9a9a9a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>
      </defs>
      <g>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx="100"
            cy="50"
            rx="22"
            ry="48"
            transform={`rotate(${a} 100 100)`}
            fill="url(#chromeGradient)"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="100" cy="100" r="14" fill="url(#chromeGradient)" />
      </g>
    </svg>
  )
}
