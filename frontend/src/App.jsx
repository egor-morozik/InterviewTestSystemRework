import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Questions } from './pages/Questions'
import { Tests } from './pages/Tests'
import { Candidates } from './pages/Candidates'
import { Attempts } from './pages/Attempts'
import { Results } from './pages/Results'
import { CandidateTest } from './pages/CandidateTest'

function App() {
  const navLinkStyles = ({ isActive }) =>
    `px-6 py-3 text-sm font-extrabold transition-colors ${
      isActive
        ? 'border-b-2 border-slate-500 text-slate-500'
        : 'text-neutral-700 hover:bg-gray-100 border-b-2 border-transparent'
    }`

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test/:id" element={<CandidateTestLayout />} />

        <Route
          path="*"
          element={<AdminLayout navLinkStyles={navLinkStyles} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

function AdminLayout({ navLinkStyles }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-12 bg-white flex items-center px-5 shrink-0 shadow-sm">
        <div className="text-slate-500 text-2xl font-extrabold font-['Inter']">
          Interview System
        </div>
      </header>

      <nav className="mx-5 mt-2 bg-white flex border border-neutral-100 shrink-0">
        <NavLink title="Questions" to="/questions" className={navLinkStyles}>
          Questions
        </NavLink>
        <NavLink title="Tests" to="/tests" className={navLinkStyles}>
          Tests
        </NavLink>
        <NavLink title="Candidates" to="/candidates" className={navLinkStyles}>
          Candidates
        </NavLink>
        <NavLink title="Attempts" to="/attempts" className={navLinkStyles}>
          Attempts
        </NavLink>
        <NavLink title="Results" to="/results" className={navLinkStyles}>
          Results
        </NavLink>
      </nav>

      <main className="flex-1 mx-5 mt-4 bg-white rounded-t-lg shadow-inner overflow-auto">
        <Routes>
          <Route path="/" element={<Questions />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/attempts" element={<Attempts />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>
    </div>
  )
}

function CandidateTestLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CandidateTest />
    </div>
  )
}

export default App
