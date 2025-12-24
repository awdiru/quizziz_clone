import React, { useState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });

            console.log("Ответ сервера:", response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username);
                window.location.href = '/dashboard';
            }
        } catch (err) {
            alert("Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-purple-900 flex flex-col items-center justify-center p-4">
            {/* Ненавязчивое упоминание школы */}
            <div className="mb-8 text-white/50 text-sm font-light tracking-widest uppercase">
                Powered by <span className="text-yellow-400 font-bold">ProgramSchool</span>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-purple-900 mb-6 text-center">Вход для учителя</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-purple-400" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full pl-10 pr-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-500 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-purple-400" size={20} />
                        <input
                            type="password"
                            placeholder="Пароль"
                            className="w-full pl-10 pr-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Войти в систему"}
                    </button>
                </form>

                <p className="mt-4 text-center text-gray-500 text-sm">
                    Нет аккаунта? <a href="/register" className="text-purple-600 font-bold hover:underline">Подать заявку</a>
                </p>
            </div>
        </div>
    );
};

export default Login;