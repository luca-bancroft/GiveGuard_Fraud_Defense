import { useState, useEffect } from 'react'
import { verifyEIN, getSubmissions } from '../api/giveguard.js'
import MetricCards from '../components/MetricCards.jsx'
import EINSubmitBar from '../components/EINSubmitBar.jsx'
import SubmissionTable from '../components/SubmissionTable.jsx'
import DetailPanel from '../components/DetailPanel.jsx'
import Sidebar from '../components/Sidebar.jsx'

const FILTERS = {
  dashboard: null,
  verified:  'verified',
  flagged:   'flagged',
  blocked:   'blocked',
}

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([])
  const [error, setError]             = useState(null)
  const [loading, setLoading]         = useState(false)
  const [selected, setSelected]       = useState(null)
  const [activePage, setActivePage]   = useState('dashboard')

  const filter = FILTERS[activePage]
  const visible = filter
    ? submissions.filter(s => s.verdict === filter)
    : submissions

  useEffect(() => {
    getSubmissions()
      .then(data => setSubmissions(data.submissions))
      .catch(() => setError('Could not load submissions'))
  }, [])

  async function handleSubmit(ein) {
    setLoading(true)
    setError(null)
    try {
      const result = await verifyEIN(ein, '')
      setSubmissions(prev => [result, ...prev])
    } catch (err) {
      setError('Verification failed — check the EIN and try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafb' }}>
      {/* Navbar */}
      <div className="w-full px-8 py-4 flex items-center gap-3" style={{ backgroundColor: '#0f4c75' }}>
        <i className="fa-solid fa-shield" style={{ color: '#1bc5a4', fontSize: '1.4rem' }}></i>
        <h1 className="text-xl font-bold text-white">GiveGuard</h1>
        <span className="text-white/40 text-sm ml-2">Fintech Fraud Intelligence</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <MetricCards submissions={submissions} />
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Verify entity</p>
        <EINSubmitBar onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg border text-red-600 text-sm" style={{ backgroundColor: '#fff5f5', borderColor: '#feb2b2' }}>
            {error}
          </div>
        )}

        <div className="md:hidden">
          <Sidebar active={activePage} onChange={page => { setActivePage(page); setSelected(null) }} />
        </div>

        <div className="flex gap-5 items-start">
          <div className="hidden md:block">
            <Sidebar active={activePage} onChange={page => { setActivePage(page); setSelected(null) }} />
          </div>

          <div className="flex-1 min-w-0">
            <SubmissionTable submissions={visible} onSelect={setSelected} />
          </div>

          <DetailPanel submission={selected} onClose={() => setSelected(null)} />
        </div>
      </div>
    </div>
  )
}