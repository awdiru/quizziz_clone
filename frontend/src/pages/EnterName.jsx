import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../api/axios';
import {Loader2, Play, User} from 'lucide-react';
import '../styles/EnterName.css';

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
                    <User size={40} className="enter-name-icon"/>
                </div>

                <h1 className="enter-name-title">Представьтесь</h1>

                <p className="enter-name-subtitle">
                    Вход в комнату: <span className="room-pin-display">{pin}</span>
                </p>

                <form onSubmit={handleJoin} className="enter-name-form">
                    <input
                        className="enter-name-input"
                        placeholder="Ваше имя..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                    />

                    <button type="submit" disabled={loading || !name.trim()} className="enter-name-button">
                        {loading ? (
                            <Loader2 className="enter-name-loader" />
                        ) : (
                            <>
                                <Play fill="currentColor" size={24}/>
                                <span>ПОЕХАЛИ!</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnterName;