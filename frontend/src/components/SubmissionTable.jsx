import VerdictBadge from './VerdictBadge.jsx'

export default function SubmissionTable({ submissions, onSelect }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: '#f8fafb', borderBottom: '1px solid #e2e8f0' }}>
            <th className="text-left text-gray-500 font-medium px-5 py-3">EIN</th>
            <th className="text-left text-gray-500 font-medium px-5 py-3">Organization</th>
            <th className="text-left text-gray-500 font-medium px-5 py-3">Trust Score</th>
            <th className="text-left text-gray-500 font-medium px-5 py-3">Verdict</th>
            <th className="text-left text-gray-500 font-medium px-5 py-3">Top Flag</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, i) => (
            <tr
              key={i}
              onClick={() => onSelect(s)}
              className="transition-colors cursor-pointer hover:bg-gray-50"
              style={{ borderBottom: '1px solid #e2e8f0' }}
            >
              <td className="px-5 py-4 text-gray-500 text-xs" style={{ fontFamily: 'monospace' }}>{s.ein}</td>
              <td className="px-5 py-4 text-gray-800 font-medium">{s.org_name}</td>
              <td className="px-5 py-4">
                <span className="font-bold" style={{
                  color: s.trust_score >= 75 ? '#1bc5a4' : s.trust_score >= 40 ? '#d97706' : '#ef4444'
                }}>
                  {s.trust_score}
                </span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <VerdictBadge verdict={s.verdict} />
              </td>
              <td className="px-5 py-4 text-gray-400 text-xs">
                {s.top_flag ?? <span className="text-gray-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}