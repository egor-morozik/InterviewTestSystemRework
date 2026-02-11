import { useState, useEffect } from 'react'
import { candidateService } from '../api/implementations/candidateApi'

export function Candidates() {
  const [searchQuery, setSearchQuery] = useState('')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    status: '',
    position: '',
  })

  const [newCandidate, setNewCandidate] = useState({
    full_name: '',
    email: '',
    position: '',
    status: 'test',
  })

  // Загрузка кандидатов
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)
        setError(null)

        // Собираем параметры для API
        const params = {}

        if (searchQuery) {
          params.search = searchQuery
        }

        if (filters.status) {
          params.status = filters.status
        }

        if (filters.position) {
          params.position = filters.position
        }

        const response = await candidateService.getAllCandidates(params)
        setCandidates(response || [])
      } catch (err) {
        setError('Failed to load candidates')
        console.error('Error fetching candidates:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [searchQuery, filters.status, filters.position])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Поиск уже происходит при изменении searchQuery в useEffect
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
    // TODO: Реализовать импорт кандидатов
    alert('Import functionality will be implemented soon')
  }

  const handleAddCandidate = async (e) => {
    e.preventDefault()

    try {
      setError(null)

      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newCandidate.email)) {
        alert('Please enter a valid email address')
        return
      }

      // Создаем кандидата через API
      const response = await candidateService.createCandidate(newCandidate)

      // Добавляем нового кандидата в список
      setCandidates([...candidates, response])

      // Очищаем форму
      setNewCandidate({
        full_name: '',
        email: '',
        position: '',
        status: 'pending',
      })

      console.log('Added candidate:', response)
    } catch (err) {
      setError('Failed to add candidate')
      console.error('Error adding candidate:', err)
      alert('Failed to add candidate. Please try again.')
    }
  }

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return
    }

    try {
      setError(null)
      await candidateService.deleteCandidate(id)
      setCandidates(candidates.filter((candidate) => candidate.id !== id))
    } catch (err) {
      setError('Failed to delete candidate')
      console.error('Error deleting candidate:', err)
    }
  }

  const handleEditCandidate = (candidate) => {
    // TODO: Реализовать редактирование кандидата
    console.log('Editing candidate:', candidate)
    alert('Edit functionality will be implemented soon')
  }

  const handleViewDetails = (candidate) => {
    const details = `
Candidate Details:
Name: ${candidate.full_name}
Email: ${candidate.email}
Position: ${candidate.position}
Status: ${candidate.status}
Created: ${new Date(candidate.created_at).toLocaleDateString()}
    `
    alert(details)
  }

  const handleSendTest = (candidate) => {
    // TODO: Реализовать отправку теста
    console.log('Sending test to:', candidate)
    alert(
      `Send test functionality will be implemented soon for ${candidate.full_name}`
    )
  }

  const handleClearForm = () => {
    setNewCandidate({
      full_name: '',
      email: '',
      position: '',
      status: 'test',
    })
  }

  // Функция для получения цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'test':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Функция для получения текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'test':
        return 'Testing'
      case 'interview':
        return 'Interview'
      default:
        return status
    }
  }

  // Получаем количество тестов (в реальном приложении это нужно получать из API)
  const getTestsCompleted = (candidate) => {
    // Здесь можно добавить логику для получения реального количества тестов
    return candidate.tests_completed || 0
  }

  // Получаем уникальные позиции для фильтра
  const getUniquePositions = () => {
    const positions = candidates.map((c) => c.position).filter(Boolean)
    return [...new Set(positions)]
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
                    <option value="test">Testing</option>
                    <option value="interview">Interview</option>
                  </select>

                  <select
                    name="position"
                    value={filters.position}
                    onChange={handleFilterChange}
                    className="px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm font-normal"
                  >
                    <option value="">All Positions</option>
                    {getUniquePositions().map((position, index) => (
                      <option key={index} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      Showing {candidates.length} candidate
                      {candidates.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
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
                  <div className="col-span-12 md:col-span-4 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Actions
                    </span>
                  </div>
                </div>

                {/* Список кандидатов */}
                <div>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading candidates...
                    </div>
                  ) : candidates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery || filters.status || filters.position
                        ? 'No candidates found for your search'
                        : 'No candidates found. Import or add candidates'}
                    </div>
                  ) : (
                    candidates.map((candidate, index) => (
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
                              {candidate.full_name}
                            </div>
                            <div className="text-neutral-500 text-xs">
                              {candidate.email}
                            </div>
                          </div>
                        </div>

                        {/* Позиция */}
                        <div className="col-span-6 md:col-span-2 p-4">
                          <div className="text-neutral-700 text-sm font-normal font-['Inter']">
                            {candidate.position || 'Not specified'}
                          </div>
                          <div className="text-neutral-500 text-xs">
                            {getTestsCompleted(candidate)} test
                            {getTestsCompleted(candidate) !== 1 ? 's' : ''}
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

                        {/* Действия */}
                        <div className="col-span-12 md:col-span-4 p-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleSendTest(candidate)}
                              className="w-full px-2 py-2 bg-blue-600 rounded text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                              title="Send Test"
                            >
                              Send
                            </button>
                            <button
                              onClick={() => handleViewDetails(candidate)}
                              className="w-full px-2 py-2 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                              title="View Details"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleEditCandidate(candidate)}
                              className="w-full px-2 py-2 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCandidate(candidate.id)
                              }
                              className="w-full px-2 py-2 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors"
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
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-neutral-100 overflow-hidden sticky top-6">
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
                      name="full_name"
                      value={newCandidate.full_name}
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
                    <input
                      type="text"
                      name="position"
                      value={newCandidate.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                      placeholder="e.g., Frontend Developer"
                      required
                    />
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
                      <option value="test">Testing</option>
                      <option value="interview">Interview</option>
                    </select>
                  </div>
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
                    className="px-6 py-2 bg-slate-500 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                      !newCandidate.full_name ||
                      !newCandidate.email ||
                      !newCandidate.position
                    }
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
