import { useState, useEffect, useCallback } from 'react'
import { testsService } from '../api/tests'
import { questionsService } from '../api/questions'

export function Tests() {
  const [searchQuery, setSearchQuery] = useState('')
  const [questionSearch, setQuestionSearch] = useState('')
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    time_limit: '',
    test_questions: [],
  })

  const [tests, setTests] = useState([])
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка тестов
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}
      if (searchQuery) {
        params.search = searchQuery
      }

      const response = await testsService.getAllTests(params)
      setTests(response)
    } catch (err) {
      setError('Failed to load tests')
      console.error('Error fetching tests:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  const fetchAvailableQuestions = useCallback(async () => {
    try {
      setLoadingQuestions(true)
      const params = {}
      if (questionSearch) {
        params.search = questionSearch
      }

      const response = await questionsService.getAllQuestions(params)
      setAvailableQuestions(response)
    } catch (err) {
      console.error('Error fetching questions:', err)
    } finally {
      setLoadingQuestions(false)
    }
  }, [questionSearch])

  useEffect(() => {
    fetchTests()
    fetchAvailableQuestions()
  }, [fetchTests, fetchAvailableQuestions])

  // Первоначальная загрузка данных
  useEffect(() => {
    fetchTests()
    fetchAvailableQuestions()
  }, [fetchTests, fetchAvailableQuestions])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchTests()
  }

  const handleQuestionSearch = (e) => {
    e.preventDefault()
    fetchAvailableQuestions()
  }

  const handleCreateTest = async (e) => {
    e.preventDefault()

    try {
      setError(null)

      // Формируем данные для API
      const testData = {
        title: newTest.title,
        description: newTest.description,
        time_limit: newTest.time_limit ? parseInt(newTest.time_limit) : null,
        test_questions: newTest.test_questions.map((questionId) => ({
          question: questionId,
          order: newTest.test_questions.indexOf(questionId) + 1,
        })),
      }

      const response = await testsService.createTest(testData)

      // Обновляем список тестов
      setTests([...tests, response])

      // Очищаем форму
      setNewTest({
        title: '',
        description: '',
        time_limit: '',
        test_questions: [],
      })

      // Обновляем список тестов
      await fetchTests()
    } catch (err) {
      setError('Failed to create test')
      console.error('Error creating test:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTest((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddQuestion = (questionId) => {
    if (!newTest.test_questions.includes(questionId)) {
      setNewTest((prev) => ({
        ...prev,
        test_questions: [...prev.test_questions, questionId],
      }))
    }
  }

  const handleRemoveQuestion = (questionId) => {
    setNewTest((prev) => ({
      ...prev,
      test_questions: prev.test_questions.filter((id) => id !== questionId),
    }))
  }

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return
    }

    try {
      setError(null)
      await testsService.deleteTest(testId)
      setTests(tests.filter((test) => test.id !== testId))
    } catch (err) {
      setError('Failed to delete test')
      console.error('Error deleting test:', err)
    }
  }

  const handleEditTest = (test) => {
    console.log('Edit test:', test)
    // TODO: Реализовать редактирование теста
    alert('Edit functionality will be implemented soon')
  }

  const handleViewDetails = (test) => {
    const details = `
Test Details:
Title: ${test.title}
Description: ${test.description}
Time Limit: ${test.time_limit || 'No limit'} minutes
Questions: ${test.test_questions?.length || 0}
Created: ${new Date(test.created_at).toLocaleDateString()}
Last Updated: ${new Date(test.updated_at).toLocaleDateString()}
    `
    alert(details)
  }

  // Фильтрация вопросов по поиску
  const filteredQuestions = availableQuestions.filter(
    (question) =>
      question.title?.toLowerCase().includes(questionSearch.toLowerCase()) ||
      question.text?.toLowerCase().includes(questionSearch.toLowerCase())
  )

  // Получаем выбранные вопросы
  const getSelectedQuestions = () => {
    return availableQuestions.filter((q) =>
      newTest.test_questions.includes(q.id)
    )
  }

  const selectedQuestions = getSelectedQuestions()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Основной контейнер с двумя колонками */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ЛЕВАЯ КОЛОНКА: Библиотека тестов */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
              {/* Заголовок и кнопка импорта */}
              <header className="px-4 md:px-6 py-4 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-neutral-700 text-xl md:text-2xl font-extrabold font-['Inter']">
                  Tests Library
                </h1>

                <button
                  className="px-4 py-2 bg-slate-500 rounded text-white text-sm font-medium hover:bg-slate-600 transition-colors"
                  aria-label="Импортировать тесты"
                  onClick={() =>
                    alert('Import functionality will be implemented soon')
                  }
                >
                  Import Tests
                </button>
              </header>

              {/* Форма поиска */}
              <div className="p-4 md:p-6 border-b border-zinc-200 space-y-4">
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
                      placeholder="Search test..."
                      className="w-full px-4 py-3 text-neutral-700 text-sm font-normal bg-white rounded-lg border border-zinc-200 outline-none placeholder:text-neutral-400"
                      aria-label="Поиск теста"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-slate-500 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors whitespace-nowrap"
                    aria-label="Выполнить поиск"
                  >
                    Search
                  </button>
                </form>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Таблица тестов */}
              <div className="overflow-x-auto">
                {/* Заголовки таблицы */}
                <div className="grid grid-cols-12 bg-gray-50 border-b border-zinc-200 min-w-200">
                  <div className="col-span-12 md:col-span-3 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Test
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-6 p-4 hidden md:block">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Description
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-3 p-4">
                    <span className="text-neutral-700 text-sm font-bold font-['Inter']">
                      Actions
                    </span>
                  </div>
                </div>

                {/* Список тестов */}
                <div className="min-w-200">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading tests...
                    </div>
                  ) : tests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery
                        ? 'No tests found for your search'
                        : 'No tests found. Create your first test.'}
                    </div>
                  ) : (
                    tests.map((test, index) => (
                      <div
                        key={test.id}
                        className={`grid grid-cols-12 border-b border-zinc-200 hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        {/* Название теста */}
                        <div className="col-span-12 md:col-span-3 p-4">
                          <div className="text-neutral-700 text-sm font-normal font-['Inter'] mb-1">
                            {test.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {test.test_questions?.length || 0} questions •{' '}
                            {test.time_limit || 'No limit'} min
                          </div>
                        </div>

                        {/* Описание */}
                        <div className="col-span-12 md:col-span-6 p-4 hidden md:block">
                          <p className="text-neutral-700 text-sm font-normal font-['Inter'] line-clamp-2">
                            {test.description || 'No description'}
                          </p>
                        </div>

                        {/* Кнопки действий */}
                        <div className="col-span-12 md:col-span-3 p-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleViewDetails(test)}
                              className="px-3 py-2 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors"
                              title="View Details"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => handleEditTest(test)}
                              className="px-3 py-2 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test.id)}
                              className="px-3 py-2 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors"
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

          {/* ПРАВАЯ КОЛОНКА: Создание теста */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[60px] shadow-sm border border-neutral-100 overflow-hidden sticky top-6">
              {/* Заголовок формы */}
              <header className="px-6 py-4 border-b border-zinc-200">
                <h2 className="text-neutral-700 text-xl font-extrabold font-['Inter'] text-center">
                  Create New Test
                </h2>
              </header>

              {/* Форма создания теста */}
              <form
                onSubmit={handleCreateTest}
                className="p-4 md:p-6 space-y-6"
              >
                {/* Название теста */}
                <div>
                  <label
                    htmlFor="test-title"
                    className="block text-neutral-700 text-sm font-medium mb-2"
                  >
                    Test name
                  </label>
                  <input
                    type="text"
                    id="test-title"
                    name="title"
                    value={newTest.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    placeholder="Enter test name"
                    required
                  />
                </div>

                {/* Описание */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-neutral-700 text-sm font-medium mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newTest.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm resize-none"
                    placeholder="Enter test description"
                    rows={3}
                  />
                </div>

                {/* Временной лимит */}
                <div>
                  <label
                    htmlFor="time-limit"
                    className="block text-neutral-700 text-sm font-medium mb-2"
                  >
                    Time limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="time-limit"
                    name="time_limit"
                    value={newTest.time_limit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    placeholder="0 for no limit"
                    min="0"
                  />
                  <p className="text-xs text-neutral-400 mt-1">
                    In minutes (0 or empty - no limit)
                  </p>
                </div>

                {/* Добавление вопросов */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-neutral-700 text-sm font-medium">
                      Questions
                    </label>
                    <span className="text-xs text-gray-500">
                      {newTest.test_questions.length} selected
                    </span>
                  </div>

                  {/* Поиск вопросов */}
                  <form onSubmit={handleQuestionSearch} className="flex gap-2">
                    <input
                      type="search"
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      placeholder="Search questions..."
                      className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-500 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors"
                      disabled={loadingQuestions}
                    >
                      {loadingQuestions ? 'Loading...' : 'Search'}
                    </button>
                  </form>

                  {/* Список доступных вопросов */}
                  <div className="border border-zinc-200 rounded-lg max-h-60 overflow-y-auto">
                    {loadingQuestions ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Loading questions...
                      </div>
                    ) : filteredQuestions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {questionSearch
                          ? 'No questions found for your search'
                          : 'No questions available'}
                      </div>
                    ) : (
                      filteredQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="p-3 border-b border-zinc-200 hover:bg-gray-50 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <p className="text-neutral-700 text-sm font-normal line-clamp-2">
                              {question.title || question.text}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {question.question_type}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  question.question_complexity === 'easy'
                                    ? 'bg-green-100 text-green-800'
                                    : question.question_complexity === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {question.question_complexity}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddQuestion(question.id)}
                            disabled={newTest.test_questions.includes(
                              question.id
                            )}
                            className={`ml-2 px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                              newTest.test_questions.includes(question.id)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-800 text-white hover:bg-purple-900'
                            }`}
                          >
                            {newTest.test_questions.includes(question.id)
                              ? 'Added'
                              : 'Add'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Выбранные вопросы */}
                  {selectedQuestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-neutral-700">
                        Selected Questions:
                      </h4>
                      <div className="space-y-2">
                        {selectedQuestions.map((question) => (
                          <div
                            key={question.id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div className="flex-1">
                              <span className="text-sm text-neutral-700 truncate block">
                                {question.title || question.text}
                              </span>
                              <span className="text-xs text-gray-500">
                                {question.question_type} •{' '}
                                {question.question_complexity}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(question.id)}
                              className="ml-2 px-2 py-1 bg-pink-800 rounded text-xs text-white hover:bg-pink-900 transition-colors whitespace-nowrap"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Кнопка создания теста */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-500 rounded-xl text-white text-lg font-medium hover:bg-slate-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                      !newTest.title || newTest.test_questions.length === 0
                    }
                  >
                    Create Test
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
