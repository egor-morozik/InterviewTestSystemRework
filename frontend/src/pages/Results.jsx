import { useState } from "react";

export function Results() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([
    {
      id: 1,
      candidate: "Alex Johnson",
      test: "Java Middle v.1",
      autoResult: 20,
      manualGrade: 50,
      status: "evaluated",
      dateCompleted: "2024-01-20",
      timeSpent: "45 min"
    },
    {
      id: 2,
      candidate: "Maria Garcia",
      test: "Python Backend",
      autoResult: 100,
      manualGrade: null,
      status: "completed",
      dateCompleted: "2024-01-18",
      timeSpent: "60 min"
    },
    {
      id: 3,
      candidate: "David Chen",
      test: "DevOps",
      autoResult: 50,
      manualGrade: null,
      status: "completed",
      dateCompleted: "2024-01-22",
      timeSpent: "30 min"
    },
    {
      id: 4,
      candidate: "Sarah Williams",
      test: "Frontend React",
      autoResult: 85,
      manualGrade: 90,
      status: "evaluated",
      dateCompleted: "2024-01-19",
      timeSpent: "55 min"
    }
  ]);

  const [filters, setFilters] = useState({
    status: "",
    minScore: "",
    maxScore: ""
  });

  const [sortBy, setSortBy] = useState("date");
  const [selectedResult, setSelectedResult] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching results:", searchQuery);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleDeleteResult = (id) => {
    setResults(results.filter(result => result.id !== id));
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
    console.log("Viewing result:", result);
  };

  const handleEvaluateResult = (result) => {
    console.log("Evaluating result:", result);
    // Открыть модальное окно для оценки
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      minScore: "",
      maxScore: ""
    });
    setSortBy("date");
  };

  // Фильтрация и сортировка результатов
  const filteredResults = results
    .filter(result => {
      const matchesSearch = 
        result.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.test.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !filters.status || result.status === filters.status;
      
      const matchesMinScore = !filters.minScore || 
        (result.manualGrade || result.autoResult) >= parseInt(filters.minScore);
      
      const matchesMaxScore = !filters.maxScore || 
        (result.manualGrade || result.autoResult) <= parseInt(filters.maxScore);
      
      return matchesSearch && matchesStatus && matchesMinScore && matchesMaxScore;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case "score":
          return (b.manualGrade || b.autoResult) - (a.manualGrade || a.autoResult);
        case "name":
          return a.candidate.localeCompare(b.candidate);
        case "date":
        default:
          return new Date(b.dateCompleted) - new Date(a.dateCompleted);
      }
    });

  // Функция для получения цвета оценки
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'evaluated': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Основной контейнер с двумя колонками */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* ЛЕВАЯ КОЛОНКА: Список результатов (2/3 ширины) */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
              
              {/* Заголовок */}
              <header className="px-4 md:px-6 py-4 border-b border-zinc-200">
                <h1 className="text-neutral-700 text-xl md:text-2xl font-extrabold font-['Inter']">
                  Results
                </h1>
              </header>
              
              {/* Поиск */}
              <div className="p-4 md:p-6 border-b border-zinc-200">
                <form 
                  onSubmit={handleSearchSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                  role="search"
                >
                  <div className="flex-1">
                    <input 
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search result by candidate or test..."
                      className="w-full px-4 py-3 text-neutral-700 text-sm font-normal bg-white rounded-lg border border-zinc-200 outline-none placeholder:text-neutral-400"
                      aria-label="Search results"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-slate-500 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors whitespace-nowrap"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </form>
              </div>
              
              {/* Таблица результатов - АДАПТИВНАЯ БЕЗ ГОРИЗОНТАЛЬНОГО СКРОЛЛА */}
              <div className="overflow-hidden">
                {/* Заголовки таблицы для десктопа */}
                <div className="hidden md:grid md:grid-cols-12 bg-gray-50 border-b border-zinc-200">
                  <div className="col-span-3 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Candidate
                    </span>
                  </div>
                  <div className="col-span-4 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Test
                    </span>
                  </div>
                  <div className="col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Result
                    </span>
                  </div>
                  <div className="col-span-1 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Manual Grade
                    </span>
                  </div>
                  <div className="col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Actions
                    </span>
                  </div>
                </div>
                
                {/* Список результатов */}
                <div>
                  {filteredResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 px-4">
                      No results found. {searchQuery ? "Try different search" : "There are no test results yet"}
                    </div>
                  ) : (
                    filteredResults.map((result, index) => (
                      <div 
                        key={result.id}
                        className={`border-b border-zinc-200 hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        {/* Мобильная карточка */}
                        <div className="md:hidden p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="text-neutral-700 text-sm font-medium">
                                  {result.candidate}
                                </div>
                                <div className="text-neutral-500 text-sm">
                                  {result.test}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                                  {result.status === 'evaluated' ? 'Evaluated' : 'Completed'}
                                </span>
                                <div className="text-xs text-gray-500">
                                  {result.dateCompleted}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500">Auto Result</div>
                                <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(result.autoResult)}`}>
                                  {result.autoResult}%
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500">Manual Grade</div>
                                <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${
                                  result.manualGrade 
                                    ? getScoreColor(result.manualGrade)
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                  {result.manualGrade ? `${result.manualGrade}%` : '-'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-3">
                              <button 
                                onClick={() => handleViewResult(result)}
                                className="px-3 py-1.5 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => handleEvaluateResult(result)}
                                className="px-3 py-1.5 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                              >
                                Evaluate
                              </button>
                              <button 
                                onClick={() => handleDeleteResult(result.id)}
                                className="px-3 py-1.5 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Десктопная строка */}
                        <div className="hidden md:grid md:grid-cols-12">
                          {/* Кандидат */}
                          <div className="col-span-3 p-4">
                            <div className="text-neutral-700 text-sm font-medium">
                              {result.candidate}
                            </div>
                            <div className="text-neutral-500 text-xs mt-1">
                              {result.dateCompleted} • {result.timeSpent}
                            </div>
                          </div>
                          
                          {/* Тест */}
                          <div className="col-span-4 p-4">
                            <div className="text-neutral-700 text-sm font-normal">
                              {result.test}
                            </div>
                            <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(result.status)}`}>
                              {result.status === 'evaluated' ? 'Evaluated' : 'Completed'}
                            </div>
                          </div>
                          
                          {/* Результат */}
                          <div className="col-span-2 p-4">
                            <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(result.autoResult)}`}>
                              {result.autoResult}%
                            </div>
                          </div>
                          
                          {/* Ручная оценка */}
                          <div className="col-span-1 p-4">
                            <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${
                              result.manualGrade 
                                ? getScoreColor(result.manualGrade)
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {result.manualGrade ? `${result.manualGrade}%` : '-'}
                            </div>
                          </div>
                          
                          {/* Действия */}
                          <div className="col-span-2 p-4">
                            <div className="flex flex-wrap gap-1">
                              <button 
                                onClick={() => handleViewResult(result)}
                                className="px-2 py-1 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                                title="View Details"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => handleEvaluateResult(result)}
                                className="px-2 py-1 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                                title="Evaluate Result"
                              >
                                Evaluate
                              </button>
                              <button 
                                onClick={() => handleDeleteResult(result.id)}
                                className="px-2 py-1 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors"
                                title="Delete Result"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* ПРАВАЯ КОЛОНКА: Сортировка и фильтры (1/3 ширины) */}
          <div className="lg:w-1/3">
            <div className="space-y-6">
              {/* Сортировка */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
                <header className="px-6 py-4 border-b border-zinc-200">
                  <h2 className="text-neutral-700 text-xl font-extrabold font-['Inter'] text-center">
                    Sort
                  </h2>
                </header>
                
                <div className="p-4 md:p-6 space-y-4">
                  <div className="space-y-3">
                    <label className="block text-neutral-700 text-sm font-medium">
                      Sort by:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="sort"
                          value="date"
                          checked={sortBy === "date"}
                          onChange={handleSortChange}
                          className="w-4 h-4 text-slate-500"
                        />
                        <span className="text-neutral-700 text-sm">Date (Newest first)</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="sort"
                          value="score"
                          checked={sortBy === "score"}
                          onChange={handleSortChange}
                          className="w-4 h-4 text-slate-500"
                        />
                        <span className="text-neutral-700 text-sm">Score (Highest first)</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="sort"
                          value="name"
                          checked={sortBy === "name"}
                          onChange={handleSortChange}
                          className="w-4 h-4 text-slate-500"
                        />
                        <span className="text-neutral-700 text-sm">Candidate Name (A-Z)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Фильтры */}
              <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
                <header className="px-6 py-4 border-b border-zinc-200">
                  <h2 className="text-neutral-700 text-xl font-extrabold font-['Inter'] text-center">
                    Filter
                  </h2>
                </header>
                
                <div className="p-4 md:p-6 space-y-6">
                  {/* Статус */}
                  <div>
                    <label className="block text-neutral-700 text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="evaluated">Evaluated</option>
                    </select>
                  </div>
                  
                  {/* Диапазон оценок */}
                  <div className="space-y-3">
                    <label className="block text-neutral-700 text-sm font-medium">
                      Score Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="number"
                          name="minScore"
                          value={filters.minScore}
                          onChange={handleFilterChange}
                          min="0"
                          max="100"
                          placeholder="Min"
                          className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="maxScore"
                          value={filters.maxScore}
                          onChange={handleFilterChange}
                          min="0"
                          max="100"
                          placeholder="Max"
                          className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Кнопка очистки */}
                  <button 
                    type="button"
                    onClick={handleClearFilters}
                    className="w-full px-4 py-3 bg-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Модальное окно деталей результата */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-neutral-700">
                    Result Details
                  </h3>
                  <button 
                    onClick={() => setSelectedResult(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Candidate</div>
                      <div className="font-medium">{selectedResult.candidate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Test</div>
                      <div className="font-medium">{selectedResult.test}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Date Completed</div>
                      <div>{selectedResult.dateCompleted}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time Spent</div>
                      <div>{selectedResult.timeSpent}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Auto Result</div>
                      <div className={`inline-block px-3 py-1.5 rounded-full font-bold ${getScoreColor(selectedResult.autoResult)}`}>
                        {selectedResult.autoResult}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Manual Grade</div>
                      <div className={`inline-block px-3 py-1.5 rounded-full font-bold ${
                        selectedResult.manualGrade 
                          ? getScoreColor(selectedResult.manualGrade)
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedResult.manualGrade ? `${selectedResult.manualGrade}%` : 'Not graded'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <button 
                      onClick={() => {
                        handleEvaluateResult(selectedResult);
                        setSelectedResult(null);
                      }}
                      className="w-full py-2 bg-purple-800 rounded text-white hover:bg-purple-900 transition-colors"
                    >
                      Evaluate Result
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}