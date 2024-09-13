import React, { useState, useEffect } from 'react';
import { checkForNull } from '../../../helper';
import { countDownBlinkingTime } from '../../../config/constants';

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

                if (checkForNull(newTimeLeft.hours) === 0 && checkForNull(newTimeLeft.minutes) === 0 && checkForNull(newTimeLeft.seconds) === 0) {
                    clearInterval(timer);
                    setIsTimerRunning(false);
                } else {
                    setIsTimerRunning(true);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [endTime, isTimerRunning]);

    const formatTime = (time) => {
        return time.toString().padStart(2, '0');
    };
    return (
        <div className={`countdown ${timeLeft.hours === 0 && timeLeft.minutes <= countDownBlinkingTime ? 'last-minute' : ''}`}>
            <span>{formatTime(timeLeft.hours)}:</span>
            <span>{formatTime(timeLeft.minutes)}:</span>
            <span>{formatTime(timeLeft.seconds)}</span>
        </div>
    );
};

export default CountdownTimer;
