import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import api from '../api/axios';
import {CheckCircle2, ChevronLeft, Plus, Save, Trash2, X} from 'lucide-react';

const TestEditor = () => {
    const {testId} = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Начальное состояние с правильной структурой
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
        try {
            // Отправляем объект со списком вопросов, где поле называется isRight
            await api.put(`/tests/${testId}/content`, {questions});
            alert("Тест успешно сохранен!");
            goBack();
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении: " + (err.response?.data?.message || "неизвестная ошибка"));
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
        const newQuestions = questions.map((q, i) => {
            if (i === qIndex) {
                return {
                    ...q,
                    answers: [...q.answers, {answerText: '', number: q.answers.length + 1, isRight: false}]
                };
            }
            return q;
        });
        setQuestions(newQuestions);
    };

    const removeAnswer = (qIndex, aIndex) => {
        const newQuestions = questions.map((q, i) => {
            if (i === qIndex) {
                return {
                    ...q,
                    answers: q.answers.filter((_, ai) => ai !== aIndex)
                        .map((a, idx) => ({...a, number: idx + 1})) // пересчитываем номера
                };
            }
            return q;
        });
        setQuestions(newQuestions);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button onClick={goBack}
                            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors font-semibold">
                        <ChevronLeft size={20}/> Назад
                    </button>
                    <button onClick={handleSave}
                            className="bg-purple-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-700 shadow-md transition-all font-bold">
                        <Save size={18}/> Сохранить тест
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
                {questions.map((q, qIndex) => (
                    <div key={qIndex}
                         className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <span
                                className="bg-purple-100 text-purple-700 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg">
                                {qIndex + 1}
                            </span>
                            <button onClick={() => removeQuestion(qIndex)}
                                    className="text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 size={20}/>
                            </button>
                        </div>

                        <input
                            className="w-full text-xl font-bold border-b-2 border-slate-100 focus:border-purple-500 outline-none pb-2 mb-8 transition-colors"
                            placeholder="Введите вопрос..."
                            value={q.questionText}
                            onChange={(e) => {
                                const nq = questions.map((item, i) => i === qIndex ? {
                                    ...item,
                                    questionText: e.target.value
                                } : item);
                                setQuestions(nq);
                            }}
                        />

                        <div className="space-y-3">
                            {q.answers.map((a, aIndex) => (
                                <div key={aIndex}
                                     className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-transparent focus-within:border-purple-200 focus-within:bg-white transition-all">
                                    <button
                                        onClick={() => {
                                            const nq = questions.map((item, i) => {
                                                if (i === qIndex) {
                                                    return {
                                                        ...item,
                                                        answers: item.answers.map((ans, ai) =>
                                                            ai === aIndex ? {...ans, isRight: !ans.isRight} : ans
                                                        )
                                                    };
                                                }
                                                return item;
                                            });
                                            setQuestions(nq);
                                        }}
                                        className={`transition-colors ${a.isRight ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
                                    >
                                        <CheckCircle2 size={26}/>
                                    </button>
                                    <input
                                        className="flex-1 bg-transparent outline-none font-medium text-slate-700"
                                        placeholder={`Вариант ${aIndex + 1}`}
                                        value={a.answerText}
                                        onChange={(e) => {
                                            const nq = questions.map((item, i) => {
                                                if (i === qIndex) {
                                                    return {
                                                        ...item,
                                                        answers: item.answers.map((ans, ai) =>
                                                            ai === aIndex ? {...ans, answerText: e.target.value} : ans
                                                        )
                                                    };
                                                }
                                                return item;
                                            });
                                            setQuestions(nq);
                                        }}
                                    />
                                    <button onClick={() => removeAnswer(qIndex, aIndex)}
                                            className="text-slate-300 hover:text-red-400">
                                        <X size={18}/>
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => addAnswer(qIndex)}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-purple-300 hover:text-purple-500 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                            >
                                <Plus size={18}/> Добавить вариант
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-8 border-4 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:border-purple-300 hover:text-purple-500 transition-all font-black text-xl flex items-center justify-center gap-3 bg-white hover:bg-purple-50/50"
                >
                    <Plus size={32}/> ДОБАВИТЬ ВОПРОС
                </button>
            </main>
        </div>
    );
};

export default TestEditor;