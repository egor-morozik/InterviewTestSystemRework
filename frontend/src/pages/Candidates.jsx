import { useState } from 'react'

export function Candidates() {
  const [searchQuery, setSearchQuery] = useState('')
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      position: 'Frontend Developer',
      status: 'active',
      dateAdded: '2024-01-15',
      testsCompleted: 3,
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      position: 'Backend Developer',
      status: 'completed',
      dateAdded: '2024-01-10',
      testsCompleted: 5,
    },
    {
      id: 3,
      name: 'David Chen',
      email: 'david.chen@email.com',
      position: 'Full Stack Developer',
      status: 'pending',
      dateAdded: '2024-01-20',
      testsCompleted: 1,
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.w@email.com',
      position: 'DevOps Engineer',
      status: 'active',
      dateAdded: '2024-01-18',
      testsCompleted: 2,
    },
  ])

  const [filters, setFilters] = useState({
    status: '',
    position: '',
  })

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    position: '',
    status: 'pending',
    notes: '',
  })

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    console.log('Searching candidates:', searchQuery)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewCandidate((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImportCandidates = () => {
    console.log('Importing candidates')
  }

  const handleAddCandidate = (e) => {
    e.preventDefault()
    const newCandidateWithId = {
      ...newCandidate,
      id: candidates.length + 1,
      dateAdded: new Date().toISOString().split('T')[0],
      testsCompleted: 0,
    }

    setCandidates([...candidates, newCandidateWithId])
    setNewCandidate({
      name: '',
      email: '',
      position: '',
      status: 'pending',
      notes: '',
    })
    console.log('Added candidate:', newCandidateWithId)
  }

  const handleDeleteCandidate = (id) => {
    setCandidates(candidates.filter((candidate) => candidate.id !== id))
  }

  const handleEditCandidate = (candidate) => {
    console.log('Editing candidate:', candidate)
  }

  const handleViewDetails = (candidate) => {
    console.log('Viewing details for:', candidate)
  }

  const handleSendTest = (candidate) => {
    console.log('Sending test to:', candidate)
  }

  const handleClearForm = () => {
    setNewCandidate({
      name: '',
      email: '',
      position: '',
      status: 'pending',
      notes: '',
    })
  }

  // Фильтрация кандидатов
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !filters.status || candidate.status === filters.status
    const matchesPosition =
      !filters.position ||
      candidate.position.toLowerCase().includes(filters.position.toLowerCase())

    return matchesSearch && matchesStatus && matchesPosition
  })

  // Функция для получения цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Функция для получения текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Основной контейнер с двумя колонками */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ЛЕВАЯ КОЛОНКА: Список кандидатов */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
              {/* Заголовок и кнопка импорта */}
              <header className="px-4 md:px-6 py-4 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-neutral-700 text-xl md:text-2xl font-extrabold font-['Inter']">
                  Candidates
                </h1>

                <button
                  onClick={handleImportCandidates}
                  className="px-4 py-2 bg-slate-500 rounded text-white text-sm font-medium hover:bg-slate-600 transition-colors whitespace-nowrap"
                  aria-label="Import candidates"
                >
                  Import Candidates
                </button>
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
                      placeholder="Search candidate by name, email or position..."
                      className="w-full px-4 py-3 text-neutral-700 text-sm font-normal bg-white rounded-lg border border-zinc-200 outline-none placeholder:text-neutral-400"
                      aria-label="Search candidates"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm font-normal"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>

                  <select
                    name="position"
                    value={filters.position}
                    onChange={handleFilterChange}
                    className="px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm font-normal"
                  >
                    <option value="">All Positions</option>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Developer</option>
                    <option value="fullstack">Full Stack Developer</option>
                    <option value="devops">DevOps Engineer</option>
                  </select>

                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      Showing {filteredCandidates.length} of {candidates.length}{' '}
                      candidates
                    </span>
                  </div>
                </div>
              </div>

              {/* Таблица кандидатов */}
              <div className="overflow-x-auto">
                {/* Заголовки таблицы */}
                <div className="grid grid-cols-12 bg-gray-50 border-b border-zinc-200 min-w-200">
                  <div className="col-span-12 md:col-span-4 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Name & Email
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Position
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Status
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-2 p-4 hidden md:block">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Date Added
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Actions
                    </span>
                  </div>
                </div>

                {/* Список кандидатов */}
                <div className="min-w-200">
                  {filteredCandidates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No candidates found.{' '}
                      {searchQuery
                        ? 'Try different search'
                        : 'Import or add candidates'}
                    </div>
                  ) : (
                    filteredCandidates.map((candidate, index) => (
                      <div
                        key={candidate.id}
                        className={`grid grid-cols-12 border-b border-zinc-200 hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        {/* Имя и Email */}
                        <div className="col-span-12 md:col-span-4 p-4">
                          <div className="space-y-1">
                            <div className="text-neutral-700 text-sm font-medium font-['Inter']">
                              {candidate.name}
                            </div>
                            <div className="text-neutral-500 text-xs">
                              {candidate.email}
                            </div>
                          </div>
                        </div>

                        {/* Позиция */}
                        <div className="col-span-6 md:col-span-2 p-4">
                          <div className="text-neutral-700 text-sm font-normal font-['Inter']">
                            {candidate.position}
                          </div>
                          <div className="text-neutral-500 text-xs">
                            {candidate.testsCompleted} tests
                          </div>
                        </div>

                        {/* Статус */}
                        <div className="col-span-6 md:col-span-2 p-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}
                          >
                            {getStatusText(candidate.status)}
                          </span>
                        </div>

                        {/* Дата добавления */}
                        <div className="col-span-12 md:col-span-2 p-4 hidden md:block">
                          <div className="text-neutral-700 text-sm font-normal">
                            {new Date(candidate.dateAdded).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Действия */}
                        <div className="col-span-12 md:col-span-2 p-4">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => handleSendTest(candidate)}
                              className="px-2 py-1 bg-blue-600 rounded text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                              title="Send Test"
                            >
                              Send
                            </button>
                            <button
                              onClick={() => handleViewDetails(candidate)}
                              className="px-2 py-1 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                              title="View Details"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleEditCandidate(candidate)}
                              className="px-2 py-1 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCandidate(candidate.id)
                              }
                              className="px-2 py-1 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: Форма добавления кандидата */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
              {/* Заголовок формы */}
              <header className="px-6 py-4 border-b border-zinc-200">
                <h2 className="text-neutral-700 text-xl font-extrabold font-['Inter'] text-center">
                  Add New Candidate
                </h2>
              </header>

              {/* Форма добавления кандидата */}
              <form
                onSubmit={handleAddCandidate}
                className="p-4 md:p-6 space-y-6"
              >
                <div className="space-y-4">
                  {/* Имя */}
                  <div>
                    <label className="block text-neutral-700 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newCandidate.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-neutral-700 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newCandidate.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Позиция */}
                  <div>
                    <label className="block text-neutral-700 text-sm font-medium mb-2">
                      Position
                    </label>
                    <select
                      name="position"
                      value={newCandidate.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                      required
                    >
                      <option value="">Select position</option>
                      <option value="Frontend Developer">
                        Frontend Developer
                      </option>
                      <option value="Backend Developer">
                        Backend Developer
                      </option>
                      <option value="Full Stack Developer">
                        Full Stack Developer
                      </option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="QA Engineer">QA Engineer</option>
                    </select>
                  </div>

                  {/* Статус */}
                  <div>
                    <label className="block text-neutral-700 text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newCandidate.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Комментарий */}
                <div>
                  <label className="block text-neutral-700 text-sm font-medium mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={newCandidate.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm resize-none"
                    placeholder="Add any notes about this candidate..."
                    rows={3}
                  />
                </div>

                {/* Кнопки */}
                <div className="flex justify-center gap-4 pt-4">
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
                    Add Candidate
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
