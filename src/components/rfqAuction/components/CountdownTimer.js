import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime, checkTimerRunning }) => {
    const calculateTimeLeft = () => {
        const difference = new Date(endTime) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        } else {
            timeLeft = { hours: 0, minutes: 0, seconds: 0 };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    useEffect(() => {
        checkTimerRunning(isTimerRunning)
        if (isTimerRunning) {
            const timer = setInterval(() => {
                const newTimeLeft = calculateTimeLeft();
                setTimeLeft(newTimeLeft);

                if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
                    clearInterval(timer);
                    setIsTimerRunning(false);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [endTime, isTimerRunning]);

    const formatTime = (time) => {
        return time.toString().padStart(2, '0');
    };
    return (
        <div className={`countdown ${timeLeft.hours === 0 && timeLeft.minutes === 0 ? 'last-minute' : ''}`}>
            <span>{formatTime(timeLeft.hours)}:</span>
            <span>{formatTime(timeLeft.minutes)}:</span>
            <span>{formatTime(timeLeft.seconds)}</span>
        </div>
    );
};

export default CountdownTimer;
