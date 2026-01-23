import { BrowserRouter, Routes, Route, Link } from "react-router";
import { Questions } from "./pages/Questions"
import { Tests } from "./pages/Tests"
import { Candidates } from "./pages/Candidates"
import { Attempts } from "./pages/Attempts"
import { Results } from "./pages/Results"

function App() {
  return (
    <BrowserRouter>
      <div className="w-[1920px] h-[1080px] relative bg-slate-100 overflow-hidden">
        
        <header className="w-[1920px] h-12 left-0 top-0 absolute bg-white overflow-hidden">
          <div className="w-48 h-12 left-[20px] top-0 absolute">
            <div className="w-48 h-9 left-0 top-[7px] absolute justify-center text-slate-500 text-2xl font-extrabold font-['Inter'] leading-8">
              Interview System
            </div>
          </div>
        </header>

        <nav className="w-[1880px] h-12 left-[20px] top-[50px] absolute bg-white outline outline-2 outline-offset-[-2px] outline-neutral-100 overflow-hidden">
          <div className="w-36 h-11 left-[2px] top-[2px] absolute border-b-[3px] border-slate-500 overflow-hidden">
            <Link 
              to="/questions" 
              className="w-20 h-5 left-[38px] top-[12px] absolute justify-start text-slate-500 text-sm font-extrabold font-['Inter'] leading-5"
            >
              Questions
            </Link>
          </div>
          
          <div className="w-36 h-11 left-[157px] top-[2px] absolute bg-white overflow-hidden">
            <Link 
              to="/tests" 
              className="w-9 h-5 left-[56px] top-[12px] absolute justify-start text-neutral-700 text-sm font-normal font-['Inter'] leading-5"
            >
              Tests
            </Link>
          </div>
          
          <div className="w-36 h-11 left-[312px] top-[2px] absolute bg-white overflow-hidden">
            <Link 
              to="/candidates" 
              className="w-20 h-5 left-[36px] top-[12px] absolute justify-start text-neutral-700 text-sm font-normal font-['Inter'] leading-5"
            >
              Candidates
            </Link>
          </div>
          
          <div className="w-36 h-11 left-[467px] top-[2px] absolute bg-white overflow-hidden">
            <Link 
              to="/attempts" 
              className="w-16 h-5 left-[43px] top-[12px] absolute justify-start text-neutral-700 text-sm font-normal font-['Inter'] leading-5"
            >
              Attempts
            </Link>
          </div>
          
          <div className="w-36 h-11 left-[622px] top-[2px] absolute bg-white overflow-hidden">
            <Link 
              to="/results" 
              className="w-12 h-5 left-[49px] top-[12px] absolute justify-start text-neutral-700 text-sm font-normal font-['Inter'] leading-5"
            >
              Results
            </Link>
          </div>
        </nav>

        <main className="w-[1880px] h-[950px] left-[20px] top-[115px] absolute bg-slate-100 rounded-[10px] overflow-hidden">
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
