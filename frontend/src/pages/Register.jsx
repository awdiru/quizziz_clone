import React, { useState } from 'react';
import api from '../api/axios';
import { UserPlus, Mail, Lock, Loader2, CheckCircle, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            // Отправляем username, email и password на бэкенд
            await api.post('/auth/register', formData);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            alert(err.response?.data?.message || "Ошибка при регистрации");
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-purple-900 mb-2">Заявка отправлена!</h2>
                    <p className="text-gray-600 mb-6">Администратор проверит ваши данные и подтвердит регистрацию.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all"
                    >
                        Вернуться на главную
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-purple-900 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative">

                {/* Кнопка возврата */}
                <button
                    onClick={() => navigate('/login')}
                    className="absolute top-6 left-6 text-purple-400 hover:text-purple-600 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                    <ArrowLeft size={18} /> Назад
                </button>

                <div className="text-center mb-8 mt-4">
                    <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
                        <UserPlus className="text-purple-900" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-purple-900 tracking-tight">Регистрация</h1>
                    <p className="text-slate-400 font-medium">Станьте частью ProgramSchool</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Поле: Имя пользователя (username) */}
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all"
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>

                    {/* Поле: Email */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
                        <input
                            type="email"
                            placeholder="Электронная почта"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    {/* Поле: Пароль */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
                        <input
                            type="password"
                            placeholder="Придумайте пароль"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-yellow-400/20 active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                        {status === 'loading' ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <UserPlus size={20}/>
                                <span>Отправить заявку</span>
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-400">
                    Уже есть аккаунт?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-purple-600 font-bold hover:underline"
                    >
                        Войти
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;