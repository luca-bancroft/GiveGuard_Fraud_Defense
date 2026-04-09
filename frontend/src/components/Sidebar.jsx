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
        className="hidden md:block w-52 shrink-0 rounded-xl border border-gray-200 p-3 h-fit"
        style={{ backgroundColor: '#ffffff' }}
      >
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
          Navigation
        </p>
        <nav className="space-y-1">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => onChange(link.id)}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: active === link.id ? '#e6faf7' : 'transparent',
                color: active === link.id ? '#0d9e82' : '#6b7280',
                fontWeight: active === link.id ? 500 : 400,
              }}
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
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors border"
            style={{
              backgroundColor: active === link.id ? '#e6faf7' : '#ffffff',
              color: active === link.id ? '#0d9e82' : '#6b7280',
              borderColor: active === link.id ? '#9de8d8' : '#e2e8f0',
              fontWeight: active === link.id ? 500 : 400,
            }}
          >
            <span className="text-xs">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>
    </>
  )
}