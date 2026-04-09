export default function VerdictBadge({ verdict }) {
  const styles = {
    verified: { backgroundColor: '#e6faf7', color: '#0d9e82', border: '1px solid #9de8d8' },
    flagged:  { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' },
    blocked:  { backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2' },
  }

  const labels = {
    verified: '✓ VERIFIED',
    flagged:  '⚠ FLAGGED',
    blocked:  '⛔ BLOCKED',
  }

  return (
    <span
      className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"
      style={styles[verdict]}
    >
      {labels[verdict]}
    </span>
  )
}