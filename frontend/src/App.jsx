import { BrowserRouter, Routes, Route, Link } from "react-router";
import { Questions } from "./pages/Questions"
import { Tests } from "./pages/Tests"
import { Candidates } from "./pages/Candidates"
import { Attempts } from "./pages/Attempts"
import { Results } from "./pages/Results"

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/questions">Questions</Link>
        <Link to="/tests">Tests</Link>
        <Link to="/candidates">Candidates</Link>
        <Link to="/attempts">Attempts</Link>
        <Link to="/results">Results</Link>
      </nav>
      <Routes>
        <Route path="/questions" element={<Questions />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/attempts" element={<Attempts />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
