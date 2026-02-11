import { useState, useEffect } from 'react'
import { attemptsService } from '../api/implementations/attemptsApi'
import { candidateService } from '../api/implementations/candidateApi'
import { testsService } from '../api/implementations/testsApi'

export function Attempts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    status: '',
    completed: '',
  })

  const [newAttempt, setNewAttempt] = useState({
    candidate: '',
    test: '',
  })

  // Данные для выпадающих списков
  const [candidates, setCandidates] = useState([])
  const [tests, setTests] = useState([])
  const [loadingCandidates, setLoadingCandidates] = useState(true)
  const [loadingTests, setLoadingTests] = useState(true)

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Загружаем попытки
        const attemptsResponse =
          (await attemptsService.getAllAttempts?.()) || []
        setAttempts(Array.isArray(attemptsResponse) ? attemptsResponse : [])

        // Загружаем кандидатов
        setLoadingCandidates(true)
        try {
          const candidatesResponse = await candidateService.getAllCandidates()
          setCandidates(
            Array.isArray(candidatesResponse) ? candidatesResponse : []
          )
        } catch (err) {
          console.error('Error loading candidates:', err)
          setCandidates([])
        } finally {
          setLoadingCandidates(false)
        }

        // Загружаем тесты
        setLoadingTests(true)
        try {
          const testsResponse = await testsService.getAllTests()
          setTests(Array.isArray(testsResponse) ? testsResponse : [])
        } catch (err) {
          console.error('Error loading tests:', err)
          setTests([])
        } finally {
          setLoadingTests(false)
        }
      } catch (err) {
        setError('Failed to load attempts')
        console.error('Error fetching attempts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // В реальном приложении здесь будет API запрос с поисковым запросом
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

  const handleCreateAttempt = async (e) => {
    e.preventDefault()

    try {
      setError(null)

      // Проверяем, что выбраны кандидат и тест
      if (!newAttempt.candidate || !newAttempt.test) {
        alert('Please select candidate and test')
        return
      }

      // Формируем данные для API
      const attemptData = {
        candidate: parseInt(newAttempt.candidate),
        test: parseInt(newAttempt.test),
      }

      // Отправляем запрос на создание попытки
      const response = await attemptsService.createAttempt(attemptData)

      // Обновляем список попыток
      setAttempts((prev) => [...prev, response])

      // Очищаем форму
      setNewAttempt({
        candidate: '',
        test: '',
      })

      console.log('Created attempt:', response)
    } catch (err) {
      setError('Failed to create attempt')
      console.error('Error creating attempt:', err)
      alert('Failed to create attempt. Please try again.')
    }
  }

  const handleDeleteAttempt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attempt?')) {
      return
    }

    try {
      setError(null)
      // В вашем API нет метода deleteAttempt, так что только локально
      setAttempts(attempts.filter((attempt) => attempt.id !== id))
    } catch (err) {
      setError('Failed to delete attempt')
      console.error('Error deleting attempt:', err)
    }
  }

  const handleEditAttempt = (attempt) => {
    console.log('Editing attempt:', attempt)
    // TODO: Реализовать редактирование попытки
    alert('Edit functionality will be implemented soon')
  }

  const handleViewDetails = (attempt) => {
    const link = `${window.location.origin}/test/${attempt.id}`
    const details = `
Candidate: ${attempt.candidate_name || 'Unknown'}
Email: ${attempt.candidate_email || 'No email'}
Test: ${attempt.test_title || 'Unknown'}
Completed: ${attempt.completed ? 'Yes' : 'No'}
Test ID: ${attempt.id}
Auto Score: ${attempt.auto_score_percent || 0}%
Manual Score: ${attempt.manual_score_percent || 0}%
Test Link: ${link}
    `
    alert(details)
  }

  const handleResendAttempt = async (attempt) => {
    try {
      setError(null)
      // Показываем ссылку для копирования
      const link = `${window.location.origin}/test/${attempt.id}`
      navigator.clipboard.writeText(link)
      alert(`Link copied to clipboard: ${link}`)
    } catch (err) {
      setError('Failed to resend attempt')
      console.error('Error resending attempt:', err)
    }
  }

  const handleClearForm = () => {
    setNewAttempt({
      candidate: '',
      test: '',
    })
  }

  // Фильтрация попыток
  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      (attempt.candidate_name?.toLowerCase() || '').includes(
        searchQuery.toLowerCase()
      ) ||
      (attempt.test_title?.toLowerCase() || '').includes(
        searchQuery.toLowerCase()
      )

    const matchesStatus = !filters.status || attempt.status === filters.status
    const matchesCompleted =
      filters.completed === '' ||
      (filters.completed === 'true' && attempt.completed) ||
      (filters.completed === 'false' && !attempt.completed)

    return matchesSearch && matchesStatus && matchesCompleted
  })

  // Получаем имя кандидата
  const getCandidateName = (attempt) => {
    return attempt.candidate_name || 'Unknown Candidate'
  }

  // Получаем название теста
  const getTestName = (attempt) => {
    return attempt.test_title || 'Unknown Test'
  }

  // Получаем статус попытки
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: 'Pending',
      completed: 'Completed',
      expired: 'Expired',
      in_progress: 'In Progress',
    }
    return statusMap[status] || status
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
                    <option value="in_progress">In Progress</option>
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

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Таблица попыток */}
              <div className="overflow-hidden">
                {/* Заголовки таблицы для десктопа */}
                <div className="hidden md:grid md:grid-cols-12 bg-gray-50 border-b border-zinc-200">
                  <div className="col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Candidate
                    </span>
                  </div>
                  <div className="col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Test
                    </span>
                  </div>
                  <div className="col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Link
                    </span>
                  </div>
                  <div className="col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Status
                    </span>
                  </div>
                  <div className="col-span-4 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Actions
                    </span>
                  </div>
                </div>

                {/* Список попыток */}
                <div>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500 px-4">
                      Loading attempts...
                    </div>
                  ) : filteredAttempts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 px-4">
                      {searchQuery || filters.status || filters.completed
                        ? 'No attempts found for your search'
                        : 'No attempts found. Create new attempt'}
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
                                  {getCandidateName(attempt)}
                                </div>
                                <div className="text-neutral-500 text-sm mt-1">
                                  {getTestName(attempt)}
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
                                        : attempt.status === 'expired'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {getStatusDisplay(attempt.status)}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>
                                Created:{' '}
                                {new Date(
                                  attempt.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                              <p className="text-blue-700 text-xs font-medium mb-1">Test Link:</p>
                              <div className="flex gap-1 items-center">
                                <a
                                  href={`/test/${attempt.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-xs break-all flex-1"
                                  title={`${window.location.origin}/test/${attempt.id}`}
                                >
                                  /test/{attempt.id?.slice(0, 6)}...
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const link = `${window.location.origin}/test/${attempt.id}`
                                    navigator.clipboard.writeText(link)
                                    alert('Link copied!')
                                  }}
                                  className="px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded hover:bg-blue-300 transition-colors whitespace-nowrap"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 pt-2">
                              {!attempt.completed && (
                                <button
                                  onClick={() => handleResendAttempt(attempt)}
                                  className="w-full px-2 py-1 bg-blue-600 rounded text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                                >
                                  Resend
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(attempt)}
                                className="w-full px-2 py-1 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleEditAttempt(attempt)}
                                className="w-full px-2 py-1 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAttempt(attempt.id)}
                                className="w-full px-2 py-1 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Десктопная строка */}
                        <div className="hidden md:grid md:grid-cols-12">
                          {/* Кандидат */}
                          <div className="col-span-2 p-4">
                            <div className="text-neutral-700 text-sm font-medium">
                              {getCandidateName(attempt)}
                            </div>
                            <div className="text-neutral-500 text-xs mt-1">
                              {attempt.candidate_email || 'No email'}
                            </div>
                          </div>

                          {/* Тест */}
                          <div className="col-span-2 p-4">
                            <div className="text-neutral-700 text-sm font-normal">
                              {getTestName(attempt)}
                            </div>
                            <div className="text-neutral-500 text-xs mt-1">
                              {attempt.test_time_limit
                                ? `${attempt.test_time_limit} min`
                                : 'No time limit'}
                            </div>
                          </div>

                          {/* Ссылка на тест */}
                          <div className="col-span-2 p-4">
                            <div className="text-neutral-500 text-xs break-all">
                              <a
                                href={`/test/${attempt.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                title={`${window.location.origin}/test/${attempt.id}`}
                              >
                                /test/{attempt.id?.slice(0, 8)}...
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const link = `${window.location.origin}/test/${attempt.id}`
                                navigator.clipboard.writeText(link)
                                alert('Link copied!')
                              }}
                              className="mt-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                            >
                              Copy
                            </button>
                          </div>

                          {/* Статус */}
                          <div className="col-span-2 p-4">
                            <div className="space-y-1">
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
                                className={`block px-2 py-1 rounded text-xs font-medium mt-1 ${
                                  attempt.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : attempt.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : attempt.status === 'expired'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {getStatusDisplay(attempt.status)}
                              </span>
                            </div>
                          </div>


                          {/* Действия */}
                          <div className="col-span-4 p-4">
                            <div className="flex flex-col gap-1">
                              {!attempt.completed && (
                                <button
                                  onClick={() => handleResendAttempt(attempt)}
                                  className="w-full px-2 py-1 bg-blue-600 rounded text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                                  title="Resend"
                                >
                                  Resend
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(attempt)}
                                className="w-full px-2 py-1 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                                title="View Details"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleEditAttempt(attempt)}
                                className="w-full px-2 py-1 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAttempt(attempt.id)}
                                className="w-full px-2 py-1 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors"
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
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-neutral-100 overflow-hidden sticky top-6">
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
                    name="candidate"
                    value={newAttempt.candidate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    required
                    disabled={loadingCandidates}
                  >
                    <option value="">Select candidate</option>
                    {loadingCandidates ? (
                      <option disabled>Loading candidates...</option>
                    ) : candidates.length === 0 ? (
                      <option disabled>No candidates available</option>
                    ) : (
                      candidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.full_name} ({candidate.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Выбор теста */}
                <div>
                  <label className="block text-neutral-700 text-sm font-medium mb-2">
                    Choose Test
                  </label>
                  <select
                    name="test"
                    value={newAttempt.test}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    required
                    disabled={loadingTests}
                  >
                    <option value="">Select test</option>
                    {loadingTests ? (
                      <option disabled>Loading tests...</option>
                    ) : tests.length === 0 ? (
                      <option disabled>No tests available</option>
                    ) : (
                      tests.map((test) => (
                        <option key={test.id} value={test.id}>
                          {test.title} ({test.time_limit || 'No'} min)
                        </option>
                      ))
                    )}
                  </select>
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
                    disabled={!newAttempt.candidate || !newAttempt.test}
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
