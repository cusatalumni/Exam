import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { BookOpen, Award, CheckCircle } from 'lucide-react';
import PayPalButton from './PayPalButton';
import Spinner from './Spinner';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, paidExamIds, addPaidExam } = useAuth();
    const { activeOrg, isLoading } = useAppContext();

    if (isLoading || !activeOrg) {
        return <div className="flex flex-col items-center justify-center h-64"><Spinner /><p className="mt-4">Loading exams...</p></div>;
    }
    
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome, {user?.name}!</h1>
            <p className="text-slate-600 mb-8">Ready to test your knowledge? Choose an exam from {activeOrg.name} below.</p>

            <div className={`grid md:grid-cols-${activeOrg.exams.length > 1 ? '2' : '1'} gap-8`}>
                {activeOrg.exams.map(exam => {
                    const isPaid = exam.price > 0;
                    const isUnlocked = !isPaid || paidExamIds.includes(exam.id);
                    const Icon = isPaid ? Award : BookOpen;
                    const color = isPaid ? 'teal' : 'cyan';

                    return (
                        <div key={exam.id} className={`border border-slate-200 rounded-lg p-6 flex flex-col ${isPaid ? 'bg-slate-50': ''}`}>
                            <div className={`flex items-center text-${color}-600 mb-4`}>
                                <Icon size={24} className="mr-3" />
                                <h2 className="text-2xl font-semibold">{exam.name}</h2>
                            </div>
                            <p className="text-slate-600 flex-grow mb-6">{exam.description}</p>
                            <ul className="text-slate-600 space-y-2 mb-6">
                                <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1 shrink-0" /><span>{exam.numberOfQuestions} randomly selected questions.</span></li>
                                <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1 shrink-0" /><span>Instant score and detailed answer review.</span></li>
                                {isPaid && <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-2 mt-1 shrink-0" /><span>Earn a downloadable PDF certificate for scores of {exam.passScore}% or higher.</span></li>}
                            </ul>

                            {isUnlocked ? (
                                <button 
                                    onClick={() => navigate(`/test/${exam.id}`)}
                                    className={`w-full mt-auto bg-${color}-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-${color}-700 transition-transform transform hover:scale-105`}
                                >
                                    Start Test
                                </button>
                            ) : (
                                <div className="mt-auto">
                                    <p className="text-center text-sm text-slate-600 mb-3 font-semibold">Complete payment to unlock this exam.</p>
                                    <PayPalButton 
                                        price={exam.price} 
                                        examId={exam.id}
                                        onSuccess={(paidExamId) => addPaidExam(paidExamId)} 
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                 {activeOrg.exams.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">No exams are currently available for this organization.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default Dashboard;