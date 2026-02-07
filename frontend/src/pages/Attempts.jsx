import { useState } from 'react'

export function Attempts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [attempts, setAttempts] = useState([
    {
      id: 1,
      candidate: 'Alex Johnson',
      test: 'Java Middle v.1',
      completed: false,
      lastSend: '3 days ago',
      status: 'pending',
      score: null,
      timeSpent: null,
    },
    {
      id: 2,
      candidate: 'Maria Garcia',
      test: 'Python Backend',
      completed: true,
      lastSend: '3 days ago',
      status: 'completed',
      score: 85,
      timeSpent: '45 min',
    },
    {
      id: 3,
      candidate: 'David Chen',
      test: 'DevOps',
      completed: false,
      lastSend: '3 days ago',
      status: 'expired',
      score: null,
      timeSpent: null,
    },
    {
      id: 4,
      candidate: 'Sarah Williams',
      test: 'Frontend React',
      completed: true,
      lastSend: '1 day ago',
      status: 'completed',
      score: 92,
      timeSpent: '60 min',
    },
  ])

  const [filters, setFilters] = useState({
    status: '',
    completed: '',
  })

  const [newAttempt, setNewAttempt] = useState({
    candidateId: '',
    testId: '',
    link: '',
    autosend: false,
  })

  // Пример данных для выпадающих списков
  const [candidates] = useState([
    { id: 1, name: 'Alex Johnson', email: 'alex@email.com' },
    { id: 2, name: 'Maria Garcia', email: 'maria@email.com' },
    { id: 3, name: 'David Chen', email: 'david@email.com' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@email.com' },
  ])

  const [tests] = useState([
    { id: 1, name: 'Java Middle v.1', questions: 15, timeLimit: 60 },
    { id: 2, name: 'Python Backend', questions: 20, timeLimit: 90 },
    { id: 3, name: 'DevOps', questions: 25, timeLimit: 120 },
    { id: 4, name: 'Frontend React', questions: 18, timeLimit: 75 },
  ])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    console.log('Searching attempts:', searchQuery)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewAttempt((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCreateAttempt = (e) => {
    e.preventDefault()

    const selectedCandidate = candidates.find(
      (c) => c.id == newAttempt.candidateId
    )
    const selectedTest = tests.find((t) => t.id == newAttempt.testId)

    if (selectedCandidate && selectedTest) {
      const newAttemptObj = {
        id: attempts.length + 1,
        candidate: selectedCandidate.name,
        test: selectedTest.name,
        completed: false,
        lastSend: 'Just now',
        status: 'pending',
        score: null,
        timeSpent: null,
      }

      setAttempts([...attempts, newAttemptObj])
      setNewAttempt({
        candidateId: '',
        testId: '',
        link: '',
        autosend: false,
      })

      console.log('Created attempt:', newAttemptObj)
    }
  }

  const handleDeleteAttempt = (id) => {
    setAttempts(attempts.filter((attempt) => attempt.id !== id))
  }

  const handleEditAttempt = (attempt) => {
    console.log('Editing attempt:', attempt)
  }

  const handleViewDetails = (attempt) => {
    console.log('Viewing details for:', attempt)
  }

  const handleResendAttempt = (attempt) => {
    console.log('Resending attempt:', attempt)
  }

  const handleClearForm = () => {
    setNewAttempt({
      candidateId: '',
      testId: '',
      link: '',
      autosend: false,
    })
  }

  // Фильтрация попыток
  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      attempt.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.test.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !filters.status || attempt.status === filters.status
    const matchesCompleted =
      filters.completed === '' ||
      (filters.completed === 'true' && attempt.completed) ||
      (filters.completed === 'false' && !attempt.completed)

    return matchesSearch && matchesStatus && matchesCompleted
  })

  // Генерация ссылки
  const generateLink = () => {
    const randomId = Math.random().toString(36).substr(2, 9)
    const link = `https://interview-system.com/test/${randomId}`
    setNewAttempt((prev) => ({ ...prev, link }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Основной контейнер с двумя колонками */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ЛЕВАЯ КОЛОНКА: Список попыток */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
              {/* Заголовок */}
              <header className="px-4 md:px-6 py-4 border-b border-zinc-200">
                <h1 className="text-neutral-700 text-xl md:text-2xl font-extrabold font-['Inter']">
                  Attempts
                </h1>
              </header>

              {/* Поиск и фильтры */}
              <div className="p-4 md:p-6 border-b border-zinc-200 space-y-4">
                {/* Форма поиска */}
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
                      placeholder="Search attempt by candidate or test..."
                      className="w-full px-4 py-3 text-neutral-700 text-sm font-normal bg-white rounded-lg border border-zinc-200 outline-none placeholder:text-neutral-400"
                      aria-label="Search attempts"
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

                {/* Фильтры */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm font-normal"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                  </select>

                  <select
                    name="completed"
                    value={filters.completed}
                    onChange={handleFilterChange}
                    className="px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm font-normal"
                  >
                    <option value="">All</option>
                    <option value="true">Completed</option>
                    <option value="false">Not Completed</option>
                  </select>

                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      Showing {filteredAttempts.length} of {attempts.length}{' '}
                      attempts
                    </span>
                  </div>
                </div>
              </div>

              {/* Таблица попыток - АДАПТИВНАЯ БЕЗ ГОРИЗОНТАЛЬНОГО СКРОЛЛА */}
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
                      Completed
                    </span>
                  </div>
                  <div className="col-span-1 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Last Send
                    </span>
                  </div>
                  <div className="col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Actions
                    </span>
                  </div>
                </div>

                {/* Список попыток */}
                <div>
                  {filteredAttempts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 px-4">
                      No attempts found.{' '}
                      {searchQuery
                        ? 'Try different search'
                        : 'Create new attempt'}
                    </div>
                  ) : (
                    filteredAttempts.map((attempt, index) => (
                      <div
                        key={attempt.id}
                        className={`border-b border-zinc-200 hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        {/* Мобильная карточка */}
                        <div className="md:hidden p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-neutral-700 text-sm font-medium">
                                  {attempt.candidate}
                                </div>
                                <div className="text-neutral-500 text-sm mt-1">
                                  {attempt.test}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    attempt.completed
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {attempt.completed
                                    ? 'Completed'
                                    : 'Not Completed'}
                                </span>
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    attempt.status === 'completed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : attempt.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {attempt.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>Last send: {attempt.lastSend}</span>
                              {attempt.score && (
                                <span>Score: {attempt.score}%</span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {!attempt.completed && (
                                <button
                                  onClick={() => handleResendAttempt(attempt)}
                                  className="px-3 py-1.5 bg-blue-600 rounded text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                                >
                                  Resend
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(attempt)}
                                className="px-3 py-1.5 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleEditAttempt(attempt)}
                                className="px-3 py-1.5 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAttempt(attempt.id)}
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
                              {attempt.candidate}
                            </div>
                            <div
                              className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                                attempt.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : attempt.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {attempt.status}
                            </div>
                          </div>

                          {/* Тест */}
                          <div className="col-span-4 p-4">
                            <div className="text-neutral-700 text-sm font-normal">
                              {attempt.test}
                            </div>
                            {attempt.score && (
                              <div className="text-neutral-500 text-xs mt-1">
                                Score: {attempt.score}% • Time:{' '}
                                {attempt.timeSpent}
                              </div>
                            )}
                          </div>

                          {/* Выполнено */}
                          <div className="col-span-2 p-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                attempt.completed
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}
                            >
                              {attempt.completed ? 'True' : 'False'}
                            </span>
                          </div>

                          {/* Последняя отправка */}
                          <div className="col-span-1 p-4">
                            <div className="text-neutral-700 text-sm font-normal">
                              {attempt.lastSend}
                            </div>
                          </div>

                          {/* Действия */}
                          <div className="col-span-2 p-4">
                            <div className="flex flex-wrap gap-1">
                              {!attempt.completed && (
                                <button
                                  onClick={() => handleResendAttempt(attempt)}
                                  className="px-2 py-1 bg-blue-600 rounded text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                                  title="Resend"
                                >
                                  Resend
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(attempt)}
                                className="px-2 py-1 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                                title="View Details"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleEditAttempt(attempt)}
                                className="px-2 py-1 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAttempt(attempt.id)}
                                className="px-2 py-1 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors"
                                title="Delete"
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

          {/* ПРАВАЯ КОЛОНКА: Создание новой попытки */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
              {/* Заголовок формы */}
              <header className="px-6 py-4 border-b border-zinc-200">
                <h2 className="text-neutral-700 text-xl font-extrabold font-['Inter'] text-center">
                  Create New Attempt
                </h2>
              </header>

              {/* Форма создания попытки */}
              <form
                onSubmit={handleCreateAttempt}
                className="p-4 md:p-6 space-y-6"
              >
                {/* Выбор кандидата */}
                <div>
                  <label className="block text-neutral-700 text-sm font-medium mb-2">
                    Choose Candidate
                  </label>
                  <select
                    name="candidateId"
                    value={newAttempt.candidateId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    required
                  >
                    <option value="">Select candidate</option>
                    {candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Выбор теста */}
                <div>
                  <label className="block text-neutral-700 text-sm font-medium mb-2">
                    Choose Test
                  </label>
                  <select
                    name="testId"
                    value={newAttempt.testId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    required
                  >
                    <option value="">Select test</option>
                    {tests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.name} ({test.questions} questions,{' '}
                        {test.timeLimit} min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ссылка */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-neutral-700 text-sm font-medium">
                      Test Link
                    </label>
                    <button
                      type="button"
                      onClick={generateLink}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Generate Link
                    </button>
                  </div>
                  <input
                    type="text"
                    name="link"
                    value={newAttempt.link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    placeholder="Test link will be generated automatically"
                    readOnly
                  />
                </div>

                {/* Автоотправка */}
                <div className="flex items-center space-x-3 pt-4">
                  <input
                    type="checkbox"
                    id="autosend"
                    name="autosend"
                    checked={newAttempt.autosend}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border border-zinc-300"
                  />
                  <label
                    htmlFor="autosend"
                    className="text-neutral-700 text-sm font-medium"
                  >
                    Send automatically to candidate's email
                  </label>
                </div>

                {/* Кнопки */}
                <div className="flex justify-center gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-slate-500 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors"
                  >
                    Create Attempt
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
