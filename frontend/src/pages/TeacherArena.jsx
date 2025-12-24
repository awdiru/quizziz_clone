import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import { Users, Play, Loader2, ArrowLeft, Crown, SkipForward, Home } from 'lucide-react';

const TeacherArena = () => {
    const { pin } = useParams();
    const navigate = useNavigate();

    const [participants, setParticipants] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-quiz'),
            onConnect: () => {
                client.subscribe(`/topic/room/${pin}`, (m) => setParticipants(JSON.parse(m.body)));
                client.subscribe(`/topic/room/${pin}/question`, (m) => {
                    setCurrentQuestion(JSON.parse(m.body));
                    setIsFinished(false);
                });
            }
        });
        client.activate();
        return () => client.deactivate();
    }, [pin]);

    const handleAction = async () => {
        setLoading(true);
        try {
            if (!currentQuestion && !isFinished) {
                await api.post(`/rooms/${pin}/start`);
            } else if (currentQuestion && currentQuestion.currentQuestionNumber + 1 < currentQuestion.totalQuestions) {
                await api.post(`/rooms/${pin}/next`);
            } else {
                const res = await api.post(`/rooms/${pin}/finish`);
                setParticipants(res.data);
                setIsFinished(true);
                setCurrentQuestion(null);
            }
        } catch (e) { alert("Ошибка!"); }
        finally { setLoading(false); }
    };

    // --- ЭКРАН 3: ИТОГИ (БЕЗ КОДА И ЛИШНИХ КНОПОК) ---
    if (isFinished) {
        return (
            <div className="min-h-screen bg-purple-900 text-white flex flex-col items-center p-12">
                <div className="bg-yellow-400 p-4 rounded-3xl mb-6 shadow-2xl rotate-3">
                    <Crown size={64} className="text-purple-900" />
                </div>
                <h1 className="text-6xl font-black uppercase italic mb-12 tracking-tighter">Итоги игры</h1>

                <div className="max-w-3xl w-full space-y-4">
                    {participants.sort((a,b) => b.score - a.score).map((p, i) => (
                        <div key={i} className={`flex justify-between items-center p-6 rounded-2xl border-b-4 ${i === 0 ? 'bg-yellow-400 text-purple-900 border-yellow-600 scale-105' : 'bg-white/10 border-black/20 text-white'}`}>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-black">#{i + 1}</span>
                                <span className="text-xl font-bold">{p.name}</span>
                            </div>
                            <span className="text-2xl font-black">{p.score}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-12 bg-white text-purple-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-100 transition-all"
                >
                    <Home size={20} /> ВЕРНУТЬСЯ В МЕНЮ
                </button>
            </div>
        );
    }

    // --- ЭКРАН 2: ИГРА (ВОПРОС) ---
    if (currentQuestion) {
        const isLast = currentQuestion.currentQuestionNumber + 1 === currentQuestion.totalQuestions;
        return (
            <div className="min-h-screen bg-purple-900 text-white p-8 flex flex-col">
                <div className="flex justify-between items-center mb-12">
                    <div className="bg-black/20 px-6 py-2 rounded-full font-black text-yellow-400">PIN: {pin}</div>
                    <div className="text-purple-300 font-bold uppercase">Вопрос {currentQuestion.currentQuestionNumber + 1}/{currentQuestion.totalQuestions}</div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black mb-12 leading-tight">{currentQuestion.questionText}</h1>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {currentQuestion.answers.map((a, i) => (
                            <div key={i} className="bg-white/10 p-6 rounded-2xl border-2 border-white/5 text-2xl font-bold">{a.answerText}</div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 bg-black/20 rounded-3xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {participants.map((p, i) => (
                            <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between">
                                <span className="truncate">{p.name}</span>
                                <span className="text-yellow-400 font-black">{p.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={handleAction} className={`fixed bottom-8 right-8 px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-2xl transition-all ${isLast ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-yellow-400 hover:bg-yellow-500 text-purple-900'}`}>
                    {loading ? <Loader2 className="animate-spin" /> : <SkipForward size={24} fill="currentColor" />}
                    {isLast ? 'ЗАВЕРШИТЬ ТЕСТ' : 'СЛЕДУЮЩИЙ ВОПРОС'}
                </button>
            </div>
        );
    }

    // --- ЭКРАН 1: ЛОББИ (ОЖИДАНИЕ) ---
    return (
        <div className="min-h-screen bg-purple-900 text-white flex flex-col">
            <header className="p-6 border-b border-white/10">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-purple-300 font-bold uppercase text-xs"><ArrowLeft size={16} /> Выход</button>
            </header>
            <main className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 p-12">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl transform -rotate-3"><QRCodeSVG value={`${window.location.origin}/join/${pin}`} size={200} /></div>
                <div className="text-center md:text-left">
                    <span className="text-purple-300 font-black uppercase tracking-widest text-sm">Код комнаты:</span>
                    <h1 className="text-9xl font-black tracking-tighter mb-8">{pin}</h1>
                    <button onClick={handleAction} disabled={participants.length === 0 || loading} className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-purple-900 px-12 py-6 rounded-[2rem] font-black text-3xl shadow-xl transition-all flex items-center gap-4">
                        {loading ? <Loader2 className="animate-spin" /> : <Play size={32} fill="currentColor" />} НАЧАТЬ
                    </button>
                </div>
            </main>
            <div className="p-8 bg-black/20 border-t border-white/5">
                <div className="flex items-center gap-2 mb-4 text-purple-300 font-bold uppercase text-sm"><Users size={18} /> Игроков: {participants.length}</div>
                <div className="flex flex-wrap gap-4">
                    {participants.map((p, i) => (
                        <div key={i} className="bg-white/10 px-6 py-3 rounded-2xl font-bold">{p.name}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeacherArena;