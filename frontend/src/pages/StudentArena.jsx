import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {Home, Star, Trophy} from 'lucide-react';
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
        const myResult = results.find(p => p.name === playerName);
        const sortedResults = [...results].sort((a, b) => b.score - a.score);
        const myRank = sortedResults.findIndex(p => p.name === playerName) + 1;

        return (
            <div className="arena-container">
                <div className="arena-finish-card">
                    <Trophy size={80} className="text-brand-yellow mb-5" />
                    <h1 className="arena-finish-title">ИГРА ОКОНЧЕНА!</h1>
                    <p className="arena-finish-subtitle">{playerName}, отличная работа!</p>

                    <div className="arena-stats-row">
                        <div className="arena-stat-box">
                            <span className="arena-stat-label">МЕСТО</span>
                            <span className="arena-stat-value">#{myRank}</span>
                        </div>
                        <div className="arena-stat-box">
                            <span className="arena-stat-label">БАЛЛЫ</span>
                            <span className="arena-stat-value">{myResult?.score || 0}</span>
                        </div>
                    </div>

                    <button onClick={() => navigate('/join')} className="arena-home-button">
                        <Home size={20} /> ВЫЙТИ В МЕНЮ
                    </button>
                </div>
            </div>
        );
    }

    if (isWaiting || !question) {
        return (
            <div className="arena-container">
                <div className="arena-waiting-card">
                    <h1 className="arena-waiting-title">Привет, {playerName}!</h1>
                    <div className="loader-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                    <p className="arena-waiting-text">Ожидаем учителя...</p>
                    <p className="arena-waiting-pin">PIN: {pin}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="arena-container">
            <div className="arena-question-card">
                <div className="arena-question-header">
                    <Star size={24} />
                    <span>ВОПРОС</span>
                    <Star size={24} />
                </div>
                <h2 className="arena-question-title">{question.questionText}</h2>
                <div className="arena-answers-grid">
                    {question.answers.map((ans) => {
                        const isSelected = selectedAnswers.includes(ans.number);
                        return (
                            <button
                                key={ans.number}
                                onClick={() => toggleAnswer(ans.number)}
                                className={`arena-answer-btn ${isSelected ? 'arena-answer-btn-selected' : 'arena-answer-btn-default'}`}
                            >
                                {ans.answerText}
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