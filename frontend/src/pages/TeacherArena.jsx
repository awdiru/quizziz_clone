import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import SockJS from 'sockjs-client';
import {Client} from '@stomp/stompjs';
import {QRCodeSVG} from 'qrcode.react';
import api from '../api/axios';
import {ArrowLeft, Check, Crown, Loader2, Play, SkipForward, Users} from 'lucide-react';
import {WS_URL} from "../config";
import '../styles/TeacherArena.css';

const TeacherArena = () => {
    const { pin } = useParams();
    const navigate = useNavigate();

    const [participants, setParticipants] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deltas, setDeltas] = useState({});
    const [revealedAnswers, setRevealedAnswers] = useState(null);
    const prevParticipantsRef = useRef([]);
    const currentQuestionNumberRef = useRef(-1);
    const [studentsAnswers, setStudentsAnswers] = useState([]);

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
                        setRevealedAnswers(null);
                    }
                    setCurrentQuestion(questionData);
                    setIsFinished(false);
                    setRevealedAnswers(null);
                    setStudentsAnswers([]);
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
            }
            else if (currentQuestion && !isFinished) {
                if (!revealedAnswers) {
                    const res = await api.get(`/rooms/${pin}/answers`);
                    // Сохраняем и варианты ответов, и ответы студентов из вашего нового JSON
                    setRevealedAnswers(res.data.answers);
                    setStudentsAnswers(res.data.studentsAnswers || []); // Сохраняем ответы студентов
                }
                else {
                    if (currentQuestion.currentQuestionNumber + 1 < currentQuestion.totalQuestions) {
                        await api.post(`/rooms/${pin}/next`);
                    } else {
                        const res = await api.post(`/rooms/${pin}/finish`);
                        setParticipants(res.data);
                        setIsFinished(true);
                        setCurrentQuestion(null);
                        setRevealedAnswers(null);
                        setStudentsAnswers([]);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getStudentStatus = (studentName) => {
        if (!revealedAnswers || studentsAnswers.length === 0) return 'default';

        const student = studentsAnswers.find(s => s.username === studentName);
        // Если ученик вообще не отвечал на этот вопрос
        if (!student || !student.answers || student.answers.length === 0) return 'default';

        const correctAnswersNumbers = revealedAnswers.filter(a => a.isRight).map(a => a.number);
        const studentChoices = student.answers;

        // 1. Проверка на ЗЕЛЕНЫЙ: выбрал ВСЕ правильные И НИ ОДНОГО лишнего
        const pickedAllCorrect = correctAnswersNumbers.every(num => studentChoices.includes(num));
        const hasNoWrong = studentChoices.every(num => correctAnswersNumbers.includes(num));

        if (pickedAllCorrect && hasNoWrong) return 'correct';

        // 2. Проверка на ЖЕЛТЫЙ: есть ХОТЯ БЫ ОДИН правильный
        const hasAtLeastOneCorrect = studentChoices.some(num => correctAnswersNumbers.includes(num));

        if (hasAtLeastOneCorrect) return 'partial';

        // 3. Остальное (не выбрал ни одного правильного) - КРАСНЫЙ
        return 'wrong';
    };

    // Хелпер для проверки, является ли конкретный ответ верным
    const isAnswerCorrect = (ansNumber) => {
        if (!revealedAnswers) return false;
        const answer = revealedAnswers.find(a => a.number === ansNumber);
        return answer ? answer.isRight : false;
    };

    return (
        <div className="teacher-arena-container">
            {/* ШАПКА */}
            <header className="arena-header">
                <button onClick={() => navigate('/dashboard')} className="arena-back-button">
                    <ArrowLeft size={16}/> ВЫХОД ИЗ ИГРЫ
                </button>
                {currentQuestion && (
                    <div className="arena-header-info">
                        <div className="arena-question-counter">
                            ВОПРОС {currentQuestion.currentQuestionNumber + 1} / {currentQuestion.totalQuestions}
                        </div>

                        <button onClick={handleAction} className="btn-action-icon" disabled={loading}>
                            {loading ? (
                                <Loader2 size={20} className="animate-spin"/>
                            ) : revealedAnswers ? (
                                <SkipForward size={20}/>
                            ) : (
                                <Check size={20}/>
                            )}
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
                    <div className="arena-pin-section">
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
                    <h1 className="arena-finish-title">ПОБЕДИТЕЛИ</h1>
                    <div className="leaderboard-final">
                        {participants.slice(0, 5).map((p, i) => (
                            <div key={i} className="leaderboard-item">
                                <span className="leaderboard-rank-name">{i + 1}. {p.name}</span>
                                <span className="leaderboard-score">{p.score}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="arena-start-button arena-finish-button">
                        ВЕРНУТЬСЯ В МЕНЮ
                    </button>
                </div>
            ) : (
                /* ИГРОВОЙ ПРОЦЕСС */
                <main className="arena-game-main">
                    <div className="arena-question-box">
                        <h2 className="arena-question-text">{currentQuestion.questionText}</h2>

                        <div className="arena-teacher-answers-grid">
                            {currentQuestion.answers.map((ans) => {
                                const isCorrect = isAnswerCorrect(ans.number);
                                return (
                                    <div
                                        key={ans.number}
                                        className={`arena-teacher-answer-item ${isCorrect ? 'correct' : ''}`}
                                    >
                                        <div className="answer-number">{ans.number}</div>
                                        <span>{ans.answerText}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* СПИСОК УЧАСТНИКОВ ВНИЗУ */}
                    <div className="arena-participants-bottom">
                        {participants.map((p) => {
                            const status = getStudentStatus(p.name);
                            const studentData = studentsAnswers.find(s => s.username === p.name);

                            return (
                                <div key={p.name} className={`participant-card status-${status}`}>
                                    {revealedAnswers && studentData && (
                                        <div className="student-answers-row">
                                            {studentData.answers.map(num => (
                                                <span
                                                    key={num}
                                                    className={`answer-badge ${isAnswerCorrect(num) ? 'badge-correct' : 'badge-wrong'}`}
                                                >
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {p.answered && deltas[p.name] !== undefined && !revealedAnswers && (
                                        <span className="delta-points">+{deltas[p.name]}</span>
                                    )}
                                    <span className="participant-name">{p.name}</span>
                                    <span className="participant-score">{p.score}</span>
                                </div>
                            );
                        })}
                    </div>
                </main>
            )}

            {/* ФУТЕР ТОЛЬКО ДЛЯ ЛОББИ */}
            {!currentQuestion && !isFinished && (
                <div className="arena-lobby-footer">
                    <div className="arena-players-count">
                        <Users size={18}/> ИГРОКОВ В КОМНАТЕ: {participants.length}
                    </div>
                    <div className="arena-lobby-players-grid">
                        {participants.map((p, i) => (
                            <div key={i} className="arena-lobby-player-tag">
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