function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        @keyframes scan {
          0% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .logo-doc { animation: pulse-ring 2.5s ease-in-out infinite; transform-origin: center; }
        .logo-scan { animation: scan 1.5s ease-in-out infinite; }
        .logo-dot { animation: blink 1.5s ease-in-out infinite; }
        .logo-dot-2 { animation: blink 1.5s ease-in-out infinite; animation-delay: 0.3s; }
        .logo-dot-3 { animation: blink 1.5s ease-in-out infinite; animation-delay: 0.6s; }
      `}</style>

      {/* document */}
      <g className="logo-doc">
        <rect x="5" y="3" width="16" height="20" rx="2" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="8" y="7" width="10" height="1.5" rx="0.75" fill="#6366f1" opacity="0.5" />
        <rect x="8" y="10.5" width="8" height="1.5" rx="0.75" fill="#6366f1" opacity="0.5" />
        <rect x="8" y="14" width="10" height="1.5" rx="0.75" fill="#6366f1" opacity="0.5" />

        {/* scanning line */}
        <rect className="logo-scan" x="6" y="7" width="14" height="1" rx="0.5" fill="#6366f1" opacity="0.4" />
      </g>

      {/* brain / AI circle */}
      <circle cx="22" cy="22" r="8" fill="#6366f1" />
      <circle cx="22" cy="22" r="6" fill="#4f46e5" />

      {/* thinking dots */}
      <circle className="logo-dot" cx="19" cy="22" r="1.2" fill="white" />
      <circle className="logo-dot-2" cx="22" cy="22" r="1.2" fill="white" />
      <circle className="logo-dot-3" cx="25" cy="22" r="1.2" fill="white" />
    </svg>
  )
}

export default Logo