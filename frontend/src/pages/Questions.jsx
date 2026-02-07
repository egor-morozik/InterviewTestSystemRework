import { useState, useEffect } from 'react'

export function Questions() {
  const [searchQuery, setSearchQuery] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: '',
    difficulty: '',
    tags: '',
    answer: '',
  })

  const [editingQuestion, setEditingQuestion] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
  })

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockData = [
        {
          id: 1,
          text: 'Explain the difference between let, const, and var in JavaScript',
          type: 'open-ended',
          difficulty: 'medium',
          tags: ['JavaScript', 'ES6'],
        },
      ]
      setQuestions(mockData)
    } catch (err) {
      setError('Failed to load questions')
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()

    try {
      const tagsArray = newQuestion.tags
        .split('\n')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const questionData = {
        ...newQuestion,
        tags: tagsArray,
      }

      if (editingQuestion) {
        const updatedQuestion = { ...questionData, id: editingQuestion.id }
        setQuestions(
          questions.map((q) =>
            q.id === editingQuestion.id ? updatedQuestion : q
          )
        )
      } else {
        const newId =
          questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1
        const newQuestionWithId = { ...questionData, id: newId }
        setQuestions([...questions, newQuestionWithId])
      }

      handleClearForm()
      setEditingQuestion(null)
    } catch (err) {
      setError('Failed to save question')
      console.error('Error saving question:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'text' && value.length > 500) return
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
    try {
      setQuestions(questions.filter((q) => q.id !== id))
    } catch (err) {
      setError('Failed to delete question')
      console.error('Error deleting question:', err)
    }
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setNewQuestion({
      text: question.text || '',
      type: question.type || '',
      difficulty: question.difficulty || '',
      tags: Array.isArray(question.tags)
        ? question.tags.join('\n')
        : question.tags || '',
      answer: question.answer || '',
    })
  }

  const handleViewDetails = (question) => {
    alert(
      `Details for: ${question.text}\nType: ${question.type}\nDifficulty: ${question.difficulty}`
    )
  }

  const handleImportQuestions = () => {}

  const handleClearForm = () => {
    setNewQuestion({
      text: '',
      type: '',
      difficulty: '',
      tags: '',
      answer: '',
    })
    setEditingQuestion(null)
  }

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesType = !filters.type || question.type === filters.type
    const matchesDifficulty =
      !filters.difficulty || question.difficulty === filters.difficulty
    return matchesSearch && matchesType && matchesDifficulty
  })

  const getTypeDisplay = (type) => {
    const typeMap = {
      'open-ended': 'Open-ended',
      multiple: 'Multiple Choice',
      single: 'Single Choice',
      coding: 'Coding Challenge',
    }
    return typeMap[type] || type
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
                  name="type"
                  value={filters.type}
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
                  name="difficulty"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm font-normal"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
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
                ) : filteredQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No questions found.{' '}
                    {searchQuery
                      ? 'Try different search'
                      : 'Add your first question'}
                  </div>
                ) : (
                  filteredQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`grid grid-cols-12 border-b border-zinc-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div className="col-span-4 p-3">
                        <p className="text-neutral-700 text-xs font-normal font-['Inter'] line-clamp-2">
                          {question.text}
                        </p>
                      </div>

                      <div className="col-span-2 p-3">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-slate-500 whitespace-nowrap">
                          {getTypeDisplay(question.type)}
                        </span>
                      </div>

                      <div className="col-span-2 p-3 pr-1">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                          ${
                            question.difficulty === 'easy'
                              ? 'bg-green-100 text-green-800'
                              : question.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </div>

                      <div className="col-span-1 p-3 pl-1">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(question.tags) &&
                          question.tags.length > 0 ? (
                            <span
                              className="px-1.5 py-0.5 bg-zinc-100 rounded text-neutral-700 text-xs font-normal truncate"
                              title={question.tags[0]}
                            >
                              {question.tags[0]}
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
                            className="px-1.5 py-1 bg-slate-500 rounded text-white text-xs font-medium hover:bg-slate-600 transition-colors whitespace-nowrap min-w-12.5"
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
                  htmlFor="question-text"
                  className="block text-neutral-700 text-sm font-medium mb-1"
                >
                  Question Text
                </label>
                <textarea
                  id="question-text"
                  name="text"
                  value={newQuestion.text}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-neutral-700 text-sm resize-none"
                  placeholder="Enter your question here..."
                  rows={2}
                  required
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {newQuestion.text.length}/500
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
                    name="type"
                    value={newQuestion.type}
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
                    htmlFor="difficulty"
                    className="block text-neutral-700 text-sm font-medium mb-1"
                  >
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={newQuestion.difficulty}
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
