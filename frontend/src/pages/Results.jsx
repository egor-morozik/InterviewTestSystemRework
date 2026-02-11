import { useState, useEffect, useCallback } from 'react'
import { resultsService } from '../api/implementations/resultsApi'

export function Results() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [isGradingMode, setIsGradingMode] = useState(false)
  const [gradingScores, setGradingScores] = useState({}) // {answerId: score}

  const [filters, setFilters] = useState({
    autoScoreMin: '',
    autoScoreMax: '',
    manualScoreMin: '',
    manualScoreMax: '',
  })

  const [sortBy, setSortBy] = useState('date')

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}

      if (searchQuery) {
        params.search = searchQuery
      }

      // Auto score filters
      if (filters.autoScoreMin) {
        params.auto_score_percent_min = filters.autoScoreMin
      }
      if (filters.autoScoreMax) {
        params.auto_score_percent_max = filters.autoScoreMax
      }

      // Manual score filters
      if (filters.manualScoreMin) {
        params.manual_score_percent_min = filters.manualScoreMin
      }
      if (filters.manualScoreMax) {
        params.manual_score_percent_max = filters.manualScoreMax
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
  }, [searchQuery, sortBy, filters])

  // Загрузка результатов
  useEffect(() => {
    fetchResults()
  }, [fetchResults])

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

  const handleViewResult = async (result) => {
    try {
      const fullResult = await resultsService.getResult(result.id)
      console.log('Loaded result:', fullResult)
      setSelectedResult(fullResult)
      setIsGradingMode(false)
    } catch (err) {
      console.error('Error loading result details:', err)
      alert('Failed to load result details')
    }
  }

  const handleGradeResult = async (result) => {
    try {
      const fullResult = await resultsService.getResult(result.id)
      console.log('[handleGradeResult] Loaded result for grading:', fullResult)
      console.log('[handleGradeResult] Total answers:', fullResult.answers?.length || 0)
      fullResult.answers?.forEach((ans, idx) => {
        console.log(`[handleGradeResult] Answer ${idx}: id=${ans.id}, question=${ans.question_text}, manual_score=${ans.manual_score}`)
      })
      
      setSelectedResult(fullResult)
      // Initialize grading scores with current manual_score values
      const initialScores = {}
      fullResult.answers?.forEach((answer) => {
        initialScores[answer.id] = answer.manual_score !== null && answer.manual_score !== undefined ? answer.manual_score : 0
      })
      console.log('[handleGradeResult] Initial grading scores:', initialScores)
      setGradingScores(initialScores)
      setIsGradingMode(true)
    } catch (err) {
      console.error('[handleGradeResult] Error loading result details:', err)
      setError(`Failed to load result details: ${err.message}`)
    }
  }

  const handleScoreChange = (answerId, value) => {
    const score = parseInt(value) || 0
    if (score < 0 || score > 1) return
    setGradingScores((prev) => ({
      ...prev,
      [answerId]: score,
    }))
  }

  const handleSaveAllScores = async () => {
    if (!selectedResult) return

    try {
      setError(null)
      let updatedPercent = null

      // Save all grading scores
      for (const [answerId, score] of Object.entries(gradingScores)) {
        console.log(`[handleSaveAllScores] Saving score for answer ${answerId}: ${score}`)
        console.log(`[handleSaveAllScores] URL would be: /results/${selectedResult.id}/answer/${answerId}/score/`)
        
        try {
          const response = await resultsService.updateAnswerScore(
            selectedResult.id,
            answerId,
            { manual_score: score }
          )
          console.log(`[handleSaveAllScores] API Response for answer ${answerId}:`, response)
          if (response && response.manual_score_percent !== undefined) {
            updatedPercent = response.manual_score_percent
          }
        } catch (answerErr) {
          console.error(`[handleSaveAllScores] Error saving answer ${answerId}:`, answerErr)
          if (answerErr.response) {
            console.error(`[handleSaveAllScores] Error response status:`, answerErr.response.status)
            console.error(`[handleSaveAllScores] Error response data:`, answerErr.response.data)
          }
          throw answerErr
        }
      }

      console.log(`[handleSaveAllScores] Final updatedPercent: ${updatedPercent}`)

      // Update the selected result
      setSelectedResult({
        ...selectedResult,
        manual_score_percent: updatedPercent,
        answers: selectedResult.answers?.map((ans) => ({
          ...ans,
          manual_score: gradingScores[ans.id] !== undefined ? gradingScores[ans.id] : ans.manual_score,
        })) || [],
      })

      // Update results list
      const updatedResults = results.map((result) => {
        if (result.id === selectedResult.id) {
          return {
            ...result,
            manual_score_percent: updatedPercent,
          }
        }
        return result
      })
      setResults(updatedResults)

      alert('Scores saved successfully!')
      setIsGradingMode(false)
      setGradingScores({})
      
      // Refresh the full results from backend to ensure everything is in sync
      setTimeout(() => fetchResults(), 500)
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save scores'
      setError(`Failed to save scores: ${errorMsg}`)
      console.error('[handleSaveAllScores] Error saving scores:', err)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      autoScoreMin: '',
      autoScoreMax: '',
      manualScoreMin: '',
      manualScoreMax: '',
    })
    setSortBy('date')
    fetchResults()
  }

  // Функция для получения цвета оценки
  const getScoreColor = (score) => {
    if (score === null || score === undefined)
      return 'bg-gray-100 text-gray-800 border-gray-200'
    const numericScore = parseFloat(score)
    if (numericScore >= 80)
      return 'bg-green-100 text-green-800 border-green-200'
    if (numericScore >= 60)
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
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
    {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // Получаем общую оценку
  const getOverallScore = (result) => {
    if (
      result.manual_score_percent !== null &&
      result.manual_score_percent !== undefined
    ) {
      return parseFloat(result.manual_score_percent)
    }
    if (
      result.auto_score_percent !== null &&
      result.auto_score_percent !== undefined
    ) {
      return parseFloat(result.auto_score_percent)
    }
    return null
  }

  // Фильтрация происходит на бэке, используем results напрямую
  const filteredResults = results

  // Сортировка
  const sortedResults = [...filteredResults].sort((a, b) => {
    const scoreA = getOverallScore(a) || 0
    const scoreB = getOverallScore(b) || 0

    switch (sortBy) {
      case 'score':
        return scoreB - scoreA
      case 'name':
        return (a.candidate?.full_name || '').localeCompare(
          b.candidate?.full_name || ''
        )
      case 'date':
      default:
        return new Date(b.completed_at || 0) - new Date(a.completed_at || 0)
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
                  <div className="col-span-2 p-4">
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
                  <div className="col-span-2 p-4">
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
                                    ? `${parseFloat(result.auto_score_percent).toFixed(1)}%`
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
                                    ? `${parseFloat(result.manual_score_percent).toFixed(1)}%`
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
                              <button
                                onClick={() => handleGradeResult(result)}
                                className="px-3 py-1.5 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                              >
                                Grade
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Десктопная строка */}
                        <div className="hidden md:grid md:grid-cols-12">
                          {/* Кандидат */}
                          <div className="col-span-2 p-4">
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
                                ? `${parseFloat(result.auto_score_percent).toFixed(1)}%`
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
                                ? `${parseFloat(result.manual_score_percent).toFixed(1)}%`
                                : 'Not graded'}
                            </div>
                          </div>

                          {/* Действия */}
                          <div className="col-span-2 p-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleViewResult(result)}
                                className="px-3 py-1.5 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                                title="View Details"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleGradeResult(result)}
                                className="px-3 py-1.5 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                                title="Grade Answers"
                              >
                                Grade
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
                  {/* Диапазон автооценки */}
                  <div className="space-y-3">
                    <label className="block text-neutral-700 text-sm font-medium">
                      Auto Score (%) Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="number"
                          name="autoScoreMin"
                          value={filters.autoScoreMin}
                          onChange={handleFilterChange}
                          min="0"
                          max="100"
                          placeholder="Min %"
                          className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="autoScoreMax"
                          value={filters.autoScoreMax}
                          onChange={handleFilterChange}
                          min="0"
                          max="100"
                          placeholder="Max %"
                          className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Диапазон ручной оценки */}
                  <div className="space-y-3">
                    <label className="block text-neutral-700 text-sm font-medium">
                      Manual Score (%) Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="number"
                          name="manualScoreMin"
                          value={filters.manualScoreMin}
                          onChange={handleFilterChange}
                          min="0"
                          max="100"
                          placeholder="Min %"
                          className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="manualScoreMax"
                          value={filters.manualScoreMax}
                          onChange={handleFilterChange}
                          min="0"
                          max="100"
                          placeholder="Max %"
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
            <div className="bg-white rounded w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Result Details</h3>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Основная информация */}
                  <div className="space-y-2 border-b pb-4">
                    <div>
                      <span className="text-gray-600 text-sm">Candidate:</span>
                      <div className="font-medium">{selectedResult.candidate?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{selectedResult.candidate?.email || ''}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Position:</span>
                      <div className="font-medium">{selectedResult.candidate?.position || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Test:</span>
                      <div className="font-medium">{selectedResult.test?.title || 'Unknown'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Completed:</span>
                      <div className="font-medium">{formatDate(selectedResult.completed_at)}</div>
                    </div>
                  </div>

                  {/* Оценки */}
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Auto Score</div>
                      <div className="text-xl font-bold">
                        {selectedResult.auto_score_percent !== null &&
                        selectedResult.auto_score_percent !== undefined
                          ? `${parseFloat(selectedResult.auto_score_percent).toFixed(1)}%`
                          : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Manual Score</div>
                      <div className="text-xl font-bold">
                        {selectedResult.manual_score_percent !== null &&
                        selectedResult.manual_score_percent !== undefined
                          ? `${parseFloat(selectedResult.manual_score_percent).toFixed(1)}%`
                          : 'Not graded'}
                      </div>
                    </div>
                  </div>

                  {/* Ответы */}
                  <div>
                    <h4 className="font-semibold mb-3">
                      Questions & Answers ({selectedResult.answers?.length || 0})
                    </h4>
                    {selectedResult.answers && selectedResult.answers.length > 0 ? (
                      <div className="space-y-3">
                        {selectedResult.answers.map((answer, idx) => (
                          <div key={answer.id} className="border p-3 rounded">
                            <div className="font-medium text-sm mb-2">
                              Q{idx + 1}: {answer.question_text || 'Question'}
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              <span className="text-gray-600">Answer:</span> {answer.response || '(No answer)'}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Auto:</span> {answer.auto_score !== null && answer.auto_score !== undefined ? answer.auto_score : 'N/A'}
                              </div>
                              <div>
                                {isGradingMode ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Manual:</span>
                                    <input
                                      type="number"
                                      min="0"
                                      max="1"
                                      step="1"
                                      value={gradingScores[answer.id] !== undefined ? gradingScores[answer.id] : (answer.manual_score || 0)}
                                      onChange={(e) => handleScoreChange(answer.id, e.target.value)}
                                      className="w-12 h-6 px-1 border rounded text-sm"
                                      placeholder="0"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-gray-600">Manual: {answer.manual_score !== null && answer.manual_score !== undefined ? answer.manual_score : 'N/A'}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">No answers found</div>
                    )}
                  </div>

                  {isGradingMode && (
                    <button
                      onClick={handleSaveAllScores}
                      className="w-full py-2 bg-purple-800 rounded text-white hover:bg-purple-900 text-sm font-medium mb-2"
                    >
                      Save Grades
                    </button>
                  )}

                  {/* Активность кандидата */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">
                      Activity Log ({selectedResult.activity?.length || 0})
                    </h4>
                    {selectedResult.activity && selectedResult.activity.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedResult.activity.map((log, idx) => {

                          const getActivityLabel = (eventType) => {
                            const labels = {
                              hidden: 'Left the page',
                              visible: 'Returned to page',
                              copytext: 'Copied text',
                              screenshot: 'Screenshot attempt',
                            }
                            return labels[eventType] || eventType
                          }

                          const getActivityColor = (eventType) => {
                            const colors = {
                              hidden: 'bg-red-50 border-red-200',
                              visible: 'bg-green-50 border-green-200',
                              copytext: 'bg-yellow-50 border-yellow-200',
                              screenshot: 'bg-orange-50 border-orange-200',
                            }
                            return colors[eventType] || 'bg-gray-50'
                          }

                          return (
                            <div key={idx} className={`p-2 rounded border text-sm ${getActivityColor(log.event_type)}`}>
                              <span className="font-medium">{getActivityLabel(log.event_type)}</span>
                              <span className="text-gray-500 ml-2">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">No suspicious activity detected</div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedResult(null)
                      setIsGradingMode(false)
                      setGradingScores({})
                    }}
                    className="w-full py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 text-sm mt-4"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
