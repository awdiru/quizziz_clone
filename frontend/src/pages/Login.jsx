import React, { useState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import api from '../api/axios';
import '../styles/Login.css'; // Импорт новых стилей

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
        <div className="login-container">
            <div className="login-powered">
                Powered by <span className="login-powered-brand">ProgramSchool</span>
            </div>

            <div className="login-card">
                <h2 className="login-title">Вход для учителя</h2>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-input-group">
                        <Mail className="login-input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <Lock className="login-input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Пароль"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-button"
                    >
                        {loading ? <Loader2 className="login-loader" /> : "Войти в систему"}
                    </button>
                </form>

                <p className="login-footer">
                    Нет аккаунта? <a href="/register" className="login-link">Подать заявку</a>
                </p>
            </div>
        </div>
    );
};

export default Login;