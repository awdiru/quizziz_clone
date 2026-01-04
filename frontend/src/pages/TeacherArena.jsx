import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import SockJS from 'sockjs-client';
import {Client} from '@stomp/stompjs';
import {QRCodeSVG} from 'qrcode.react';
import api from '../api/axios';
import {ArrowLeft, Crown, Loader2, Play, SkipForward, Users} from 'lucide-react';
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

    return (
        <div className="teacher-arena-container">
            {/* ШАПКА */}
            <header className="arena-header">
                <button onClick={() => navigate('/dashboard')} className="arena-back-button">
                    <ArrowLeft size={16}/> ВЫХОД ИЗ ИГРЫ
                </button>
                {currentQuestion && (
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-yellow text-brand-purple px-4 py-1 rounded-full font-black text-sm">
                            ВОПРОС {currentQuestion.number}
                        </div>
                        <button onClick={handleAction} className="btn-icon-white">
                            <SkipForward size={20}/>
                        </button>
                    </div>
                )}
            </header>

            {/* ОСНОВНОЙ КОНТЕНТ */}
            {!currentQuestion && !isFinished ? (
                /* ЛОББИ */
                <main className="arena-lobby-main">
                    <div className="arena-qrcode-wrapper">
                        <QRCodeSVG value={`${window.location.origin}/join/${pin}`} size={240}/>
                    </div>
                    <div className="text-center md:text-left">
                        <span className="arena-pin-label">ПРИСОЕДИНЯЙТЕСЬ ПО КОДУ:</span>
                        <h1 className="arena-pin-value">{pin}</h1>
                        <button
                            onClick={handleAction}
                            disabled={participants.length === 0 || loading}
                            className="arena-start-button"
                        >
                            {loading ? <Loader2 className="animate-spin"/> : <Play size={32} fill="currentColor"/>}
                            НАЧАТЬ ИГРУ
                        </button>
                    </div>
                </main>
            ) : isFinished ? (
                /* ФИНАЛ */
                <div className="arena-finish-container">
                    <div className="arena-crown-wrapper">
                        <Crown size={80}/>
                    </div>
                    <h1 className="arena-finish-title text-brand-yellow">ПОБЕДИТЕЛИ</h1>
                    <div className="leaderboard-final">
                        {participants.slice(0, 5).map((p, i) => (
                            <div key={i} className="leaderboard-item">
                                <span className="font-black text-xl">{i + 1}. {p.name}</span>
                                <span className="text-brand-yellow font-black">{p.score}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="arena-start-button mt-12">
                        ВЕРНУТЬСЯ В МЕНЮ
                    </button>
                </div>
            ) : (
                /* ИГРОВОЙ ПРОЦЕСС */
                <main className="arena-game-main">
                    <div className="arena-question-box">
                        <h2 className="arena-question-text">{currentQuestion.questionText}</h2>

                        {/* ВОЗВРАЩЕННЫЕ ВАРИАНТЫ ОТВЕТОВ */}
                        <div className="arena-teacher-answers-grid">
                            {currentQuestion.answers.map((ans) => (
                                <div key={ans.number} className="arena-teacher-answer-item">
                                    <div className="answer-number">{ans.number}</div>
                                    <span>{ans.answerText}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* СПИСОК УЧАСТНИКОВ ВНИЗУ */}
                    <div className="arena-participants-bottom">
                        {participants.map((p) => (
                            <div key={p.name} className="participant-card">
                                {p.answered && deltas[p.name] !== undefined && (
                                    <span className="delta-points">+{deltas[p.name]}</span>
                                )}
                                <span className="participant-name">{p.name}</span>
                                <span className="participant-score">{p.score}</span>
                            </div>
                        ))}
                    </div>
                </main>
            )}

            {/* ФУТЕР ТОЛЬКО ДЛЯ ЛОББИ */}
            {!currentQuestion && !isFinished && (
                <div className="arena-lobby-footer">
                    <div className="flex items-center gap-2 mb-6 text-purple-300 font-bold uppercase text-sm">
                        <Users size={18}/> ИГРОКОВ В КОМНАТЕ: {participants.length}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {participants.map((p, i) => (
                            <div key={i} className="bg-white/10 px-6 py-3 rounded-2xl font-bold border border-white/5">
                                {p.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherArena;