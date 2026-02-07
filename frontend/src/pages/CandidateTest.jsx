import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testsService } from '../api/implementations/testsApi'
import { candidateService } from '../api/implementations/candidateApi'

export function CandidateTest() {
  const { testId } = useParams() // Получаем ID теста из URL
  const navigate = useNavigate()
  
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [testCompleted, setTestCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Данные теста и вопросов
  const [testData, setTestData] = useState(null)
  const [questions, setQuestions] = useState([])

  // Загрузка теста и вопросов
  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) {
        setError('Test ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Загружаем данные теста
        const testResponse = await testsService.getTest(testId)
        setTestData(testResponse)
        
        // Извлекаем вопросы из теста
        const testQuestions = testResponse.test_questions || []
        const formattedQuestions = testQuestions.map((tq, index) => {
          const question = tq.question
          return {
            id: question.id,
            type: question.question_type,
            category: question.question_type === 'hr' ? 'HR Questions' : 'Tech Questions',
            question: question.title || question.text || '',
            questionType: question.question_type === 'multiple' ? 'multiple' : 
                        question.question_type === 'single' ? 'single' : 'text',
            maxLength: 1000,
            options: question.choices?.map(choice => choice.text) || [],
            order: index + 1 // <-- используем index
          }
        })
        
        setQuestions(formattedQuestions)
        
        // Устанавливаем таймер на основе time_limit теста
        const timeLimit = testResponse.time_limit || 300 // 5 минут по умолчанию
        setTimeLeft(timeLimit * 60) // конвертируем минуты в секунды
        
      } catch (err) {
        setError('Failed to load test')
        console.error('Error fetching test:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [testId])

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

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index)
  }

  const handleTestSubmit = useCallback(async () => {
    if (testCompleted) return
    
    try {
      setIsTimerRunning(false)
      setTestCompleted(true)
      
      // Форматируем ответы для отправки
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId))
        
        let answerValue = answer
        
        // Для множественного выбора конвертируем индексы в текст
        if (question?.questionType === 'multiple' && Array.isArray(answer)) {
          answerValue = answer.map(idx => question.options[idx]).join('; ')
        }
        // Для одиночного выбора конвертируем индекс в текст
        else if (question?.questionType === 'single' && typeof answer === 'number') {
          answerValue = question.options[answer]
        }
        
        return {
          question: parseInt(questionId),
          answer: answerValue
        }
      })

      // Данные кандидата (в реальном приложении нужно получать из формы входа)
      const candidateData = {
        test: testId,
        full_name: "Кандидат", // Заменить на реальные данные
        email: "candidate@example.com", // Заменить на реальные данные
        answers: formattedAnswers,
        time_spent: (testData?.time_limit * 60) - timeLeft, // потраченное время в секундах
        status: "completed"
      }

      // Отправляем результаты теста
      await candidateService.createCandidate(candidateData)
      
      console.log('Test submitted:', answers)
      
    } catch (err) {
      setError('Failed to submit test')
      console.error('Error submitting test:', err)
      // Показываем ошибку, но оставляем тест завершенным
      alert('Произошла ошибка при отправке результатов. Пожалуйста, свяжитесь с администратором.')
    }
  }, [answers, testCompleted, questions, testId, testData, timeLeft])

  // Показываем загрузку
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Загрузка теста...</h2>
          <p className="text-gray-600">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  // Проверяем, есть ли вопросы
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Тест не найден</h2>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Тест завершен!
          </h2>
          <p className="text-gray-600 mb-4">Ваши ответы успешно отправлены.</p>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Потраченное время:</p>
            <p className="font-mono">{formatTime((testData?.time_limit * 60) - timeLeft)}</p>
          </div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок теста */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {testData?.title || 'Тест для кандидата'}
              </h1>
              <p className="text-gray-600">{testData?.description || 'Вопросы от HR и TechLead'}</p>
            </div>

            <div
              className={`px-6 py-3 rounded-lg text-center ${timeLeft < 60 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}
            >
              <div className="text-sm text-gray-600 mb-1">Осталось времени</div>
              <div
                className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}
              >
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${currentQuestion.type === 'hr' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}
                  >
                    {currentQuestion.category}
                  </span>
                  <div className="text-sm text-gray-500">
                    Вопрос {currentQuestion.id}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  {currentQuestion.question}
                </h2>

                {currentQuestion.questionType === 'text' && (
                  <div className="space-y-2">
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value)
                      }
                      className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Введите ваш ответ здесь..."
                      maxLength={currentQuestion.maxLength}
                    />
                    <div className="text-right text-sm text-gray-500">
                      {(answers[currentQuestion.id] || '').length}/{currentQuestion.maxLength} символов
                    </div>
                  </div>
                )}

                {currentQuestion.questionType === 'single' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          answers[currentQuestion.id] === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={answers[currentQuestion.id] === index}
                          onChange={() =>
                            handleSingleSelect(currentQuestion.id, index)
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-3">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.questionType === 'multiple' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          (answers[currentQuestion.id] || []).includes(index)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={(answers[currentQuestion.id] || []).includes(
                            index
                          )}
                          onChange={() =>
                            handleMultipleSelect(currentQuestion.id, index)
                          }
                          className="h-4 w-4 text-green-600 rounded"
                        />
                        <span className="ml-3">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Назад
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Далее →
                  </button>
                ) : (
                  <button
                    onClick={handleTestSubmit}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Завершить
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Навигация</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => handleQuestionSelect(index)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                        currentQuestionIndex === index
                          ? 'bg-blue-600 text-white'
                          : answers[question.id]
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Статистика</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Отвечено:</span>
                    <span className="font-medium">
                      {Object.keys(answers).length}/{questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Осталось времени:</span>
                    <span className="font-mono">{formatTime(timeLeft)}</span>
                  </div>
                  <button
                    onClick={handleTestSubmit}
                    className="w-full mt-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Отправить досрочно
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}