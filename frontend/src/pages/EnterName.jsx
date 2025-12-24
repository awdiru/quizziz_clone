import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Play, Loader2 } from 'lucide-react';

const EnterName = () => {
    const { pin } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/rooms/join', { pin, name });
            // После входа ждем на странице лобби для ученика
            navigate(`/arena/student/${pin}`, { state: { playerName: name } });
        } catch (err) {
            alert("Комната не найдена или закрыта");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-purple-900 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <User size={32} className="text-yellow-600" />
                </div>
                <h1 className="text-2xl font-black text-purple-900 mb-2 uppercase">Как вас зовут?</h1>
                <p className="text-slate-500 text-sm mb-8 font-medium italic underline underline-offset-4 decoration-yellow-400">Комната: {pin}</p>

                <form onSubmit={handleJoin} className="space-y-4">
                    <input
                        className="w-full bg-slate-100 border-none p-5 rounded-2xl text-xl text-center font-bold text-purple-900 focus:ring-4 ring-purple-500 outline-none transition-all"
                        placeholder="Ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-2xl text-xl shadow-[0_6px_0_rgb(88,28,135)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <><Play fill="currentColor" size={20}/> ПОЕХАЛИ!</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnterName;