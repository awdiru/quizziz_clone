import React, { useState } from 'react';
import api from '../api/axios';
import { UserPlus, Mail, Lock, Loader2, CheckCircle, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css'; // Импорт стилей

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await api.post('/auth/register', formData);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            alert(err.response?.data?.message || "Ошибка при регистрации");
        }
    };

    if (status === 'success') {
        return (
            <div className="register-container">
                <div className="register-success-card">
                    <CheckCircle className="register-success-icon" size={64} />
                    <h2 className="text-2xl font-bold text-brand-purple mb-2">Заявка отправлена!</h2>
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
        <div className="register-container">
            <div className="register-card">
                <button
                    onClick={() => navigate('/login')}
                    className="register-back-button"
                >
                    <ArrowLeft size={18} /> Назад
                </button>

                <div className="register-header">
                    <div className="register-icon-wrapper">
                        <UserPlus className="register-icon" size={32} />
                    </div>
                    <h1 className="register-title">Регистрация</h1>
                    <p className="register-subtitle">Станьте частью ProgramSchool</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="register-input-group">
                        <User className="register-input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            className="register-input"
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="register-input-group">
                        <Mail className="register-input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Электронная почта"
                            className="register-input"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="register-input-group">
                        <Lock className="register-input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Придумайте пароль"
                            className="register-input"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="register-submit-button"
                    >
                        {status === 'loading' ? (
                            <Loader2 className="register-loader" />
                        ) : (
                            <>
                                <UserPlus size={20}/>
                                <span>Отправить заявку</span>
                            </>
                        )}
                    </button>
                </form>

                <p className="register-footer">
                    Уже есть аккаунт?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="register-link"
                    >
                        Войти
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;