import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, ArrowRight } from 'lucide-react';

const EnterPin = () => {
    const [pin, setPin] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pin.length === 5) navigate(`/join/${pin.toUpperCase()}`);
    };

    return (
        <div className="min-h-screen bg-purple-900 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Hash size={32} className="text-purple-600" />
                </div>
                <h1 className="text-2xl font-black text-purple-900 mb-2 uppercase italic">Вход в игру</h1>
                <p className="text-slate-500 text-sm mb-8 font-medium">Введите код, который видите на экране учителя</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full bg-slate-100 border-none p-5 rounded-2xl text-3xl text-center font-black tracking-[0.5em] text-purple-900 focus:ring-4 ring-yellow-400 outline-none transition-all uppercase"
                        placeholder="00000"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.substring(0, 5))}
                        required
                    />
                    <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black py-5 rounded-2xl text-xl shadow-[0_6px_0_rgb(202,138,4)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        ДАЛЕЕ <ArrowRight />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnterPin;