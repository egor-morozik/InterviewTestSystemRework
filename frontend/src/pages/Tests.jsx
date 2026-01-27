import { useState } from "react";

export function Tests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    timeLimit: "",
    selectedQuestions: []
  });
  
  // Пример данных тестов
  const [tests, setTests] = useState([
    {
      id: 1,
      name: "Java Middle v.1",
      description: "Explain the difference between let, const, and var in JavaScript",
      questionsCount: 15,
      timeLimit: 60
    },
    {
      id: 2,
      name: "Python Backend",
      description: "Comprehensive Python backend development test",
      questionsCount: 20,
      timeLimit: 90
    },
    {
      id: 3,
      name: "DevOps",
      description: "DevOps tools and practices assessment",
      questionsCount: 25,
      timeLimit: 120
    }
  ]);
  
  // Пример вопросов для добавления в тест
  // eslint-disable-next-line no-unused-vars
  const [availableQuestions, setAvailableQuestions] = useState([
    { id: 1, text: "Explain the difference between let, const, and var in JavaScript", type: "coding" },
    { id: 2, text: "What is the time complexity of quicksort in the worst case?", type: "theory" },
    { id: 3, text: "Implement a function to reverse a linked list", type: "coding" },
    { id: 4, text: "Describe the SOLID principles", type: "theory" },
    { id: 5, text: "What is Docker and how does it work?", type: "devops" }
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Search tests:", searchQuery);
  };

  const handleQuestionSearch = (e) => {
    e.preventDefault();
    console.log("Search questions:", questionSearch);
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    console.log("Creating test:", newTest);
    
    // Добавляем новый тест
    const newTestObj = {
      id: tests.length + 1,
      name: newTest.name,
      description: newTest.description,
      questionsCount: newTest.selectedQuestions.length,
      timeLimit: parseInt(newTest.timeLimit) || 0
    };
    
    setTests([...tests, newTestObj]);
    
    // Очищаем форму
    setNewTest({
      name: "",
      description: "",
      timeLimit: "",
      selectedQuestions: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddQuestion = (questionId) => {
    if (!newTest.selectedQuestions.includes(questionId)) {
      setNewTest(prev => ({
        ...prev,
        selectedQuestions: [...prev.selectedQuestions, questionId]
      }));
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setNewTest(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.filter(id => id !== questionId)
    }));
  };

  const handleDeleteTest = (testId) => {
    setTests(tests.filter(test => test.id !== testId));
  };

  const handleEditTest = (test) => {
    console.log("Edit test:", test);
    // Здесь логика для редактирования теста
  };

  const handleViewDetails = (test) => {
    console.log("View details:", test);
    // Здесь логика для просмотра деталей
  };

  // Фильтрация вопросов по поиску
  const filteredQuestions = availableQuestions.filter(question =>
    question.text.toLowerCase().includes(questionSearch.toLowerCase())
  );

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
                >
                  Import Tests
                </button>
              </header>
              
              {/* Форма поиска */}
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
              </div>
              
              {/* Таблица тестов */}
              <div className="overflow-x-auto">
                {/* Заголовки таблицы */}
                <div className="grid grid-cols-12 bg-gray-50 border-b border-zinc-200 min-w-[800px]">
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
                <div className="min-w-[800px]">
                  {tests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No tests found. Create your first test.
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
                            {test.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {test.questionsCount} questions • {test.timeLimit} min
                          </div>
                        </div>
                        
                        {/* Описание */}
                        <div className="col-span-12 md:col-span-6 p-4 hidden md:block">
                          <p className="text-neutral-700 text-sm font-normal font-['Inter'] line-clamp-2">
                            {test.description}
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
            <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[60px] shadow-sm border border-neutral-100 overflow-hidden">
              
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
                    htmlFor="test-name"
                    className="block text-neutral-700 text-sm font-medium mb-2"
                  >
                    Test name
                  </label>
                  <input
                    type="text"
                    id="test-name"
                    name="name"
                    value={newTest.name}
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
                    name="timeLimit"
                    value={newTest.timeLimit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-neutral-700 text-sm"
                    placeholder="0 for no limit"
                    min="0"
                  />
                  <p className="text-xs text-neutral-400 mt-1">In minutes (0 - без ограничения)</p>
                </div>
                
                {/* Добавление вопросов */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-neutral-700 text-sm font-medium">
                      Questions
                    </label>
                    <span className="text-xs text-gray-500">
                      {newTest.selectedQuestions.length} selected
                    </span>
                  </div>
                  
                  {/* Поиск вопросов */}
                  <form 
                    onSubmit={handleQuestionSearch}
                    className="flex gap-2"
                  >
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
                    >
                      Search
                    </button>
                  </form>
                  
                  {/* Список доступных вопросов */}
                  <div className="border border-zinc-200 rounded-lg max-h-60 overflow-y-auto">
                    {filteredQuestions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No questions found
                      </div>
                    ) : (
                      filteredQuestions.map(question => (
                        <div 
                          key={question.id}
                          className="p-3 border-b border-zinc-200 hover:bg-gray-50 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <p className="text-neutral-700 text-sm font-normal line-clamp-2">
                              {question.text}
                            </p>
                            <span className="text-xs text-gray-500">{question.type}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddQuestion(question.id)}
                            disabled={newTest.selectedQuestions.includes(question.id)}
                            className={`ml-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                              newTest.selectedQuestions.includes(question.id)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-800 text-white hover:bg-purple-900'
                            }`}
                          >
                            {newTest.selectedQuestions.includes(question.id) ? 'Added' : 'Add'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Выбранные вопросы */}
                  {newTest.selectedQuestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-neutral-700">Selected Questions:</h4>
                      <div className="space-y-2">
                        {availableQuestions
                          .filter(q => newTest.selectedQuestions.includes(q.id))
                          .map(question => (
                            <div 
                              key={question.id}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm text-neutral-700 truncate">
                                {question.text}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(question.id)}
                                className="ml-2 px-2 py-1 bg-pink-800 rounded text-xs text-white hover:bg-pink-900 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Кнопка создания теста */}
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-slate-500 rounded-xl text-white text-lg font-medium hover:bg-slate-600 transition-colors"
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
  );
}