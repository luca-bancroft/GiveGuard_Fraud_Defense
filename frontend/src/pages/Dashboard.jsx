import { useState } from 'react'
import MetricCards from '../components/MetricCards.jsx'
import EINSubmitBar from '../components/EINSubmitBar.jsx'
import SubmissionTable from '../components/SubmissionTable.jsx'
import DetailPanel from '../components/DetailPanel.jsx'
import Sidebar from '../components/Sidebar.jsx'

const ALL_SUBMISSIONS = [
  {
    ein: '52-1234567', org_name: 'Bulldog Food Pantry', trust_score: 94,
    verdict: 'verified', top_flag: null,
    irs_lookup: { ein_exists: true, active_status: 'Active', filing_990: true, ntee_code: 'K30', ruling_date: '2016-03-15' }
  },
  {
    ein: '47-9876543', org_name: 'Athens Arts Coalition', trust_score: 71,
    verdict: 'flagged', top_flag: 'Mission/category mismatch',
    irs_lookup: { ein_exists: true, active_status: 'Active', filing_990: true, ntee_code: 'A99', ruling_date: '2020-07-01' },
    signals: [{ flag: 'Mission/category mismatch', risk_points: 20 }]
  },
  {
    ein: '99-8887776', org_name: 'Dawg Nation Relief Fund LLC', trust_score: 8,
    verdict: 'blocked', top_flag: 'Registered less than 30 days ago',
    irs_lookup: { ein_exists: true, active_status: 'Pending', filing_990: false, ntee_code: 'T99', ruling_date: '2026-03-23' },
    signals: [
      { flag: 'Registered less than 30 days ago', risk_points: 40 },
      { flag: 'No IRS 990 filing on record',       risk_points: 30 },
      { flag: 'NTEE category mismatch',            risk_points: 20 },
      { flag: 'High-risk state of incorporation',  risk_points: 10 },
    ]
  },
  {
    ein: '23-4567890', org_name: 'UGA Scholarship Foundation', trust_score: 91,
    verdict: 'verified', top_flag: null,
    irs_lookup: { ein_exists: true, active_status: 'Active', filing_990: true, ntee_code: 'B82', ruling_date: '2012-01-10' }
  },
]

const FILTERS = {
  dashboard: null,
  verified:  'verified',
  flagged:   'flagged',
  blocked:   'blocked',
}

export default function Dashboard() {
  const [submissions, setSubmissions] = useState(ALL_SUBMISSIONS)
  const [loading, setLoading]         = useState(false)
  const [selected, setSelected]       = useState(null)
  const [activePage, setActivePage]   = useState('dashboard')

  const filter = FILTERS[activePage]
  const visible = filter
    ? submissions.filter(s => s.verdict === filter)
    : submissions

  function handleSubmit(ein) {
    setLoading(true)
    setTimeout(() => {
      const score   = Math.floor(Math.random() * 100)
      const verdict = score >= 75 ? 'verified' : score >= 40 ? 'flagged' : 'blocked'
      const mock = {
        ein,
        org_name: 'Test Organization',
        trust_score: score,
        verdict,
        top_flag: verdict === 'verified' ? null : 'Mock signal for testing',
        irs_lookup: { ein_exists: true, active_status: 'Active', filing_990: true, ntee_code: 'T00', ruling_date: '2022-06-01' },
        signals: verdict === 'verified' ? [] : [
          { flag: 'Mock signal one', risk_points: 30 },
          { flag: 'Mock signal two', risk_points: 20 },
        ]
      }
      setSubmissions(prev => [mock, ...prev])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 mb-1">
        <i className="fa-solid fa-shield text-green-400 text-2xl"></i>
        <h1 className="text-2xl font-bold text-white">GiveGuard</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">Nonprofit Fraud Defense</p>

      <MetricCards submissions={submissions} />
      <EINSubmitBar onSubmit={handleSubmit} loading={loading} />

      {/* Mobile tab bar sits above table */}
      <div className="md:hidden">
        <Sidebar active={activePage} onChange={page => { setActivePage(page); setSelected(null) }} />
      </div>

      <div className="flex gap-5 items-start">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar active={activePage} onChange={page => { setActivePage(page); setSelected(null) }} />
        </div>

        <div className="flex-1 min-w-0">
          <SubmissionTable submissions={visible} onSelect={setSelected} />
        </div>

        <DetailPanel submission={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  )
}