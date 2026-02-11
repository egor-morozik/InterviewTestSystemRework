import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { attemptsService } from '../api/implementations/attemptsApi'

export function CandidateTest() {
  const { id } = useParams() // Получаем ID попытки из URL
  const navigate = useNavigate()

  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [testCompleted, setTestCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Данные теста и вопросов
  const [questions, setQuestions] = useState([])

  // Определяем handleTestSubmit ДО useEffect который его использует
  const handleTestSubmit = useCallback(async () => {
    if (testCompleted || !id) return

    try {
      setIsTimerRunning(false)
      setTestCompleted(true)

      // Форматируем ответы для отправки
      const formattedAnswers = questions.map((question) => {
        const answer = answers[question.id]

        let responseValue = ''

        if (question.questionType === 'multiple' && Array.isArray(answer)) {
          responseValue = answer.map((idx) => question.options[idx]).join('; ')
        } else if (
          question.questionType === 'single' &&
          typeof answer === 'number'
        ) {
          responseValue = question.options[answer]
        } else if (typeof answer === 'string') {
          responseValue = answer
        }

        return {
          question: question.id,
          response: responseValue,
        }
      })

      // Отправляем результаты теста
      await attemptsService.submitAttempt(id, {
        answers: formattedAnswers,
      })

      console.log('Test submitted successfully')
    } catch (err) {
      console.error('Error submitting test:', err)
      alert(
        'Произошла ошибка при отправке результатов. Пожалуйста, свяжитесь с администратором.'
      )
    }
  }, [answers, testCompleted, questions, id])

  // Логирование активности
  const logActivity = useCallback(
    async (eventType) => {
      if (!id) return

      try {
        await attemptsService.logActivity(id, {
          event_type: eventType,
        })
      } catch (err) {
        console.error('Error logging activity:', err)
      }
    },
    [id]
  )

  // Загрузка теста по ID попытки
  useEffect(() => {
    const fetchAttemptData = async () => {
      if (!id) {
        setError('Attempt ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Загружаем данные попытки по ID
        const response = await attemptsService.getAttemptData(id)

        // Проверяем, не завершен ли уже тест
        if (response.completed) {
          setError('This test has already been completed')
          setLoading(false)
          return
        }

        // Извлекаем вопросы из теста
        const testQuestions = response.questions || []
        const formattedQuestions = testQuestions.map((question, index) => {
          return {
            id: question.id,
            type: question.question_type,
            category:
              question.question_type === 'hr'
                ? 'HR Questions'
                : 'Tech Questions',
            question: question.content || question.title || '',
            questionType:
              question.question_type === 'multiple'
                ? 'multiple'
                : question.question_type === 'single'
                  ? 'single'
                  : 'text',
            maxLength: 1000,
            options: question.choices?.map((choice) => choice.text) || [],
            order: index + 1,
          }
        })

        setQuestions(formattedQuestions)

        // Устанавливаем таймер на основе time_limit теста
        const timeLimit = response.time_limit || 300 // 5 минут по умолчанию
        setTimeLeft(timeLimit * 60) // конвертируем минуты в секунды
      } catch (err) {
        let errorMessage = 'Failed to load test'
        
        if (err.response?.status === 404) {
          errorMessage = 'Test attempt not found. This attempt ID does not exist.'
        } else if (err.response?.status === 400) {
          errorMessage = `Error: ${err.response.data?.detail || err.response.data?.error || 'Bad request'}`
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. You do not have permission to access this test.'
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (err.message === 'Network Error') {
          errorMessage = 'Network error. Please check your connection.'
        }
        
        setError(errorMessage)
        console.error('Error fetching attempt:', err.response?.data || err.message || err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttemptData()
  }, [id])

  // Таймер
  useEffect(() => {
    if (!isTimerRunning || testCompleted || loading) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTestSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerRunning, testCompleted, loading, handleTestSubmit])

  // Отслеживание активности кандидата
  useEffect(() => {
    if (!id || testCompleted || loading) return

    // Отслеживание видимости страницы (hidden/visible)
    const handleVisibilityChange = () => {
      const eventType = document.hidden ? 'hidden' : 'visible'
      logActivity(eventType)
      console.log(`Activity logged: ${eventType}`)
    }

    // Отслеживание копирования текста
    const handleCopy = () => {
      logActivity('copytext')
      console.log('Activity logged: copytext')
    }

    // Отслеживание попыток скриншота (Ctrl+PrintScreen, Windows+PrintScreen, etc.)
    const handleKeyDown = (e) => {
      if (
        (e.key === 'PrintScreen') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.metaKey && e.shiftKey && e.key === '4')
      ) {
        logActivity('screenshot')
        console.log('Activity logged: screenshot')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [id, testCompleted, loading, logActivity])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSingleSelect = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleMultipleSelect = (questionId, optionIndex) => {
    const currentAnswers = answers[questionId] || []
    const isSelected = currentAnswers.includes(optionIndex)

    const newAnswers = isSelected
      ? currentAnswers.filter((idx) => idx !== optionIndex)
      : [...currentAnswers, optionIndex]

    setAnswers((prev) => ({
      ...prev,
      [questionId]: newAnswers.sort((a, b) => a - b),
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  // Логирование переключения вкладок
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logActivity('hidden')
      } else {
        logActivity('visible')
      }
    }

    const handleCopy = () => {
      logActivity('copytext')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('copy', handleCopy)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('copy', handleCopy)
    }
  }, [logActivity])

  // Показываем загрузку
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Загрузка теста...
          </h2>
          <p className="text-gray-600">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  // Показываем ошибку
  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '16px' }}>Ошибка загрузки теста</h1>
          <p style={{ fontSize: '16px', color: '#333', marginBottom: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</p>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>ID попытки: {id}</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{ padding: '10px 20px', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '0', cursor: 'pointer', fontSize: '16px', fontWeight: 'normal' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#000'}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  // Проверяем, есть ли вопросы
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Тест не найден
          </h2>
          <p className="text-gray-600 mb-4">В этом тесте нет вопросов</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h2 className="text-2xl mb-4">Тест завершен!</h2>
          <p>Ваши ответы успешно отправлены.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Шапка с таймером */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 md:px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </p>
          </div>
          <div
            className={`text-right px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'text-gray-600'}`}
          >
            <div className="text-sm">Осталось</div>
            <div className="font-mono font-bold text-lg">{formatTime(timeLeft)}</div>
          </div>
        </div>
        {/* Прогресс-бар */}
        <div className="max-w-4xl mx-auto mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Вопрос */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            {/* Варианты ответов */}
            <div className="space-y-3">
              {currentQuestion.questionType === 'text' && (
                <div className="space-y-2">
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    className="w-full min-h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                    placeholder="Введите ваш ответ..."
                    maxLength={currentQuestion.maxLength}
                  />
                  <div className="text-right text-xs text-gray-500">
                    {(answers[currentQuestion.id] || '').length}/{currentQuestion.maxLength}
                  </div>
                </div>
              )}

              {currentQuestion.questionType === 'single' && (
                currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === index}
                      onChange={() => handleSingleSelect(currentQuestion.id, index)}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3 text-base text-gray-800">{option}</span>
                  </label>
                ))
              )}

              {currentQuestion.questionType === 'multiple' && (
                currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      (answers[currentQuestion.id] || []).includes(index)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(answers[currentQuestion.id] || []).includes(index)}
                      onChange={() => handleMultipleSelect(currentQuestion.id, index)}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-base text-gray-800">{option}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопки навигации внизу */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 md:px-6">
        <div className="max-w-4xl mx-auto flex gap-4 justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ← Назад
          </button>

          <div className="flex gap-4">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Далее →
              </button>
            ) : (
              <button
                onClick={handleTestSubmit}
                className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Отправить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
