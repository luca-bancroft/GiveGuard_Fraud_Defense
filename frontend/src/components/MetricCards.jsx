export default function MetricCards({ submissions }) {
  const total    = submissions.length
  const verified = submissions.filter(s => s.verdict === 'verified').length
  const flagged  = submissions.filter(s => s.verdict === 'flagged').length
  const blocked  = submissions.filter(s => s.verdict === 'blocked').length
  const passRate = total > 0 ? Math.round((verified / total) * 100) : 0

  const cards = [
    { label: 'Total Submissions', value: total,    sub: 'this session',          color: '#6b7280', border: '#6b7280' },
    { label: 'Verified',          value: verified,  sub: `${passRate}% pass rate`, color: '#1bc5a4', border: '#1bc5a4' },
    { label: 'Flagged',           value: flagged,   sub: 'review needed',          color: '#d97706', border: '#d97706' },
    { label: 'Blocked',           value: blocked,   sub: 'fake detected',          color: '#ef4444', border: '#ef4444' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map(card => (
        <div
          key={card.label}
          className="rounded-xl p-5 border border-gray-200"
          style={{ backgroundColor: '#ffffff', borderLeft: `3px solid ${card.border}` }}
        >
          <p className="text-gray-500 text-xs mb-2">{card.label}</p>
          <p className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</p>
          <p className="text-gray-400 text-xs">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}