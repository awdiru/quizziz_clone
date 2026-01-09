import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import api from '../api/axios';
import {CheckCircle2, ChevronLeft, Plus, Save, Trash2, X} from 'lucide-react';
import '../styles/TestEditor.css'; // Импорт стилей

const TestEditor = () => {
    const {testId} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [errors, setErrors] = useState({});

    const [questions, setQuestions] = useState([
        {questionText: '', answers: [{answerText: '', number: 1, isRight: false}]}
    ]);

    const goBack = () => {
        navigate('/dashboard', {
            state: {
                folderId: location.state?.returnFolderId,
                path: location.state?.returnPath
            }
        });
    };

    useEffect(() => {
        const loadContent = async () => {
            try {
                const res = await api.get(`/tests/${testId}/content`);
                if (res.data && res.data.questions && res.data.questions.length > 0) {
                    setQuestions(res.data.questions);
                }
            } catch (err) {
                console.log("Тест пока пуст или ошибка загрузки");
            }
        };
        loadContent();
    }, [testId]);

    const handleSave = async () => {
        const newErrors = {};
        let isValid = true;

        questions.forEach((q, index) => {
            const hasCorrectAnswer = q.answers.some(ans => ans.isRight);
            const hasEmptyQuestion = q.questionText.trim() === '';
            const hasEmptyAnswers = q.answers.some(ans => ans.answerText.trim() === '');

            if (hasEmptyQuestion) {
                newErrors[index] = "Текст вопроса не может быть пустым";
                isValid = false;
            } else if (hasEmptyAnswers) {
                newErrors[index] = "Все варианты ответов должны быть заполнены";
                isValid = false;
            } else if (!hasCorrectAnswer) {
                newErrors[index] = "Должен быть хотя бы один правильный ответ";
                isValid = false;
            }
        });

        if (!isValid) {
            setErrors(newErrors);
            const firstErrorIndex = Object.keys(newErrors)[0];
            const errorElement = document.querySelectorAll('.question-card')[firstErrorIndex];
            errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        try {
            await api.put(`/tests/${testId}/content`, {questions});
            goBack()
        } catch (err) {
            alert("Ошибка при сохранении");
        }
    };

    const clearError = (qIndex) => {
        if (errors[qIndex]) {
            const newErrors = { ...errors };
            delete newErrors[qIndex];
            setErrors(newErrors);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            questionText: '',
            answers: [{answerText: '', number: 1, isRight: false}]
        }]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const addAnswer = (qIndex) => {
        const newQuestions = [...questions];
        const newNumber = newQuestions[qIndex].answers.length + 1;
        newQuestions[qIndex].answers.push({answerText: '', number: newNumber, isRight: false});
        setQuestions(newQuestions);
    };

    const removeAnswer = (qIndex, aIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers = newQuestions[qIndex].answers.filter((_, i) => i !== aIndex);
        setQuestions(newQuestions);
    };

    const toggleRight = (qIndex, aIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers[aIndex].isRight = !newQuestions[qIndex].answers[aIndex].isRight;
        setQuestions(newQuestions);
        clearError(qIndex);
    };

    return (
        <div className="editor-container">
            <header className="editor-header">
                <button onClick={goBack} className="editor-back-btn">
                    <ChevronLeft size={20}/>
                    <span>Назад</span>
                </button>
                <h1 className="editor-header-title">Редактор теста</h1>
                <button onClick={handleSave} className="editor-save-btn">
                    <Save size={18}/>
                    <span>Сохранить</span>
                </button>
            </header>

            <main className="editor-main">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="question-card">
                        <div className="question-number-badge">{qIndex + 1}</div>

                        {/* Сообщение об ошибке */}
                        {errors[qIndex] && (
                            <div className="error-hint">
                                {errors[qIndex]}
                            </div>
                        )}

                        <button
                            onClick={() => removeQuestion(qIndex)}
                            className="question-delete-btn"
                            title="Удалить вопрос"
                        >
                            <Trash2 size={20}/>
                        </button>

                        <div className="question-input-group">
                            <label className="question-input-label">Текст вопроса</label>
                            <textarea
                                className="question-textarea"
                                placeholder="Введите ваш вопрос здесь..."
                                value={q.questionText}
                                onChange={(e) => {
                                    const n = [...questions];
                                    n[qIndex].questionText = e.target.value;
                                    setQuestions(n);
                                }}
                            />
                        </div>

                        <div className="answers-container">
                            <label className="question-input-label">Варианты ответа</label>
                            {q.answers.map((ans, aIndex) => (
                                <div key={aIndex} className={`answer-row ${ans.isRight ? 'answer-row-correct' : ''}`}>
                                    <button
                                        onClick={() => toggleRight(qIndex, aIndex)}
                                        className={`answer-toggle-btn ${ans.isRight ? 'answer-toggle-btn-correct' : 'answer-toggle-btn-default'}`}
                                        title={ans.isRight ? "Правильный ответ" : "Отметить как правильный"}
                                    >
                                        <CheckCircle2 size={24}/>
                                    </button>
                                    <input
                                        className="answer-input"
                                        placeholder={`Вариант ${aIndex + 1}`}
                                        value={ans.answerText}
                                        onChange={(e) => {
                                            const n = [...questions];
                                            n[qIndex].answers[aIndex].answerText = e.target.value;
                                            setQuestions(n);
                                        }}
                                    />
                                    <button
                                        onClick={() => removeAnswer(qIndex, aIndex)}
                                        className="answer-remove-btn"
                                        title="Удалить вариант"
                                    >
                                        <X size={18}/>
                                    </button>
                                </div>
                            ))}

                            <button onClick={() => addAnswer(qIndex)} className="add-answer-btn">
                                <Plus size={18}/>
                                <span>Добавить вариант</span>
                            </button>
                        </div>
                    </div>
                ))}

                <button onClick={addQuestion} className="add-question-btn">
                    <Plus size={32} strokeWidth={3}/>
                    <span>ДОБАВИТЬ ВОПРОС</span>
                </button>
            </main>
        </div>
    );
};

export default TestEditor;