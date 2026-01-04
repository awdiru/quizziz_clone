import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import '../styles/ConfirmEmail.css'; // Не забудь импорт!

const ConfirmEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Ждем ответа...');
    const hasRequested = useRef(false);

    useEffect(() => {
        const confirmToken = async () => {
            if (hasRequested.current) return;
            if (!token) {
                setStatus('error');
                setMessage('Токен подтверждения отсутствует');
                return;
            }
            hasRequested.current = true;
            try {
                const response = await api.get(`/auth/confirm?token=${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Регистрация успешно подтверждена!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Ошибка при подтверждении');
            }
        };
        confirmToken();
    }, [token]);

    return (
        <div className="confirm-container">
            <div className="confirm-card">

                {status === 'loading' && (
                    <div className="confirm-content-stack">
                        <div className="confirm-icon-wrapper">
                            <Loader2 size={64} className="icon-loading" />
                        </div>
                        <h2 className="confirm-title">Ждем ответа</h2>
                        <p className="confirm-subtitle">Связываемся с сервером...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="confirm-content-stack">
                        <div className="confirm-icon-wrapper">
                            <CheckCircle2 size={80} className="icon-success" />
                        </div>
                        <div className="status-box status-box-success">
                            <p>{message}</p>
                        </div>
                        <button onClick={() => navigate('/login')} className="confirm-btn-primary">
                            <span>ВОЙТИ В СИСТЕМУ</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="confirm-content-stack">
                        <div className="confirm-icon-wrapper">
                            <XCircle size={80} className="icon-error" />
                        </div>
                        <div className="status-box status-box-error">
                            <p>{message}</p>
                        </div>
                        <button onClick={() => navigate('/login')} className="confirm-btn-secondary">
                            ВЕРНУТЬСЯ НАЗАД
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ConfirmEmail;