import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import SockJS from 'sockjs-client';
import {Client} from '@stomp/stompjs';
import {QRCodeSVG} from 'qrcode.react';
import api from '../api/axios';
import {ArrowLeft, Crown, Home, Loader2, Play, SkipForward, Users} from 'lucide-react';
import {WS_URL} from "../config";
import '../styles/TeacherArena.css'; // Импорт стилей

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
                client.subscribe(`/topic/room/${pin}`, (m) => {
                    const data = JSON.parse(m.body);
                    setParticipants(data);
                    const newDeltas = {};
                    data.forEach(p => newDeltas[p.name] = 0);
                    setDeltas(newDeltas);
                    prevParticipantsRef.current = data;
                });

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

                client.subscribe(`/topic/room/${pin}/leaderboard`, (m) => {
                    const newData = JSON.parse(m.body);
                    setDeltas(prev => {
                        const updated = { ...prev };
                        newData.forEach(player => {
                            if (player.answered) {
                                const base = prevParticipantsRef.current.find(p => p.name === player.name);
                                updated[player.name] = base ? player.score - base.score : 0;
                            }
                        });
                        return updated;
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

    // --- ИТОГИ ---
    if (isFinished) {
        return (
            <div className="arena-finish-container">
                <div className="arena-crown-wrapper">
                    <Crown size={64} className="text-brand-purple" />
                </div>
                <h1 className="arena-finish-title">Итоги игры</h1>
                <div className="max-w-3xl w-full space-y-4">
                    {participants.sort((a,b) => b.score - a.score).map((p, i) => (
                        <div key={i} className={`arena-leaderboard-item ${i === 0 ? 'arena-leaderboard-winner' : 'arena-leaderboard-default'}`}>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-black">#{i + 1}</span>
                                <span className="text-xl font-bold">{p.name}</span>
                            </div>
                            <span className="text-2xl font-black">{p.score}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => navigate('/dashboard')} className="mt-12 bg-white text-brand-purple px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-100 transition-all">
                    <Home size={20} /> ВЕРНУТЬСЯ В МЕНЮ
                </button>
            </div>
        );
    }

    // --- ИГРА ---
    if (currentQuestion) {
        const isLast = currentQuestion.currentQuestionNumber + 1 === currentQuestion.totalQuestions;
        return (
            <div className="teacher-arena-container p-8">
                <div className="arena-game-header">
                    <div className="arena-game-pin-badge">PIN: {pin}</div>
                    <div className="text-purple-300 font-bold uppercase">Вопрос {currentQuestion.currentQuestionNumber + 1}/{currentQuestion.totalQuestions}</div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto">
                    <h1 className="arena-game-question-text">{currentQuestion.questionText}</h1>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {currentQuestion.answers.map((a, i) => (
                            <div key={i} className="arena-answer-item">{a.answerText}</div>
                        ))}
                    </div>
                </div>

                <div className={`${width} mx-auto mb-12 w-full`}>
                    <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                        {participants.map((p, i) => (
                            <div key={i} className="arena-player-card">
                                <span className="arena-player-name">{p.name}</span>
                                <div className="flex items-start">
                                    <div className="relative">
                                        <span className="arena-player-score">{p.score}</span>
                                        {deltas[p.name] !== undefined && (
                                            <span className="arena-player-delta">
                                                {deltas[p.name] >= 0 ? `+${deltas[p.name]}` : deltas[p.name]}
                                             </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleAction}
                            disabled={loading}
                            style={{ gridColumnStart: cols }}
                            className={`arena-next-button ${isLast ? 'bg-brand-red text-white' : 'bg-brand-yellow text-brand-purple'}`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <SkipForward size={32} fill="currentColor" />}
                            <span className="font-black uppercase text-lg">{isLast ? 'Завершить' : 'Далее'}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- ЛОББИ ---
    return (
        <div className="teacher-arena-container">
            <header className="arena-header">
                <button onClick={() => navigate('/dashboard')} className="arena-back-button"><ArrowLeft size={16} /> Выход</button>
            </header>
            <main className="arena-lobby-main">
                <div className="arena-qrcode-wrapper"><QRCodeSVG value={`${window.location.origin}/join/${pin}`} size={200} /></div>
                <div className="text-center md:text-left">
                    <span className="arena-pin-label">Код комнаты:</span>
                    <h1 className="arena-pin-value">{pin}</h1>
                    <button onClick={handleAction} disabled={participants.length === 0 || loading} className="arena-start-button">
                        {loading ? <Loader2 className="animate-spin" /> : <Play size={32} fill="currentColor" />} НАЧАТЬ
                    </button>
                </div>
            </main>
            <div className="arena-lobby-footer">
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