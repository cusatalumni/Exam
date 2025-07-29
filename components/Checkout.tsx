import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import PayPalButton from './PayPalButton';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { user, cart, removeFromCart, addPaidExam, clearCart } = useAuth();
    const { activeOrg } = useAppContext();
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);

    const cartItems = useMemo(() => {
        if (!activeOrg) return [];
        return cart
            .map(examId => activeOrg.exams.find(e => e.id === examId))
            .filter((exam): exam is NonNullable<typeof exam> => exam !== undefined);
    }, [cart, activeOrg]);

    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.price, 0);
    }, [cartItems]);

    const total = subtotal - (subtotal * discount);

const handleApplyCoupon = (couponCode: string) => {
    if (couponCode.toUpperCase() === 'SAVE10') {
        setDiscount(0.10); // 10% discount
        toast.success('10% discount applied!');
    } else if (couponCode.toUpperCase() === 'FREE100') {
        setDiscount(1.0); // 100% discount
        toast.success('100% discount applied!');
    } else {
        setDiscount(0); // No discount for invalid coupon
        toast.error('Invalid coupon code.');
    }
};

    const handleCheckout = () => {
        if(!user) return;
        
        const purchasedExamIds = [...cart]; // Copy cart before clearing

        // Unlock all exams in cart
        purchasedExamIds.forEach(examId => addPaidExam(examId));
        
        // Clear the cart
        clearCart();

        // Smart redirect based on number of items purchased
        if (purchasedExamIds.length === 1) {
            navigate(`/test/${purchasedExamIds[0]}`);
        } else {
            navigate('/dashboard');
        }
    };
    
    if (!activeOrg) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
             <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 font-semibold mb-6"
            >
                <ArrowLeft size={18} />
                <span>Back to All Exams</span>
            </button>
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center"><ShoppingCart className="mr-3" /> Your Cart</h1>
                
                {cartItems.length > 0 ? (
                    <div className="space-y-8">
                        {/* Cart Items */}
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-bold text-slate-800">{item.name}</p>
                                        <p className="text-sm text-slate-500">{item.description || 'Certification Exam'}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <p className="font-semibold text-lg">${item.price.toFixed(2)}</p>
                                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Coupon and Summary */}
                        <div className="grid md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="coupon" className="block text-sm font-medium text-slate-700">Discount Code</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input 
                                            type="text" 
                                            id="coupon" 
                                            value={coupon}
                                            onChange={(e) => setCoupon(e.target.value)}
                                            className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-slate-300 focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., SAVE10" 
                                        />
                                        <button onClick={() => handleApplyCoupon(coupon)} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 text-sm">
                                            Apply
                                        </button>
                                    </div>
                                </div>
                                <PayPalButton totalPrice={total} onCheckout={handleCheckout} />
                            </div>
                            <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                                <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-3">Order Summary</h2>
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                                        <span>-${(subtotal * discount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-800 font-bold text-xl pt-3 border-t">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-slate-500 text-lg">Your cart is empty.</p>
                        <button onClick={() => navigate('/')} className="mt-4 bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition">
                            Browse Exams
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;