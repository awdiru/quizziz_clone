import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Hash, Play, Loader2 } from 'lucide-react';

const JoinRoom = () => {
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/rooms/join', { pin, name });
            navigate(`/arena/student/${pin}`, {
                state: { playerName: name }
            });
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка: Комната не найдена или имя занято");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
                        <Play className="text-purple-900 ml-1" size={32} fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-black text-purple-900 uppercase tracking-tighter">
                        Присоединиться
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Введите код комнаты и имя</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="relative">
                        <Hash className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input
                            className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-purple-500 font-black text-2xl tracking-widest placeholder:text-slate-300 placeholder:font-bold placeholder:text-sm placeholder:tracking-normal"
                            placeholder="PIN КОД"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.toUpperCase())}
                            maxLength={5}
                            required
                        />
                    </div>
                    <div className="relative">
                        <User className="absolute left-4 top-4 text-slate-400" size={20} />
                        <input
                            className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 ring-purple-500 font-bold text-slate-700"
                            placeholder="ВАШЕ ИМЯ"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "ПОЕХАЛИ!"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinRoom;