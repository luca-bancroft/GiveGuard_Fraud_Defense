import { useState } from 'react'

export default function EINSubmitBar({ onSubmit, loading }) {
  const [ein, setEin] = useState('')

  function handleSubmit() {
    if (ein.trim()) {
      onSubmit(ein.trim())
      setEin('')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex gap-3 mb-8">
      <input
        type="text"
        value={ein}
        onChange={e => setEin(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter entity EIN or organization name..."
        className="flex-1 rounded-lg px-4 py-3 text-sm placeholder-gray-400 border border-gray-200 outline-none focus:border-gray-400"
        style={{ backgroundColor: '#ffffff', color: '#1a202c', fontFamily: 'monospace' }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !ein.trim()}
        className="px-6 py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ backgroundColor: loading || !ein.trim() ? '#0f4c75aa' : '#0f4c75' }}
      >
        {loading ? 'Verifying...' : 'Verify →'}
      </button>
    </div>
  )
}