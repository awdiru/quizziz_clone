import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import SockJS from 'sockjs-client';
import {Client} from '@stomp/stompjs';
import {QRCodeSVG} from 'qrcode.react';
import api from '../api/axios';
import {ArrowLeft, Crown, Home, Loader2, Play, SkipForward, Users} from 'lucide-react';
import {WS_URL} from "../config";

const TeacherArena = () => {
    const { pin } = useParams();
    const navigate = useNavigate();

    const [participants, setParticipants] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deltas, setDeltas] = useState({});
    const prevParticipantsRef = useRef([]);
    const currentQuestionNumberRef = useRef(-1);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}`),
            onConnect: () => {
                // Подписка на участников в лобби
                client.subscribe(`/topic/room/${pin}`, (m) => {
                    const data = JSON.parse(m.body);
                    setParticipants(data);

                    const newDeltas = new Map();
                    participants.forEach(p => newDeltas.set(p, 0))
                    setDeltas(newDeltas);
                    prevParticipantsRef.current = data;
                });

                // Подписка на вопросы
                client.subscribe(`/topic/room/${pin}/question`, (m) => {
                    const questionData = JSON.parse(m.body);

                    if (questionData.currentQuestionNumber !== currentQuestionNumberRef.current) {
                        setParticipants(current => {
                            prevParticipantsRef.current = current;
                            return current;
                        });

                        setDeltas({});
                        currentQuestionNumberRef.current = questionData.currentQuestionNumber;
                    }

                    setCurrentQuestion(questionData);
                    setIsFinished(false);
                });

                // Подписка на лидерборд
                client.subscribe(`/topic/room/${pin}/leaderboard`, (m) => {
                    const newData = JSON.parse(m.body);

                    setDeltas(prevDeltas => {
                        const updatedDeltas = { ...prevDeltas };
                        newData.forEach(player => {
                            if (player.answered) {
                                const basePlayer = prevParticipantsRef.current.find(p => p.name === player.name);
                                if (basePlayer) {
                                    updatedDeltas[player.name] = player.score - basePlayer.score;
                                } else {
                                    updatedDeltas[player.name] = 0;
                                }
                            }
                        });
                        return updatedDeltas;
                    });

                    setParticipants(newData);
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

    const getGridConfig = (count) => {
        if (count <= 4) return { cols: count, width: 'max-w-4xl' };
        if (count <= 8) return { cols: 4, width: 'max-w-5xl' };
        if (count <= 12) return { cols: 6, width: 'max-w-6xl' };
        return { cols: 8, width: 'max-w-full' };
    };

    const { cols, width } = getGridConfig(participants.length);

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

                <div className={`w-full ${width} mx-auto mb-12`}>
                    <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                        {/* Карточки игроков */}
                        {participants.map((p, i) => (
                            <div key={i}
                                 className="bg-white/20 backdrop-blur-sm p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center transition-all">
                                <span className="text-yellow-500 text-xl font-black uppercase mb-3 tracking-wide text-center truncate w-full">{p.name}</span>
                                {/* Контейнер для счета и дельты */}
                                <div className="flex items-start">
                                    <div className="relative">
                                        <span className="text-3xl font-black text-white leading-none">{p.score}</span>

                                        {/* Отображаем дельту, если она есть в объекте (даже если она 0) */}
                                        {deltas[p.name] !== undefined && (
                                            <span
                                                className="absolute left-full -top-3 ml-1 text-xl font-bold text-yellow-400 whitespace-nowrap animate-in fade-in slide-in-from-bottom-1"
                                                style={{
                                                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                                                    textShadow: '1.5px 1.5px 0px rgba(0,0,0,0.3)'
                                                }}
                                            >{/* Показываем +0, +10 и т.д. */}
                                                {deltas[p.name] >= 0 ? `+${deltas[p.name]}` : deltas[p.name]}
                                             </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* КНОПКА УПРАВЛЕНИЯ (Всегда в последней колонке) */}
                        <button
                            onClick={handleAction}
                            disabled={loading}
                            style={{ gridColumnStart: cols }}
                            className={`p-6 rounded-3xl transition-all flex flex-col items-center justify-center gap-2 active:scale-95 shadow-lg
                            ${isLast
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-yellow-400 hover:bg-yellow-500 text-purple-900'
                            }`}
                        >
                            <div className="transition-transform group-hover:scale-110">
                                {loading ? <Loader2 className="animate-spin" /> : <SkipForward size={32} fill="currentColor" />}
                            </div>
                            <span className="font-black text-center leading-tight uppercase text-lg">{isLast ? 'Завершить' : 'Далее'}</span>
                        </button>
                    </div>
                </div>
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