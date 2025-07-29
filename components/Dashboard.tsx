import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleSheetsService } from '../services/googleSheetsService';
import type { TestResult, Exam } from '../types';
import Spinner from './Spinner';
import { BarChart, BadgePercent, Trophy, FileText, Eye, Repeat, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, subtitle: string }> = ({ icon: Icon, title, value, subtitle }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
        <div className="bg-cyan-100 p-3 rounded-full">
            <Icon className="text-cyan-600" size={24} />
        </div>
        <div>
            <p className="text-slate-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-slate-400 text-xs">{subtitle}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, freeAttempts, paidExamIds } = useAuth();
    const { activeOrg } = useAppContext();
    const [results, setResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ avgScore: 0, bestScore: 0, examsTaken: 0 });

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
    const purchasedExams = activeOrg.exams.filter(e => paidExamIds.includes(e.id));

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-slate-800">Welcome, {user?.name}!</h1>
            
            {/* My Purchased Exams Section */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">My Purchased Exams</h2>
                {purchasedExams.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {purchasedExams.map(exam => (
                            <div key={exam.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-700">{exam.name}</h3>
                                    <p className="text-sm text-slate-500">{exam.numberOfQuestions} questions</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/test/${exam.id}`)}
                                    className="mt-4 w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition"
                                >
                                    Start Exam
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-slate-500">You haven't purchased any certification exams yet.</p>
                        <button onClick={() => navigate('/')} className="mt-2 text-cyan-600 font-semibold hover:underline">
                            Browse Exams
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BarChart} title="Exams Taken" value={stats.examsTaken} subtitle="Total tests completed." />
                <StatCard icon={Repeat} title="Free Attempts" value={freeAttempts} subtitle="Available this month." />
                <StatCard icon={BadgePercent} title="Average Score" value={`${stats.avgScore}%`} subtitle="Across all of your attempts." />
                <StatCard icon={Trophy} title="Best Score" value={`${stats.bestScore}%`} subtitle="Your highest score so far." />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Exam History */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Exam History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-slate-600 text-sm">
                                    <th className="py-2">Exam Name</th>
                                    <th className="py-2">Date</th>
                                    <th className="py-2">Score</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.length > 0 ? results.map(result => {
                                    const exam = activeOrg.exams.find(e => e.id === result.examId);
                                    const isPass = exam ? result.score >= exam.passScore : false;
                                    return (
                                        <tr key={result.testId} className="border-b border-slate-100">
                                            <td className="py-4 font-semibold">{getExamName(result.examId)}</td>
                                            <td className="py-4 text-slate-500">{new Date(result.timestamp).toLocaleDateString()}</td>
                                            <td className={`py-4 font-bold ${isPass ? 'text-green-600' : 'text-red-600'}`}>{result.score}%</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {isPass ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <button onClick={() => navigate(`/results/${result.testId}`)} className="text-cyan-600 hover:text-cyan-800 flex items-center">
                                                    <Eye size={16} className="mr-1" /> Review
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
                </div>
                
                {/* Actions Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Start New Exam</h2>
                        <p className="text-slate-500 mb-4">Ready for another challenge? Pick an exam and test your skills.</p>
                        <button onClick={() => navigate('/')} className="w-full flex justify-between items-center bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition">
                            <span>Browse Exams</span>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Sample Certificate</h2>
                        <p className="text-slate-500 mb-4">See what your official, verifiable certificate will look like upon passing a paid exam.</p>
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