import React, { useState, useEffect } from 'react';
import { auctionBidDetails } from '../actions/RfqAuction';
import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';

const InputTimer = (props) => {
    const defaultTime = ":30"; // Default time value
    const [inputValue, setInputValue] = useState(defaultTime);
    const [timeRemaining, setTimeRemaining] = useState(1);
    const [isCounting, setIsCounting] = useState(false);
    const [isInputDisabled, setIsInputDisabled] = useState(true); // Initially disabled
    const [reloadCount, setReloadCount] = useState(0)
    const [inputStoreValue, setInputStoreValue] = useState(':15')
    const dispatch = useDispatch()
    useEffect(() => {
        // Set initial time and start countdown on mount
        const [minutes, seconds] = inputValue.split(":").map(Number);
        const totalMilliseconds = (minutes * 60 + seconds) * 1000;
        setTimeRemaining(totalMilliseconds);
        setIsCounting(true); // Start countdown immediately
        dispatch(auctionBidDetails(props.quotationAuctionId, () => { }))
    }, [reloadCount]);

    useEffect(() => {
        if (!props.isTimerRunning) {
            dispatch(auctionBidDetails(props.quotationAuctionId, () => { }))
        }
    }, [])
    useEffect(() => {
        let intervalId;

        if (isCounting) {
            intervalId = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 0) {
                        clearInterval(intervalId);
                        setIsCounting(false);
                        setIsInputDisabled(true);
                        return 0;
                    }
                    return prevTime - 1000;
                });
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isCounting]);

    useEffect(() => {
        if (isCounting) {
            setInputValue(formatTime(timeRemaining));
        }
        if (timeRemaining === 0) {
            setInputValue(inputStoreValue)
            setReloadCount(reloadCount + 1)
        }
    }, [timeRemaining, isCounting]);

    const handleEditToggle = () => {
        if (isInputDisabled) {
            // Enable input for editing
            setIsInputDisabled(false);
            setIsCounting(false); // Stop countdown while editing
        } else {
            // Start countdown with new input value
            const [minutes, seconds] = inputValue.split(":").map(Number);
            const totalMilliseconds = (minutes * 60 + seconds) * 1000;
            setTimeRemaining(totalMilliseconds);
            setIsCounting(true);
            setIsInputDisabled(true);
        }
    };

    const handleRefreshClick = debounce(() => {
        setReloadCount(reloadCount + 1)
        setInputValue(inputStoreValue)
        setTimeRemaining(0)

    }, 200);

    const formatTime = (ms) => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className='d-flex align-items-center'>
            <div className='d-flex'>
                {<input
                    type="text"
                    className="form-control timer-countdown"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setInputStoreValue(e.target.value)
                    }}
                    placeholder="MM:SS"
                    disabled={isInputDisabled}
                />}
                <button onClick={handleEditToggle} className={`${isInputDisabled ? 'edit-details-btn' : 'edit-details-btn'} ml-2 mr-3 mt-2`}></button>
            </div>
            <button
                type="button"
                onClick={handleRefreshClick}
                class="user-btn mr5"
                title="Auto Refresh"
            >
                <div class="refresh mr-0"></div>
            </button>
        </div>
    );
};

export default InputTimer;
