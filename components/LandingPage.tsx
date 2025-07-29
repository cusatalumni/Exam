
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, BarChart, FileSignature, ChevronRight, ShoppingCart, CheckCircle } from 'lucide-react';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-3">
            <Icon className="text-cyan-500 mr-4" size={32} />
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600">{children}</p>
    </div>
);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, paidExamIds, cart, addToCart, freeAttempts } = useAuth();
    const { activeOrg, isInitializing } = useAppContext();

    const handleStartPractice = (examId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (freeAttempts <= 0) {
            toast.error("You have no free attempts left.");
            return;
        }
        navigate(`/test/${examId}`);
    };

    const handleAddToCart = (examId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(examId);
        toast.success("Added to cart!");
    }

    if (isInitializing || !activeOrg) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Spinner />
                <p className="mt-4 text-slate-500">Getting exams ready...</p>
            </div>
        );
    }

    return (
        <div className="space-y-16 sm:space-y-24">
            {/* Hero Section */}
            <section className="text-center py-12 sm:py-20 bg-white rounded-xl shadow-lg">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-4">Master Your Medical Coding Exams</h1>
                <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                    {activeOrg?.name || 'Our platform'} offers the most comprehensive practice exams and AI-driven feedback to help you ace your certification.
                </p>
                <button
                    onClick={() => user ? navigate('/dashboard') : navigate('/login')}
                    className="bg-cyan-600 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg text-lg hover:bg-cyan-700 transition-transform transform hover:scale-105"
                >
                    Get Started Now
                </button>
            </section>
            
            {/* Features Section */}
            <section>
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-4">Why Choose Us?</h2>
                <p className="text-md sm:text-lg text-center text-slate-500 max-w-2xl mx-auto mb-12">We provide the tools and insights you need to walk into your exam with confidence.</p>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard icon={BarChart} title="Realistic Exam Simulation">
                        Practice with exams that mirror the format, difficulty, and time constraints of the real certification tests.
                    </FeatureCard>
                    <FeatureCard icon={BrainCircuit} title="AI-Powered Feedback">
                        Receive personalized study recommendations based on your performance to target your weak areas effectively.
                    </FeatureCard>
                    <FeatureCard icon={FileSignature} title="Printable Certificates">
                        Earn and share verifiable certificates upon successful completion of our paid certification exams to showcase your skills.
                    </FeatureCard>
                </div>
            </section>

            {/* Exam Showcase */}
            <section>
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-4">Available Exams</h2>
                <p className="text-md sm:text-lg text-center text-slate-500 max-w-2xl mx-auto mb-12">Choose from our selection of practice and certification exams to test your skills and prepare for success.</p>
                
                <div className="space-y-12">
                    {activeOrg.examProductCategories.map(category => {
                        const practiceExam = activeOrg.exams.find(e => e.id === category.practiceExamId);
                        const certExam = activeOrg.exams.find(e => e.id === category.certificationExamId);

                        if (!practiceExam || !certExam) return null;

                        const isCertUnlocked = user && paidExamIds.includes(certExam.id);
                        const isCertInCart = user && cart.includes(certExam.id);

                        return (
                            <div key={category.id} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
                                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">{category.name}</h3>
                                <p className="text-slate-500 mt-1 mb-6 max-w-3xl">{category.description}</p>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Practice Test */}
                                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col">
                                        <h4 className="font-bold text-lg text-slate-700">Practice Test</h4>
                                        <p className="text-slate-600 text-sm flex-grow mb-4">{practiceExam.numberOfQuestions} questions</p>
                                        <button 
                                            onClick={() => handleStartPractice(practiceExam.id)}
                                            className="w-full mt-auto bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                                            disabled={!!user && freeAttempts <= 0}
                                        >
                                            Start Practice
                                        </button>
                                        {!!user && freeAttempts <= 0 && <p className="text-xs text-red-500 text-center mt-2">No free attempts left</p>}
                                    </div>
                                    
                                    {/* Certification Exam */}
                                    <div className="bg-cyan-50/50 p-5 rounded-lg border border-cyan-200 flex flex-col">
                                        <h4 className="font-bold text-lg text-cyan-800">Certification Exam</h4>
                                        <p className="text-cyan-700 text-sm flex-grow mb-4">{certExam.numberOfQuestions} questions</p>
                                        {isCertUnlocked ? (
                                            <button 
                                                onClick={() => navigate(`/test/${certExam.id}`)}
                                                className="w-full mt-auto flex justify-center items-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition"
                                            >
                                                <CheckCircle size={16} className="mr-2"/> Unlocked - Start Now
                                            </button>
                                        ) : (
                                             <button 
                                                onClick={() => handleAddToCart(certExam.id)}
                                                disabled={isCertInCart}
                                                className="w-full mt-auto flex justify-center items-center bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition disabled:bg-cyan-300 disabled:cursor-not-allowed"
                                            >
                                                <ShoppingCart size={16} className="mr-2" />
                                                {isCertInCart ? 'In Cart' : `Add to Cart ($${certExam.price})`}
                                            </button>
                                        )}
                                        <p className="text-xs text-slate-500 text-center mt-2">Discount coupons can be applied at checkout.</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
