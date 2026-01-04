import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Play, Loader2 } from 'lucide-react';
import '../styles/EnterName.css'; // Не забудь импортировать стили

const EnterName = () => {
    const { pin } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/rooms/join', { pin, name });
            navigate(`/arena/student/${pin}`, { state: { playerName: name } });
        } catch (err) {
            alert("Комната не найдена или закрыта");
            setLoading(false);
        }
    };

    return (
        <div className="enter-name-container">
            <div className="enter-name-card">
                <div className="enter-name-icon-wrapper">
                    <User size={32} className="enter-name-icon" />
                </div>
                <h1 className="enter-name-title">Как вас зовут?</h1>
                <p className="enter-name-subtitle">Комната: {pin}</p>

                <form onSubmit={handleJoin} className="enter-name-form">
                    <input
                        className="enter-name-input"
                        placeholder="Ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading} className="enter-name-button">
                        {loading ? (
                            <Loader2 className="enter-name-loader" />
                        ) : (
                            <>
                                <Play fill="currentColor" size={20} />
                                ПОЕХАЛИ!
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnterName;