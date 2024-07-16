import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ startTime, endTime }) => {
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());
    const [formattedTime, setFormattedTime] = useState(formatTime(timeRemaining));

    function calculateTimeRemaining() {
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const now = Date.now();
        return end - now;
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            const timeLeft = calculateTimeRemaining();
            setTimeRemaining(timeLeft);
            setFormattedTime(formatTime(timeLeft));

            if (timeLeft <= 0) {
                clearInterval(intervalId);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [startTime, endTime]);

    function formatTime(ms) {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    const isLastMinute = timeRemaining <= 60000; // 1 minute in milliseconds

    return (
        <div className={`countdown ${isLastMinute ? 'last-minute' : ''}`}>
            {formattedTime.split('').map((char, index) => (
                <span key={index}>{char}</span>
            ))}
        </div>
    );
};

export default CountdownTimer;
