
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleSheetsService } from '../services/googleSheetsService';
import type { TestResult, Exam } from '../types';
import Spinner from './Spinner';
import { BookCopy, History, FlaskConical, Eye, ChevronRight, FileText, BarChart, BadgePercent, Trophy } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, freeAttempts, paidExamIds } = useAuth();
    const { activeOrg } = useAppContext();
    const [results, setResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ avgScore: 0, bestScore: 0, examsTaken: 0 });
    const [activeTab, setActiveTab] = useState('myExams');

    useEffect(() => {
        if (!user) return;
        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const userResults = await googleSheetsService.getTestResultsForUser(user.id);
                setResults(userResults);
                
                if (userResults.length > 0) {
                    const totalScore = userResults.reduce((sum, r) => sum + r.score, 0);
                    const avg = totalScore / userResults.length;
                    const best = Math.max(...userResults.map(r => r.score));
                    setStats({
                        avgScore: parseFloat(avg.toFixed(1)),
                        bestScore: best,
                        examsTaken: userResults.length
                    });
                } else {
                    setStats({ avgScore: 0, bestScore: 0, examsTaken: 0 });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard results:", error);
                toast.error("Could not load your exam history.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchResults();
    }, [user]);

    if (isLoading || !activeOrg) {
        return <div className="flex flex-col items-center justify-center h-64"><Spinner /><p className="mt-4">Loading your dashboard...</p></div>;
    }

    const getExamName = (examId: string) => activeOrg.exams.find(e => e.id === examId)?.name || 'Unknown Exam';
    const purchasedExams = activeOrg.exams.filter(e => paidExamIds.includes(e.id) && !e.isPractice);
    const practiceExams = activeOrg.exams.filter(e => e.isPractice);

    const getBestScoreForExam = (examId: string) => {
        const examResults = results.filter(r => r.examId === examId);
        if (examResults.length === 0) return null;
        return Math.max(...examResults.map(r => r.score));
    };
    
    const TabButton: React.FC<{id: string, label: string, icon: React.ElementType}> = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 py-3 px-1 sm:px-4 text-sm sm:text-base rounded-t-lg font-semibold transition-colors duration-200 ${
                activeTab === id
                ? 'bg-white text-cyan-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                <span className="text-slate-500 hidden sm:block">Welcome back, {user?.name}!</span>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                         <div className="border-b border-slate-200">
                            <nav className="-mb-px flex space-x-1 sm:space-x-2" aria-label="Tabs">
                                <TabButton id="myExams" label="My Certifications" icon={BookCopy} />
                                <TabButton id="practice" label="Practice Tests" icon={FlaskConical} />
                                <TabButton id="history" label="Full History" icon={History} />
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="mt-6">
                            {activeTab === 'myExams' && (
                                <div className="space-y-4">
                                    {purchasedExams.length > 0 ? purchasedExams.map(exam => {
                                        const bestScore = getBestScoreForExam(exam.id);
                                        return (
                                            <div key={exam.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{exam.name}</h3>
                                                    <p className="text-sm text-slate-500">{exam.numberOfQuestions} questions</p>
                                                </div>
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    {bestScore !== null && (
                                                        <div className="text-center">
                                                            <p className="text-xs text-slate-500">Best Score</p>
                                                            <p className="font-bold text-lg text-cyan-600">{bestScore}%</p>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/test/${exam.id}`)}
                                                        className="flex-grow bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition"
                                                    >
                                                        {bestScore !== null ? 'Retake Exam' : 'Start Exam'}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    }) : (
                                        <div className="text-center py-6">
                                            <p className="text-slate-500">You haven't purchased any certification exams yet.</p>
                                            <button onClick={() => navigate('/')} className="mt-2 text-cyan-600 font-semibold hover:underline">Browse Exams</button>
                                        </div>
                                    )}
                                </div>
                            )}

                             {activeTab === 'practice' && (
                                <div className="space-y-4">
                                    <p className="text-center text-sm text-slate-500 border-b pb-4">You have <span className="font-bold text-cyan-600">{freeAttempts}</span> free practice attempts left.</p>
                                    {practiceExams.length > 0 ? practiceExams.map(exam => (
                                        <div key={exam.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-slate-700">{exam.name}</h3>
                                                <p className="text-sm text-slate-500">{exam.numberOfQuestions} questions</p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/test/${exam.id}`)}
                                                disabled={freeAttempts <= 0}
                                                className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                            >
                                                Start Practice
                                            </button>
                                        </div>
                                    )) : (
                                        <p className="text-center py-6 text-slate-500">No practice exams available.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'history' && (
                                 <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b bg-slate-50 text-slate-600">
                                                <th className="p-3">Exam Name</th>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Score</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.length > 0 ? results.map(result => {
                                                const exam = activeOrg.exams.find(e => e.id === result.examId);
                                                const isPass = exam ? result.score >= exam.passScore : false;
                                                return (
                                                    <tr key={result.testId} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="p-3 font-semibold">{getExamName(result.examId)}</td>
                                                        <td className="p-3 text-slate-500">{new Date(result.timestamp).toLocaleDateString()}</td>
                                                        <td className={`p-3 font-bold ${isPass ? 'text-green-600' : 'text-red-600'}`}>{result.score}%</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {isPass ? 'Passed' : 'Failed'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <button onClick={() => navigate(`/results/${result.testId}`)} className="text-cyan-600 hover:text-cyan-800 flex items-center text-xs">
                                                                <Eye size={14} className="mr-1" /> Review
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            }) : (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-10 text-slate-500">You haven't taken any exams yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">At a Glance</h2>
                        <div className="space-y-4">
                             <div className="flex items-center">
                                <BarChart className="text-cyan-500 mr-4" size={24} />
                                <div>
                                    <p className="text-slate-500 text-sm">Exams Taken</p>
                                    <p className="text-lg font-bold text-slate-800">{stats.examsTaken}</p>
                                </div>
                            </div>
                             <div className="flex items-center">
                                <BadgePercent className="text-cyan-500 mr-4" size={24} />
                                <div>
                                    <p className="text-slate-500 text-sm">Average Score</p>
                                    <p className="text-lg font-bold text-slate-800">{stats.avgScore}%</p>
                                </div>
                            </div>
                             <div className="flex items-center">
                                <Trophy className="text-cyan-500 mr-4" size={24} />
                                <div>
                                    <p className="text-slate-500 text-sm">Best Score</p>
                                    <p className="text-lg font-bold text-slate-800">{stats.bestScore}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Actions</h2>
                         <button onClick={() => navigate('/')} className="w-full flex justify-between items-center bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition">
                            <span>Browse Exams</span>
                            <ChevronRight size={20} />
                        </button>
                         <button onClick={() => navigate('/certificate/sample')} className="w-full flex justify-between items-center bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 transition">
                            <span>Preview Certificate</span>
                            <FileText size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
