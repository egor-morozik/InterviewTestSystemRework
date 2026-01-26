import { BrowserRouter, Routes, Route, Link } from "react-router";
import { Questions } from "./pages/Questions"
import { Tests } from "./pages/Tests"
import { Candidates } from "./pages/Candidates"
import { Attempts } from "./pages/Attempts"
import { Results } from "./pages/Results"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        
        <header className="h-12 bg-white flex items-center px-5 shrink-0 shadow-sm">
          <div className="text-slate-500 text-2xl font-extrabold font-['Inter']">
            Interview System
          </div>
        </header>

        <nav className="mx-5 mt-2 bg-white flex border border-neutral-100 shrink-0">
          <Link to="/questions" className="px-6 py-3 border-b-2 border-slate-500 text-slate-500 text-sm font-extrabold">
            Questions
          </Link>
          <Link to="/tests" className="px-6 py-3 text-neutral-700 text-sm hover:bg-gray-100">
            Tests
          </Link>
          <Link to="/candidates" className="px-6 py-3 text-neutral-700 text-sm hover:bg-gray-100">
            Candidates
          </Link>
          <Link to="/attempts" className="px-6 py-3 text-neutral-700 text-sm hover:bg-gray-100">
            Attempts
          </Link>
          <Link to="/results" className="px-6 py-3 text-neutral-700 text-sm hover:bg-gray-100">
            Results
          </Link>          
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
    </BrowserRouter>
  );
}

export default App;
