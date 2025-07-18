import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { googleSheetsService } from '../services/googleSheetsService';
import type { Question, UserAnswer, Exam } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import Spinner from './Spinner';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

const Test: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeOrg } = useAppContext();

  const [examConfig, setExamConfig] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  useEffect(() => {
    if (!examId || !activeOrg) {
        toast.error("Exam configuration missing.");
        navigate('/dashboard');
        return;
    }

    const config = googleSheetsService.getExamConfig(activeOrg.id, examId);
    if (!config) {
        toast.error("Could not find the specified exam.");
        navigate('/dashboard');
        return;
    }
    setExamConfig(config);

    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const fetchedQuestions = await googleSheetsService.getQuestions(config);
        if (fetchedQuestions.length === 0) {
            toast.error("Could not load questions for this exam.");
            navigate('/dashboard');
            return;
        }
        setQuestions(fetchedQuestions);
      } catch (error) {
        toast.error('Failed to load the test.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [examId, activeOrg, navigate]);

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setAnswers(prev => new Map(prev).set(questionId, optionIndex));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.size !== questions.length) {
        toast.error('Please answer all questions before submitting.');
        return;
    }
    
    if(!user || !activeOrg || !examId) {
        toast.error("Cannot submit: user or exam context is missing.");
        navigate('/');
        return;
    }

    setIsSubmitting(true);
    try {
        const userAnswers: UserAnswer[] = Array.from(answers.entries()).map(([questionId, answer]) => ({
            questionId,
            answer,
        }));
        
        const result = await googleSheetsService.submitTest(user.id, activeOrg.id, examId, userAnswers);
        toast.success("Test submitted successfully!");
        navigate(`/results/${result.testId}`);

    } catch(error) {
        toast.error("Failed to submit the test. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading || !examConfig) {
    return <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md"><Spinner /><p className="mt-4 text-slate-600">Loading your test...</p></div>;
  }

  if (questions.length === 0) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-md"><p>No questions available for this exam.</p></div>
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{examConfig.name}</h1>
      <p className="text-slate-500 mb-6">Question {currentQuestionIndex + 1} of {questions.length}</p>

      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
        <div className="bg-cyan-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="mb-8 min-h-[80px]">
        <p className="text-lg font-semibold text-slate-700">{currentQuestion.question}</p>
      </div>

      <div className="space-y-4 mb-8">
        {currentQuestion.options.map((option, index) => (
          <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${answers.get(currentQuestion.id) === index ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-300 hover:border-cyan-400'}`}>
            <input
              type="radio"
              name={`question-${currentQuestion.id}`}
              checked={answers.get(currentQuestion.id) === index}
              onChange={() => handleAnswerSelect(currentQuestion.id, index)}
              className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-300"
            />
            <span className="ml-4 text-slate-700">{option}</span>
          </label>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          className="flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>
        
        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || answers.size !== questions.length}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition disabled:bg-green-300"
          >
            {isSubmitting ? <Spinner /> : <><Send size={16}/> <span>Submit</span></>}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Test;