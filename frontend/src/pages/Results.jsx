import { useState, useEffect, useCallback } from 'react'
import { resultsService } from '../api/implementations/resultsApi'

export function Results() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [editingAnswer, setEditingAnswer] = useState(null)
  const [answerScore, setAnswerScore] = useState('')

  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
  })

  const [sortBy, setSortBy] = useState('date')

  // Загрузка результатов
  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}

      if (searchQuery) {
        params.search = searchQuery
      }

      // Сортировка
      if (sortBy === 'score') {
        params.ordering = '-manual_score_percent,-auto_score_percent'
      } else if (sortBy === 'name') {
        params.ordering = 'candidate__full_name'
      } else {
        params.ordering = '-completed_at'
      }

      const response = await resultsService.getAllResults(params)
      setResults(Array.isArray(response) ? response : [])
    } catch (err) {
      setError('Failed to load results')
      console.error('Error fetching results:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, sortBy])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchResults()
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleViewResult = (result) => {
    setSelectedResult(result)
  }

  const handleEvaluateAnswer = (answer) => {
    setEditingAnswer(answer)
    setAnswerScore(answer.manual_score || '')
  }

  const handleSaveAnswerScore = async () => {
    if (!editingAnswer || answerScore === '') {
      alert('Please enter a score')
      return
    }

    const score = parseInt(answerScore)
    if (isNaN(score) || score < 0 || score > 100) {
      alert('Score must be a number between 0 and 100')
      return
    }

    try {
      setError(null)

      // Обновляем оценку ответа
      await resultsService.updateAnswerScore(
        editingAnswer.attempt_id || selectedResult.id,
        editingAnswer.id,
        { manual_score: score }
      )

      // Обновляем локальное состояние
      const updatedResults = results.map((result) => {
        if (result.id === selectedResult.id) {
          const updatedAnswers = result.answers.map((ans) =>
            ans.id === editingAnswer.id ? { ...ans, manual_score: score } : ans
          )

          // Пересчитываем ручную оценку
          const manualQuestions = updatedAnswers.filter(
            (ans) =>
              ans.question?.evaluation_type === 'manual' ||
              ans.question?.evaluation_type === 'hybrid'
          )
          const manualCorrect = manualQuestions.filter(
            (ans) => ans.manual_score > 0
          ).length
          const newManualPercent =
            manualQuestions.length > 0
              ? (manualCorrect / manualQuestions.length) * 100
              : 0

          return {
            ...result,
            answers: updatedAnswers,
            manual_score_percent: newManualPercent,
          }
        }
        return result
      })

      setResults(updatedResults)

      // Обновляем selectedResult если он открыт
      if (selectedResult) {
        const updatedSelected = updatedResults.find(
          (r) => r.id === selectedResult.id
        )
        if (updatedSelected) {
          setSelectedResult(updatedSelected)
        }
      }

      // Закрываем модальное окно
      setEditingAnswer(null)
      setAnswerScore('')
    } catch (err) {
      setError('Failed to save score')
      console.error('Error saving score:', err)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      minScore: '',
      maxScore: '',
    })
    setSortBy('date')
    fetchResults()
  }

  // Функция для получения цвета оценки
  const getScoreColor = (score) => {
    if (score === null || score === undefined)
      return 'bg-gray-100 text-gray-800 border-gray-200'
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  // Функция для получения статуса
  const getStatusText = (result) => {
    if (
      result.manual_score_percent !== null &&
      result.manual_score_percent !== undefined
    ) {
      return 'Evaluated'
    }
    if (
      result.auto_score_percent !== null &&
      result.auto_score_percent !== undefined
    ) {
      return 'Auto-evaluated'
    }
    return 'Completed'
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Получаем общую оценку
  const getOverallScore = (result) => {
    return result.manual_score_percent !== null &&
      result.manual_score_percent !== undefined
      ? result.manual_score_percent
      : result.auto_score_percent
  }

  // Фильтрация по диапазону оценок
  const filteredResults = results.filter((result) => {
    const overallScore = getOverallScore(result)
    if (overallScore === undefined || overallScore === null) return true

    const matchesMinScore =
      !filters.minScore || overallScore >= parseInt(filters.minScore)
    const matchesMaxScore =
      !filters.maxScore || overallScore <= parseInt(filters.maxScore)

    return matchesMinScore && matchesMaxScore
  })

  // Сортировка
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return getOverallScore(b) - getOverallScore(a)
      case 'name':
        return (a.candidate?.full_name || '').localeCompare(
          b.candidate?.full_name || ''
        )
      case 'date':
      default:
        return new Date(b.completed_at) - new Date(a.completed_at)
    }
  })

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

                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Таблица результатов */}
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
                      Auto Score
                    </span>
                  </div>
                  <div className="col-span-2 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Manual Score
                    </span>
                  </div>
                  <div className="col-span-1 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Actions
                    </span>
                  </div>
                </div>

                {/* Список результатов */}
                <div>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500 px-4">
                      Loading results...
                    </div>
                  ) : sortedResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 px-4">
                      {searchQuery || filters.minScore || filters.maxScore
                        ? 'No results found for your search'
                        : 'There are no test results yet'}
                    </div>
                  ) : (
                    sortedResults.map((result, index) => (
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
                                  {result.candidate?.full_name ||
                                    'Unknown Candidate'}
                                </div>
                                <div className="text-neutral-500 text-sm">
                                  {result.test?.title || 'Unknown Test'}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <div className="text-xs text-gray-500">
                                  {getStatusText(result)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(result.completed_at)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500">
                                  Auto Score
                                </div>
                                <div
                                  className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(result.auto_score_percent)}`}
                                >
                                  {result.auto_score_percent !== null &&
                                  result.auto_score_percent !== undefined
                                    ? `${result.auto_score_percent}%`
                                    : 'N/A'}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500">
                                  Manual Score
                                </div>
                                <div
                                  className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(result.manual_score_percent)}`}
                                >
                                  {result.manual_score_percent !== null &&
                                  result.manual_score_percent !== undefined
                                    ? `${result.manual_score_percent}%`
                                    : 'Not graded'}
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
                            </div>
                          </div>
                        </div>

                        {/* Десктопная строка */}
                        <div className="hidden md:grid md:grid-cols-12">
                          {/* Кандидат */}
                          <div className="col-span-3 p-4">
                            <div className="text-neutral-700 text-sm font-medium">
                              {result.candidate?.full_name ||
                                'Unknown Candidate'}
                            </div>
                            <div className="text-neutral-500 text-xs mt-1">
                              {formatDate(result.completed_at)}
                            </div>
                          </div>

                          {/* Тест */}
                          <div className="col-span-4 p-4">
                            <div className="text-neutral-700 text-sm font-normal">
                              {result.test?.title || 'Unknown Test'}
                            </div>
                            <div className="text-neutral-500 text-xs mt-1">
                              {getStatusText(result)}
                            </div>
                          </div>

                          {/* Автооценка */}
                          <div className="col-span-2 p-4">
                            <div
                              className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(result.auto_score_percent)}`}
                            >
                              {result.auto_score_percent !== null &&
                              result.auto_score_percent !== undefined
                                ? `${result.auto_score_percent}%`
                                : 'N/A'}
                            </div>
                          </div>

                          {/* Ручная оценка */}
                          <div className="col-span-2 p-4">
                            <div
                              className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(result.manual_score_percent)}`}
                            >
                              {result.manual_score_percent !== null &&
                              result.manual_score_percent !== undefined
                                ? `${result.manual_score_percent}%`
                                : 'Not graded'}
                            </div>
                          </div>

                          {/* Действия */}
                          <div className="col-span-1 p-4">
                            <div className="flex flex-wrap gap-1">
                              <button
                                onClick={() => handleViewResult(result)}
                                className="px-2 py-1 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                                title="View Details"
                              >
                                View
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
                          checked={sortBy === 'date'}
                          onChange={handleSortChange}
                          className="w-4 h-4 text-slate-500"
                        />
                        <span className="text-neutral-700 text-sm">
                          Date (Newest first)
                        </span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="sort"
                          value="score"
                          checked={sortBy === 'score'}
                          onChange={handleSortChange}
                          className="w-4 h-4 text-slate-500"
                        />
                        <span className="text-neutral-700 text-sm">
                          Score (Highest first)
                        </span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="sort"
                          value="name"
                          checked={sortBy === 'name'}
                          onChange={handleSortChange}
                          className="w-4 h-4 text-slate-500"
                        />
                        <span className="text-neutral-700 text-sm">
                          Candidate Name (A-Z)
                        </span>
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
                  {/* Диапазон оценок */}
                  <div className="space-y-3">
                    <label className="block text-neutral-700 text-sm font-medium">
                      Score Range (0-100)
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
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

                <div className="space-y-6">
                  {/* Основная информация */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500">Candidate</div>
                        <div className="font-medium">
                          {selectedResult.candidate?.full_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedResult.candidate?.email || ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Position</div>
                        <div className="font-medium">
                          {selectedResult.candidate?.position ||
                            'Not specified'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500">Test</div>
                        <div className="font-medium">
                          {selectedResult.test?.title || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedResult.test?.description || ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Completed</div>
                        <div className="font-medium">
                          {formatDate(selectedResult.completed_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Оценки */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-2">
                        Auto Score
                      </div>
                      <div
                        className={`text-2xl font-bold ${getScoreColor(selectedResult.auto_score_percent).split(' ')[1]}`}
                      >
                        {selectedResult.auto_score_percent !== null &&
                        selectedResult.auto_score_percent !== undefined
                          ? `${selectedResult.auto_score_percent}%`
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-2">
                        Manual Score
                      </div>
                      <div
                        className={`text-2xl font-bold ${getScoreColor(selectedResult.manual_score_percent).split(' ')[1]}`}
                      >
                        {selectedResult.manual_score_percent !== null &&
                        selectedResult.manual_score_percent !== undefined
                          ? `${selectedResult.manual_score_percent}%`
                          : 'Not graded'}
                      </div>
                    </div>
                  </div>

                  {/* Ответы */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Questions & Answers
                    </h4>
                    {selectedResult.answers &&
                    selectedResult.answers.length > 0 ? (
                      <div className="space-y-4">
                        {selectedResult.answers.map((answer) => (
                          <div
                            key={answer.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 mb-2">
                                  {answer.question_text || 'Question'}
                                </div>
                                <div className="text-sm text-gray-600 mb-3">
                                  <strong>Answer:</strong>{' '}
                                  {answer.response || 'No answer'}
                                </div>
                              </div>
                              <div className="ml-4 text-right">
                                <div className="text-sm text-gray-500 mb-1">
                                  Auto Score
                                </div>
                                <div className="font-medium">
                                  {answer.auto_score !== null &&
                                  answer.auto_score !== undefined
                                    ? `${answer.auto_score}`
                                    : 'N/A'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <div className="text-sm text-gray-500 mb-1">
                                    Manual Score
                                  </div>
                                  <div className="font-medium">
                                    {answer.manual_score !== null &&
                                    answer.manual_score !== undefined
                                      ? `${answer.manual_score}`
                                      : 'Not graded'}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleEvaluateAnswer(answer)}
                                className="px-4 py-2 bg-purple-800 rounded text-white text-sm hover:bg-purple-900 transition-colors"
                              >
                                Grade
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No answers found for this test
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => setSelectedResult(null)}
                      className="w-full py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно для оценки ответа */}
        {editingAnswer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-neutral-700">
                    Grade Answer
                  </h3>
                  <button
                    onClick={() => {
                      setEditingAnswer(null)
                      setAnswerScore('')
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {editingAnswer.question_text || 'Question'}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="text-sm text-gray-500 mb-1">
                      Candidate's Answer:
                    </div>
                    <div className="text-gray-800">
                      {editingAnswer.response || 'No answer'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Current Auto Score
                    </div>
                    <div className="font-medium mb-4">
                      {editingAnswer.auto_score !== null &&
                      editingAnswer.auto_score !== undefined
                        ? `${editingAnswer.auto_score}`
                        : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Manual Score (0-100)
                    </label>
                    <input
                      type="number"
                      value={answerScore}
                      onChange={(e) => setAnswerScore(e.target.value)}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                      placeholder="Enter manual score"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        setEditingAnswer(null)
                        setAnswerScore('')
                      }}
                      className="flex-1 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAnswerScore}
                      className="flex-1 py-2 bg-purple-800 rounded text-white hover:bg-purple-900 transition-colors"
                    >
                      Save Score
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
