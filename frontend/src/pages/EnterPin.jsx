import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, ArrowRight } from 'lucide-react';
import '../styles/EnterPin.css';

const EnterPin = () => {
    const [pin, setPin] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pin.length === 5) navigate(`/join/${pin.toUpperCase()}`);
    };

    return (
        <div className="enter-pin-container">
            <div className="enter-pin-card">
                <div className="enter-pin-icon-wrapper">
                    <Hash size={32} className="enter-pin-icon" />
                </div>
                <h1 className="enter-pin-title">Вход в игру</h1>
                <p className="enter-pin-description">Введите код, который видите на экране учителя</p>

                <form onSubmit={handleSubmit} className="enter-pin-form">
                    <input
                        className="enter-pin-input"
                        placeholder="00000"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.substring(0, 5))}
                        required
                    />
                    <button type="submit" className="enter-pin-button">
                        ДАЛЕЕ <ArrowRight />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnterPin;