import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {Home, Star, Trophy} from 'lucide-react';
import {WS_URL} from "../config";

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
    const [results, setResults] = useState([]); // Все участники с баллами

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

                // 1. Подписка на вопросы
                client.subscribe(`/topic/room/${pin}/question`, (message) => {
                    const data = JSON.parse(message.body);
                    setQuestion(data);
                    setSelectedAnswers([]);
                    setIsWaiting(false);
                    setIsFinished(false);
                });

                // 2. Подписка на завершение (результаты)
                // Предполагаем, что сервер шлет List<Participant> в этот топик при финише
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

    // --- ЭКРАН ЗАВЕРШЕНИЯ ---
    if (isFinished) {
        const myResult = results.find(p => p.name === playerName);
        const sortedResults = [...results].sort((a, b) => b.score - a.score);
        const myRank = sortedResults.findIndex(p => p.name === playerName) + 1;

        return (
            <div style={styles.container}>
                <div style={styles.finishCard}>
                    <Trophy size={80} color="#facc15" style={{ marginBottom: '20px' }} />
                    <h1 style={styles.finishTitle}>ИГРА ОКОНЧЕНА!</h1>
                    <p style={styles.finishSubtitle}>{playerName}, отличная работа!</p>

                    <div style={styles.statsRow}>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>МЕСТО</span>
                            <span style={styles.statValue}>#{myRank}</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statLabel}>БАЛЛЫ</span>
                            <span style={styles.statValue}>{myResult?.score || 0}</span>
                        </div>
                    </div>

                    <button onClick={() => navigate('/join')} style={styles.homeBtn}>
                        <Home size={20} /> ВЫЙТИ В МЕНЮ
                    </button>
                </div>
            </div>
        );
    }

    // --- ЭКРАН ОЖИДАНИЯ ---
    if (isWaiting || !question) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h1 style={styles.title}>Привет, {playerName}!</h1>
                    <div className="loader-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                    <p style={styles.text}>Ожидаем учителя...</p>
                    <p style={styles.pinText}>PIN: {pin}</p>
                </div>
            </div>
        );
    }

    // --- ЭКРАН ВОПРОСА ---
    return (
        <div style={styles.container}>
            <div style={styles.questionCard}>
                <div style={styles.questionHeader}>
                    <Star size={24} color="#6d28d9" />
                    <span>ВОПРОС</span>
                    <Star size={24} color="#6d28d9" />
                </div>
                <h2 style={styles.questionTitle}>{question.questionText}</h2>
                <div style={styles.answersGrid}>
                    {question.answers.map((ans) => (
                        <button
                            key={ans.number}
                            onClick={() => toggleAnswer(ans.number)}
                            style={{
                                ...styles.answerBtn,
                                border: selectedAnswers.includes(ans.number) ? '4px solid #6d28d9' : '4px solid #e5e7eb',
                                backgroundColor: selectedAnswers.includes(ans.number) ? '#ede9fe' : '#ffffff',
                                color: '#1e1b4b'
                            }}
                        >
                            {ans.answerText}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleSend}
                    disabled={selectedAnswers.length === 0}
                    style={{...styles.submitBtn, opacity: selectedAnswers.length === 0 ? 0.5 : 1}}
                >
                    ОТПРАВИТЬ ОТВЕТ
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#4c1d95', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: '"Segoe UI", Roboto, sans-serif' },
    card: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '40px', borderRadius: '30px', textAlign: 'center', color: 'white', maxWidth: '400px', width: '100%', backdropFilter: 'blur(10px)' },
    questionCard: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '40px', width: '100%', maxWidth: '700px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' },
    finishCard: { backgroundColor: '#ffffff', padding: '50px', borderRadius: '40px', width: '100%', maxWidth: '500px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    finishTitle: { fontSize: '36px', fontWeight: '900', color: '#4c1d95', margin: '10px 0' },
    finishSubtitle: { fontSize: '18px', color: '#6b7280', marginBottom: '30px' },
    statsRow: { display: 'flex', gap: '20px', marginBottom: '40px', width: '100%' },
    statBox: { flex: 1, padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '20px' },
    statLabel: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#9ca3af', marginBottom: '5px' },
    statValue: { fontSize: '32px', fontWeight: '900', color: '#1e1b4b' },
    homeBtn: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#4c1d95', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' },
    title: { fontSize: '24px', fontWeight: '900', marginBottom: '20px' },
    text: { fontSize: '18px', opacity: 0.8 },
    pinText: { marginTop: '20px', fontSize: '14px', fontWeight: 'bold', color: '#facc15' },
    questionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#6d28d9', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '20px' },
    questionTitle: { color: '#1e1b4b', fontSize: '28px', fontWeight: '800', marginBottom: '40px', lineHeight: '1.2' },
    answersGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '40px' },
    answerBtn: { padding: '25px', borderRadius: '20px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' },
    submitBtn: { width: '100%', padding: '25px', borderRadius: '20px', border: 'none', backgroundColor: '#facc15', color: '#4c1d95', fontSize: '22px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 0 #ca8a04' }
};

export default StudentArena;