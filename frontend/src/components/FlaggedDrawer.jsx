export default function FlaggedDrawer({ submission, onClose }) {
  if (!submission) return null

  const irs = submission.irs_lookup

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl border p-6 w-full max-w-lg"
        style={{ backgroundColor: '#ffffff', borderLeft: '3px solid #d97706', borderColor: '#fcd34d' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#d97706' }}>⚠ FLAGGED</p>
            <h2 className="text-gray-800 font-bold text-lg">{submission.org_name}</h2>
            <p className="text-gray-400 text-xs font-mono mt-1">EIN {submission.ein}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg" style={{ backgroundColor: '#f8fafb' }}>
          <span className="font-bold text-3xl" style={{ color: '#d97706' }}>{submission.trust_score}</span>
          <div>
            <p className="text-gray-800 text-sm font-medium">Trust Score</p>
            <p className="text-gray-400 text-xs">out of 100 — review needed</p>
          </div>
        </div>

        {irs && (
          <>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
              IRS Lookup
            </p>
            <div className="rounded-lg border border-gray-200 overflow-hidden mb-6" style={{ backgroundColor: '#f8fafb' }}>
              {[
                { label: 'EIN Exists',    value: irs.ein_exists ? 'Yes' : 'No' },
                { label: 'Active Status', value: irs.active_status },
                { label: '990 Filing',    value: irs.filing_990 ? 'On record' : 'Not found' },
                { label: 'NTEE Code',     value: irs.ntee_code },
                { label: 'Ruling Date',   value: irs.ruling_date },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-3 border-b border-gray-200 last:border-0"
                >
                  <span className="text-gray-500 text-sm">{row.label}</span>
                  <span className="text-gray-800 text-sm font-medium">{row.value ?? '—'}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {submission.signals && submission.signals.length > 0 && (
          <>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Fraud Signals Raised
            </p>
            <div className="space-y-2">
              {submission.signals.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 rounded-lg border border-gray-200"
                  style={{ backgroundColor: '#f8fafb' }}
                >
                  <span className="text-gray-600 text-sm">{s.flag}</span>
                  <span className="text-xs font-bold ml-4 shrink-0" style={{ color: '#d97706' }}>
                    +{s.risk_points} risk
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {!submission.signals?.length && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg border"
            style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}
          >
            <span className="text-sm" style={{ color: '#d97706' }}>⚠</span>
            <span className="text-sm" style={{ color: '#d97706' }}>Flagged for manual review — no specific signals recorded</span>
          </div>
        )}
      </div>
    </div>
  )
}