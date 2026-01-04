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
                <div className="register-card">
                    <div className="register-success-card">
                        <CheckCircle className="register-success-icon" size={80} />
                        <h2 className="register-success-title">Заявка принята!</h2>
                        <p className="register-success-desc">
                            Мы отправили письмо на почту администратора. Пожалуйста, дождитесь, пока администратор подтвердит вашу регистрацию.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="register-submit-button"
                        >
                            ПОНЯТНО
                        </button>
                    </div>
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
                    <ArrowLeft size={18} />
                    Назад
                </button>

                <div className="register-header">
                    <div className="register-icon-wrapper">
                        <UserPlus className="register-icon" size={32} />
                    </div>
                    <h2 className="register-title">Регистрация</h2>
                    <p className="register-subtitle">Создайте аккаунт учителя</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="register-input-group group">
                        <User className="register-input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            className="register-input"
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="register-input-group group">
                        <Mail className="register-input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Электронная почта"
                            className="register-input"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="register-input-group group">
                        <Lock className="register-input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Надежный пароль"
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
                                <UserPlus size={22}/>
                                <span>СОЗДАТЬ АККАУНТ</span>
                            </>
                        )}
                    </button>
                </form>

                <p className="register-footer">
                    Уже есть аккаунт?
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