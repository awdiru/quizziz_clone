import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {Home, Star, Trophy, Loader2} from 'lucide-react';
import {WS_URL} from "../config";
import '../styles/StudentArena.css'; // Импорт стилей

const StudentArena = () => {
    const { pin } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const stompClient = useRef(null);

    const [playerName] = useState(location.state?.playerName || localStorage.getItem(`player_name_${pin}`));
    const [question, setQuestion] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [isWaiting, setIsWaiting] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!playerName) {
            navigate('/join');
            return;
        }
        localStorage.setItem(`player_name_${pin}`, playerName);

        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}`),
            onConnect: () => {
                stompClient.current = client;
                client.subscribe(`/topic/room/${pin}/question`, (message) => {
                    const data = JSON.parse(message.body);
                    setQuestion(data);
                    setSelectedAnswers([]);
                    setIsWaiting(false);
                    setIsFinished(false);
                });
                client.subscribe(`/topic/room/${pin}/finished`, (message) => {
                    const finalResults = JSON.parse(message.body);
                    setResults(finalResults);
                    setIsFinished(true);
                    setIsWaiting(false);
                    setQuestion(null);
                });
            }
        });

        client.activate();
        return () => client.deactivate();
    }, [pin, playerName, navigate]);

    const toggleAnswer = (answerNumber) => {
        setSelectedAnswers(prev =>
            prev.includes(answerNumber) ? prev.filter(id => id !== answerNumber) : [...prev, answerNumber]
        );
    };

    const handleSend = () => {
        if (selectedAnswers.length === 0 || !stompClient.current) return;
        stompClient.current.publish({
            destination: `/app/room/submit`,
            body: JSON.stringify({
                pin,
                playerName,
                selectedAnswerNumbers: selectedAnswers
            })
        });
        setIsWaiting(true);
        setQuestion(null);
    };

    if (isFinished) {
        const playerIndex = results.findIndex(r => r.name === playerName);
        const finalData = results[playerIndex] || {};
        const score = finalData.score || 0;
        const rank = playerIndex !== -1 ? playerIndex + 1 : '-';

        return (
            <div className="arena-container">
                <div className="arena-finish-card">
                    <Trophy className="arena-finish-icon" size={80} fill="currentColor" />
                    <h2 className="arena-finish-title">Игра окончена!</h2>
                    <p className="arena-finish-subtitle">{playerName}, отличный результат!</p>

                    <div className="arena-stats-row">
                        <div className="arena-stat-box">
                            <span className="arena-stat-value arena-stat-value-rank"># {rank}</span>
                            <span className="arena-stat-label">МЕСТО</span>
                        </div>
                        <div className="arena-stat-box">
                            <span className="arena-stat-value arena-stat-value-success">{score}</span>
                            <span className="arena-stat-label">ВАШ СЧЕТ</span>
                        </div>
                    </div>

                    <button onClick={() => navigate('/')} className="arena-home-button">
                        <Home size={20} />
                        Вернуться в меню
                    </button>
                </div>
            </div>
        );
    }

    if (isWaiting || !question) {
        return (
            <div className="arena-container">
                <div className="arena-waiting-card">
                    <Loader2 className="arena-waiting-icon animate-spin" size={60} />
                    <h2 className="arena-waiting-title">Ждем вопрос...</h2>
                    <p className="arena-waiting-text">Приготовься, скоро начнется!</p>
                    <div className="arena-waiting-pin">PIN: {pin}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="arena-container">
            <div className="arena-question-card">
                <div className="arena-question-header">
                    <Star size={18} fill="currentColor" />
                    <span>ВОПРОС ГОРЯЧЕЙ АРЕНЫ</span>
                    <Star size={18} fill="currentColor" />
                </div>

                <h2 className="arena-question-title">{question.questionText}</h2>

                <div className="arena-answers-grid">
                    {question.answers.map((ans) => {
                        const isSelected = selectedAnswers.includes(ans.number);
                        return (
                            <button
                                key={ans.number}
                                onClick={() => toggleAnswer(ans.number)}
                                className={`arena-answer-btn ${
                                    isSelected ? 'arena-answer-btn-selected' : 'arena-answer-btn-default'
                                }`}
                            >
                                <span className="opacity-30 text-sm font-black">{ans.number}.</span>
                                <span>{ans.answerText}</span>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleSend}
                    disabled={selectedAnswers.length === 0}
                    className="arena-submit-button"
                >
                    ОТПРАВИТЬ ОТВЕТ
                </button>
            </div>
        </div>
    );
};

export default StudentArena;