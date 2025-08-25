'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'text';
  options?: string[];
  placeholder?: string;
}

interface Response {
  questionId: number;
  question: string;
  answer: string;
}

interface UserProfile {
  lifeStage: string;
  field: string;
  goal: string;
  name: string;
  email: string;
}

export default function AssessmentPage() {
  // 🔧 CRITICAL: ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT TOP LEVEL
  const { user } = useUser();
  const router = useRouter();
  
  // Assessment flow states
  const [currentStep, setCurrentStep] = useState<'profiling' | 'assessment' | 'analyzing'>('profiling');
  const [profileStep, setProfileStep] = useState(0);
  
  // Profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    lifeStage: '',
    field: '',
    goal: '',
    name: user?.firstName || '',
    email: user?.emailAddresses?.[0]?.emailAddress || ''
  });
  
  // Assessment data
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedChoice, setSelectedChoice] = useState('');
  const [otherText, setOtherText] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile form states (for conditional rendering)
  const [profileAnswer, setProfileAnswer] = useState('');
  const [profileOtherText, setProfileOtherText] = useState('');

  // 🔧 CRITICAL: useEffect MUST ALWAYS BE CALLED - NO CONDITIONS
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      const existingResponse = responses.find(r => r.questionId === currentQuestion.id);
      
      if (existingResponse) {
        if (currentQuestion.type === 'text') {
          setCurrentAnswer(existingResponse.answer);
        } else {
          if (existingResponse.answer.startsWith('Other: ')) {
            setSelectedChoice('Other (Please specify)');
            setOtherText(existingResponse.answer.substring(7));
          } else {
            setSelectedChoice(existingResponse.answer);
            setOtherText('');
          }
        }
      } else {
        setCurrentAnswer('');
        setSelectedChoice('');
        setOtherText('');
      }
    }
  }, [currentQuestionIndex, questions, responses]);

  // Profiling questions configuration
  const profilingQuestions = [
    {
      id: 'lifeStage',
      question: 'Which of the following best describes you?',
      options: [
        'High school student (grades 9-12)',
        'College/University student',
        'Recent graduate (within 2 years)',
        'Working professional (0-5 years experience)',
        'Experienced professional (5+ years)',
        'Career changer/seeking new direction',
        'Other (Please specify)'
      ]
    },
    {
      id: 'field',
      question: 'What field are you studying or working in?',
      options: [
        'Technology/Engineering',
        'Business/Finance',
        'Healthcare/Life Sciences',
        'Arts/Creative',
        'Education',
        'Still exploring/Undecided',
        'Other (Please specify)'
      ]
    },
    {
      id: 'goal',
      question: "What's your main goal for this assessment?",
      options: [
        'Choosing a college major',
        'Exploring career options after graduation',
        'Planning a career change',
        'Advancing in my current field',
        'Finding my first job',
        'Understanding my strengths and interests'
      ]
    }
  ];

  const handleProfileAnswer = (questionId: string, answer: string, customText?: string) => {
    const finalAnswer = customText ? `Other: ${customText}` : answer;
    
    setUserProfile(prev => ({
      ...prev,
      [questionId]: finalAnswer
    }));
    
    if (profileStep < profilingQuestions.length - 1) {
      setProfileStep(profileStep + 1);
      // Reset profile form states
      setProfileAnswer('');
      setProfileOtherText('');
    } else {
      startMainAssessment({
        ...userProfile,
        [questionId]: finalAnswer
      });
    }
  };

  const startMainAssessment = async (completeProfile: UserProfile) => {
    setLoading(true);
    setCurrentStep('assessment');
    setError(null);
    
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userProfile: completeProfile,
          responses: [], 
          currentQuestionIndex: 0 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        throw new Error('No valid questions received from API');
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      setError(error instanceof Error ? error.message : 'Failed to start assessment');
    }
    
    setLoading(false);
  };

  const saveCurrentAnswer = (answer: string) => {
    if (!questions || questions.length === 0 || currentQuestionIndex >= questions.length) {
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const newResponse: Response = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: answer,
    };
    
    const updatedResponses = [...responses];
    const existingIndex = updatedResponses.findIndex(r => r.questionId === currentQuestion.id);
    
    if (existingIndex >= 0) {
      updatedResponses[existingIndex] = newResponse;
    } else {
      updatedResponses.push(newResponse);
    }
    
    setResponses(updatedResponses);
    return updatedResponses;
  };

  const handleMultipleChoiceAnswer = (option: string) => {
    if (option === 'Other (Please specify)') {
      setSelectedChoice(option);
    } else {
      setSelectedChoice(option);
      const updatedResponses = saveCurrentAnswer(option);
      
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          handleNext();
        } else if (updatedResponses && updatedResponses.length < 6) {
          generateNextQuestion(updatedResponses);
        } else {
          finishAssessment(updatedResponses || responses);
        }
      }, 300);
    }
  };

  const handleOtherTextSubmit = () => {
    if (!otherText.trim()) {
      alert('Please specify your answer for the "Other" option.');
      return;
    }
    
    const combinedAnswer = `Other: ${otherText.trim()}`;
    const updatedResponses = saveCurrentAnswer(combinedAnswer);
    
    if (currentQuestionIndex < questions.length - 1) {
      handleNext();
    } else if (updatedResponses && updatedResponses.length < 6) {
      generateNextQuestion(updatedResponses);
    } else {
      finishAssessment(updatedResponses || responses);
    }
  };

  const handleTextAnswer = () => {
    if (!currentAnswer.trim()) return;
    
    const updatedResponses = saveCurrentAnswer(currentAnswer);
    
    if (currentQuestionIndex < questions.length - 1) {
      handleNext();
    } else if (updatedResponses && updatedResponses.length < 6) {
      generateNextQuestion(updatedResponses);
    } else {
      finishAssessment(updatedResponses || responses);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const generateNextQuestion = async (currentResponses: Response[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userProfile,
          responses: currentResponses, 
          currentQuestionIndex: questions.length 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.question) {
        setQuestions([...questions, data.question]);
        setCurrentQuestionIndex(questions.length);
      } else {
        throw new Error('No question received from API');
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      setError(error instanceof Error ? error.message : 'Failed to get next question');
    }
    
    setLoading(false);
  };

  const finishAssessment = async (finalResponses: Response[]) => {
    setCurrentStep('analyzing');
    
    try {
      const response = await fetch('/api/assessment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          responses: finalResponses,
          userProfile: userProfile
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const analysis = await response.json();
      
      if (analysis.error) {
        throw new Error(analysis.error);
      }
      
      localStorage.setItem('assessmentResults', JSON.stringify(analysis));
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      router.push('/assessment/results');
    } catch (error) {
      console.error('Error analyzing assessment:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze assessment');
      setCurrentStep('assessment');
    }
  };

  const resetAssessment = () => {
    setError(null);
    setCurrentStep('profiling');
    setProfileStep(0);
    setQuestions([]);
    setResponses([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setSelectedChoice('');
    setOtherText('');
    setProfileAnswer('');
    setProfileOtherText('');
    setUserProfile({
      lifeStage: '',
      field: '',
      goal: '',
      name: user?.firstName || '',
      email: user?.emailAddresses?.[0]?.emailAddress || ''
    });
  };

  // 🔧 CRITICAL: ALL CONDITIONAL RENDERING AFTER ALL HOOKS
  
  // Error state rendering
  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-3xl text-red-600">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assessment Error</h1>
          <p className="text-red-600 mb-8 max-w-md mx-auto">{error}</p>
          <button onClick={resetAssessment} className="btn-primary">
            Start Over
          </button>
        </div>
      </main>
    );
  }

  // Profiling step rendering
  if (currentStep === 'profiling') {
    const currentProfile = profilingQuestions[profileStep];

    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">AI Career Assessment</h1>
            <span className="text-sm text-gray-700 font-medium">
              Step {profileStep + 1} of {profilingQuestions.length + 1}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-ai-purple to-ai-blue h-2 rounded-full transition-all duration-500"
              style={{ width: `${((profileStep + 1) / (profilingQuestions.length + 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Intro card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-ai-purple to-ai-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👋</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Tell us about yourself
            </h2>
            <p className="text-gray-600">
              This helps us ask the right questions for your situation
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              {currentProfile.question}
            </h3>
            
            <div className="space-y-3">
              {currentProfile.options.map((option, index) => (
                <div key={index}>
                  <button
                    onClick={() => {
                      if (option.includes('Other')) {
                        setProfileAnswer(option);
                      } else {
                        handleProfileAnswer(currentProfile.id, option);
                      }
                    }}
                    className={`w-full text-left p-4 border-2 rounded-xl transition-all font-medium ${
                      profileAnswer === option
                        ? 'border-ai-purple bg-ai-purple/10 text-ai-purple'
                        : 'border-gray-300 hover:border-ai-purple hover:bg-ai-purple/5 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        profileAnswer === option
                          ? 'border-ai-purple bg-ai-purple'
                          : 'border-gray-400'
                      }`}>
                        {profileAnswer === option && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                  
                  {profileAnswer === option && option.includes('Other') && (
                    <div className="mt-4 ml-8">
                      <input
                        type="text"
                        value={profileOtherText}
                        onChange={(e) => setProfileOtherText(e.target.value)}
                        placeholder="Please specify..."
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-ai-purple focus:ring-2 focus:ring-ai-purple/20 outline-none text-gray-800"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleProfileAnswer(currentProfile.id, option, profileOtherText)}
                          disabled={!profileOtherText.trim()}
                          className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
                        >
                          Continue →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Analyzing state rendering
  if (currentStep === 'analyzing') {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ai-purple mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Your Responses...</h2>
          <p className="text-gray-700 mb-4">
            Our AI is processing your answers and generating personalized insights.
          </p>
          <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-600">
              ✨ Analyzing your {userProfile.lifeStage.toLowerCase()} profile<br/>
              🎯 Generating {userProfile.field} recommendations<br/>
              🚀 Creating your personalized action plan
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Main assessment rendering
  const currentQuestion = questions && questions.length > currentQuestionIndex ? questions[currentQuestionIndex] : null;
  const progress = Math.min(((currentQuestionIndex + 1) / 6) * 100, 100);

  if (!currentQuestion) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ai-purple mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your personalized questions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Career Assessment</h1>
          <span className="text-sm text-gray-700 font-medium">
            {Math.min(currentQuestionIndex + 1, 6)} of 6 questions
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-ai-purple to-ai-blue h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Profile Context */}
      <div className="rounded-lg p-4 mb-6 border border-blue-200 bg-blue-50">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Personalized for:</span> {userProfile.lifeStage} interested in {userProfile.field}
        </p>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center leading-relaxed">
            {currentQuestion.question}
          </h2>
          
          {/* Answer Section */}
          <div className="max-w-2xl mx-auto">
            {currentQuestion.type === 'multiple_choice' ? (
              <div className="space-y-4">
                {currentQuestion.options?.map((option, index) => (
                  <div key={index}>
                    <button
                      onClick={() => handleMultipleChoiceAnswer(option)}
                      disabled={loading}
                      className={`w-full text-left p-4 border-2 rounded-xl transition-all disabled:opacity-50 font-medium ${
                        selectedChoice === option
                          ? 'border-ai-purple bg-ai-purple/10 text-ai-purple'
                          : 'border-gray-300 hover:border-ai-purple hover:bg-ai-purple/5 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedChoice === option
                            ? 'border-ai-purple bg-ai-purple'
                            : 'border-gray-400'
                        }`}>
                          {selectedChoice === option && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                    
                    {selectedChoice === option && option.includes('Other') && option.includes('specify') && (
                      <div className="mt-4 ml-8">
                        <textarea
                          value={otherText}
                          onChange={(e) => setOtherText(e.target.value)}
                          placeholder="Please specify your answer here..."
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-ai-purple focus:ring-2 focus:ring-ai-purple/20 outline-none text-gray-800 resize-none"
                          rows={3}
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={handleOtherTextSubmit}
                            disabled={!otherText.trim() || loading}
                            className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
                          >
                            Continue →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={currentQuestion.placeholder || "Please share your thoughts..."}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-ai-purple focus:ring-2 focus:ring-ai-purple/20 outline-none text-gray-800 font-medium resize-none transition-all"
                  rows={5}
                />
                <div className="text-center">
                  <button
                    onClick={handleTextAnswer}
                    disabled={!currentAnswer.trim() || loading}
                    className="btn-primary px-8 py-3 disabled:opacity-50"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>←</span>
          <span>Previous</span>
        </button>

        <div className="text-center">
          <span className="text-sm text-gray-600 font-medium">
            {responses.length >= 6 ? 'Ready to finish!' : `${6 - responses.length} questions remaining`}
          </span>
        </div>

        <button
          onClick={responses.length >= 6 ? () => finishAssessment(responses) : handleNext}
          disabled={
            loading || 
            (currentQuestion.type === 'text' && !currentAnswer.trim()) || 
            (currentQuestion.type === 'multiple_choice' && !selectedChoice) ||
            (selectedChoice?.includes('Other') && selectedChoice?.includes('specify') && !otherText.trim())
          }
          className="flex items-center space-x-2 btn-primary px-6 py-3 disabled:opacity-50"
        >
          <span>{loading ? 'Loading...' : responses.length >= 6 ? 'Finish Assessment' : 'Next'}</span>
          {!loading && <span>→</span>}
        </button>
      </div>

      {loading && (
        <div className="text-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ai-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your next personalized question...</p>
        </div>
      )}
    </main>
  );
}