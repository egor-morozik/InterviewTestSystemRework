import { useState, useEffect } from 'react'
import { questionsService } from '../api/questions'

export function Questions() {
  const [searchQuery, setSearchQuery] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newQuestion, setNewQuestion] = useState({
    title: '',
    question_type: '',
    question_complexity: '',
    tags: '',
    answer: '',
    tags_titles: [],
  })

  const [editingQuestion, setEditingQuestion] = useState(null)
  const [filters, setFilters] = useState({
    question_type: '',
    question_complexity: '',
  })

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Собираем параметры для API
      const params = {}

      if (searchQuery) {
        params.search = searchQuery
      }

      if (filters.question_type) {
        params.question_type = filters.question_type
      }

      if (filters.question_complexity) {
        params.question_complexity = filters.question_complexity
      }

      const response = await questionsService.getAllQuestions(params)
      setQuestions(response)
    } catch (err) {
      setError('Failed to load questions')
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = {}

        if (searchQuery) {
          params.search = searchQuery
        }

        if (filters.question_type) {
          params.question_type = filters.question_type
        }

        if (filters.question_complexity) {
          params.question_complexity = filters.question_complexity
        }

        const response = await questionsService.getAllQuestions(params)
        setQuestions(response)
      } catch (err) {
        setError('Failed to load questions')
        console.error('Error fetching questions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [searchQuery, filters.question_type, filters.question_complexity])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchQuestions() // Выполняем поиск с текущими параметрами
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()

    try {
      setError(null)

      // Преобразуем теги из строки в массив
      const tagsArray = newQuestion.tags
        .split('\n')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const questionData = {
        ...newQuestion,
        tags_titles: tagsArray,
      }

      if (editingQuestion) {
        // Обновление существующего вопроса
        const response = await questionsService.updateQuestion(
          editingQuestion.id,
          questionData
        )
        setQuestions(
          questions.map((q) => (q.id === editingQuestion.id ? response : q))
        )
      } else {
        // Создание нового вопроса
        const response = await questionsService.createQuestion(questionData)
        setQuestions([...questions, response])
      }

      handleClearForm()
      setEditingQuestion(null)

      // Обновляем список вопросов
      await fetchQuestions()
    } catch (err) {
      setError('Failed to save question')
      console.error('Error saving question:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'title' && value.length > 500) return
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      setError(null)
      await questionsService.deleteQuestion(id)
      setQuestions(questions.filter((q) => q.id !== id))
    } catch (err) {
      setError('Failed to delete question')
      console.error('Error deleting question:', err)
    }
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setNewQuestion({
      title: question.title || '',
      question_type: question.question_type || '',
      question_complexity: question.question_complexity || '',
      tags: Array.isArray(question.tags)
        ? question.tags.map((t) => t.title).join('\n')
        : question.tags_titles?.join('\n') || '',
      answer: question.answer || '',
      tags_titles: question.tags_titles || [],
    })
  }

  const handleViewDetails = (question) => {
    alert(
      `Details:\nTitle: ${question.title}\nType: ${question.question_type}\nDifficulty: ${question.question_complexity}\nTags: ${Array.isArray(question.tags) ? question.tags.map((t) => t.title).join(', ') : question.tags_titles?.join(', ')}`
    )
  }

  const handleImportQuestions = () => {
    // TODO: Реализовать импорт вопросов
    alert('Import functionality not implemented yet')
  }

  const handleClearForm = () => {
    setNewQuestion({
      title: '',
      question_type: '',
      question_complexity: '',
      tags: '',
      answer: '',
      tags_titles: [],
    })
    setEditingQuestion(null)
  }

  const handleApplyFilters = () => {
    fetchQuestions()
  }

  const handleClearFilters = () => {
    setFilters({
      question_type: '',
      question_complexity: '',
    })
    setSearchQuery('')
    // После очистки фильтров нужно обновить данные
    setTimeout(() => fetchQuestions(), 0)
  }

  const getTypeDisplay = (type) => {
    const typeMap = {
      'open-ended': 'Open-ended',
      multiple: 'Multiple Choice',
      single: 'Single Choice',
      coding: 'Coding Challenge',
    }
    return typeMap[type] || type
  }

  const getComplexityDisplay = (complexity) => {
    const complexityMap = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    }
    return complexityMap[complexity] || complexity
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6 max-w-400 mx-auto">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
            <header className="px-4 py-4 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-neutral-700 text-xl font-extrabold font-['Inter']">
                Question Library
              </h1>

              <button
                onClick={handleImportQuestions}
                className="px-4 py-2 bg-slate-500 rounded text-white text-sm font-medium hover:bg-slate-600 transition-colors whitespace-nowrap"
              >
                Import Questions
              </button>
            </header>

            <div className="p-4 border-b border-zinc-200 space-y-4">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search question..."
                    className="w-full px-4 py-2 text-neutral-700 text-sm font-normal bg-white rounded-lg border border-zinc-200 outline-none placeholder:text-neutral-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-500 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  name="question_type"
                  value={filters.question_type}
                  onChange={handleFilterChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm font-normal"
                >
                  <option value="">All Types</option>
                  <option value="open-ended">Open-ended</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="single">Single Choice</option>
                  <option value="coding">Coding Challenge</option>
                </select>

                <select
                  name="question_complexity"
                  value={filters.question_complexity}
                  onChange={handleFilterChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm font-normal"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-slate-500 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors whitespace-nowrap"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors whitespace-nowrap"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div>
              <div className="grid grid-cols-12 bg-gray-50 border-b border-zinc-200 text-xs">
                <div className="col-span-4 p-3">
                  <span className="text-neutral-700 font-bold font-['Inter']">
                    Question
                  </span>
                </div>

                <div className="col-span-2 p-3">
                  <span className="text-neutral-700 font-bold font-['Inter']">
                    Type
                  </span>
                </div>

                <div className="col-span-2 p-3 pr-1">
                  <span className="text-neutral-700 font-bold font-['Inter']">
                    Difficulty
                  </span>
                </div>

                <div className="col-span-1 p-3 pl-1">
                  <span className="text-neutral-700 font-bold font-['Inter']">
                    Tags
                  </span>
                </div>

                <div className="col-span-3 p-3">
                  <span className="text-neutral-700 font-bold font-['Inter']">
                    Actions
                  </span>
                </div>
              </div>

              <div>
                {loading ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Loading questions...
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500 text-sm">
                    {error}
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No questions found.{' '}
                    {searchQuery ||
                    filters.question_type ||
                    filters.question_complexity
                      ? 'Try different search or filters'
                      : 'Add your first question'}
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`grid grid-cols-12 border-b border-zinc-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div className="col-span-4 p-3">
                        <p className="text-neutral-700 text-xs font-normal font-['Inter'] line-clamp-2">
                          {question.title}
                        </p>
                      </div>

                      <div className="col-span-2 p-3">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-slate-500 whitespace-nowrap">
                          {getTypeDisplay(question.question_type)}
                        </span>
                      </div>

                      <div className="col-span-2 p-3 pr-1">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                          ${
                            question.question_complexity === 'easy'
                              ? 'bg-green-100 text-green-800'
                              : question.question_complexity === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {getComplexityDisplay(question.question_complexity)}
                        </span>
                      </div>

                      <div className="col-span-1 p-3 pl-1">
                        <div className="flex flex-wrap gap-1">
                          {question.tags && question.tags.length > 0 ? (
                            <span
                              className="px-1.5 py-0.5 bg-zinc-100 rounded text-neutral-700 text-xs font-normal truncate"
                              title={question.tags
                                .map((t) => t.title)
                                .join(', ')}
                            >
                              {question.tags[0].title}
                              {question.tags.length > 1 &&
                                ` +${question.tags.length - 1}`}
                            </span>
                          ) : question.tags_titles &&
                            question.tags_titles.length > 0 ? (
                            <span
                              className="px-1.5 py-0.5 bg-zinc-100 rounded text-neutral-700 text-xs font-normal truncate"
                              title={question.tags_titles.join(', ')}
                            >
                              {question.tags_titles[0]}
                              {question.tags_titles.length > 1 &&
                                ` +${question.tags_titles.length - 1}`}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-3 p-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleViewDetails(question)}
                            className="px-1.5 py-1 bg-purple-800 rounded text-white text-xs font-medium hover:bg-purple-900 transition-colors whitespace-nowrap min-w-12.5"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="px-1.5 py-1 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors whitespace-nowrap min-w-11.25"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="px-1.5 py-1 bg-pink-800 rounded text-white text-xs font-medium hover:bg-pink-900 transition-colors whitespace-nowrap min-w-12.5"
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

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden sticky top-6">
            <header className="px-4 py-4 border-b border-zinc-200">
              <h2 className="text-neutral-700 text-lg font-extrabold font-['Inter']">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h2>
            </header>

            <form onSubmit={handleAddQuestion} className="p-4 space-y-4">
              <div>
                <label
                  htmlFor="question-title"
                  className="block text-neutral-700 text-sm font-medium mb-1"
                >
                  Question Title
                </label>
                <textarea
                  id="question-title"
                  name="title"
                  value={newQuestion.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm resize-none"
                  placeholder="Enter your question here..."
                  rows={2}
                  required
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {newQuestion.title.length}/500
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="question-type"
                    className="block text-neutral-700 text-sm font-medium mb-1"
                  >
                    Type
                  </label>
                  <select
                    id="question-type"
                    name="question_type"
                    value={newQuestion.question_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    <option value="open-ended">Open-ended</option>
                    <option value="multiple">Multiple Choice</option>
                    <option value="single">Single Choice</option>
                    <option value="coding">Coding Challenge</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="question-complexity"
                    className="block text-neutral-700 text-sm font-medium mb-1"
                  >
                    Difficulty
                  </label>
                  <select
                    id="question-complexity"
                    name="question_complexity"
                    value={newQuestion.question_complexity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="block text-neutral-700 text-sm font-medium mb-1"
                >
                  Tags (one per line)
                </label>
                <textarea
                  id="tags"
                  name="tags"
                  value={newQuestion.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm resize-none"
                  placeholder="JavaScript"
                  rows={1}
                />
              </div>

              <div>
                <label
                  htmlFor="answer"
                  className="block text-neutral-700 text-sm font-medium mb-1"
                >
                  Answer
                </label>
                <textarea
                  id="answer"
                  name="answer"
                  value={newQuestion.answer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm resize-none"
                  placeholder="Enter the answer here..."
                  rows={2}
                  required
                />
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-3 py-1.5 bg-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-500 rounded-lg text-white text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  {editingQuestion ? 'Update' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
