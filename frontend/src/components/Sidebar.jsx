export default function Sidebar({ active, onChange }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard',     icon: '◈' },
    { id: 'verified',  label: 'Verified Orgs', icon: '✓' },
    { id: 'flagged',   label: 'Flagged Queue', icon: '!' },
    { id: 'blocked',   label: 'Blocked List',  icon: '✕' },
  ]

  return (
    <>
      {/* Desktop */}
      <div
        className="hidden md:block w-52 shrink-0 rounded-xl border border-white/10 p-3 h-fit"
        style={{ backgroundColor: '#0f172a' }}
      >
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Navigation
        </p>
        <nav className="space-y-1">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => onChange(link.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active === link.id
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-xs">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden overflow-x-auto gap-2 mb-4 pb-1">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => onChange(link.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors border ${
              active === link.id
                ? 'bg-white/10 text-white font-medium border-white/20'
                : 'text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-xs">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>
    </>
  )
}