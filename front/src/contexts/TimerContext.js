"use client"

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export function TimerProvider({ children }) {
    const [percentage, setPercentage] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);
    const onTimeoutCallbackRef = useRef(null);
    
    const [customerTimes, setCustomerTimes] = useState([]);
    const [customerStartTime, setCustomerStartTime] = useState(null);
    const [totalGameTime, setTotalGameTime] = useState(0);

    useEffect(() => {
        if (isActive && percentage > 0) {
            intervalRef.current = setInterval(() => {
                setPercentage((prevPercentage) => {
                    const newValue = prevPercentage - 2;

                    if (newValue <= 0) {
                        console.log('Timer llegó a 0, ejecutando callback...');
                        if (onTimeoutCallbackRef.current) {
                            setTimeout(() => {
                                onTimeoutCallbackRef.current();
                            }, 0);
                        }
                        return 0;
                    }
                    return newValue;
                });
            }, 3000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, percentage]);

    const startTimer = () => {
        setIsActive(true);
        if (!customerStartTime) {
            setCustomerStartTime(Date.now());
        }
    };

    const stopTimer = () => {
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const resetTimer = () => {
        setPercentage(100);
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const setTimeoutCallback = (callback) => {
        onTimeoutCallbackRef.current = callback
    }

    const saveCustomerTime = () => {
        if (customerStartTime) {
            const customerTime = Date.now() - customerStartTime;
            setCustomerTimes(prev => [...prev, customerTime]);
            setCustomerStartTime(Date.now()); // Reiniciar para el próximo cliente
            return customerTime;
        }
        return 0;
    };

    const calculateTotalTime = () => {
        const total = customerTimes.reduce((sum, time) => sum + time, 0);
        setTotalGameTime(total);
        return total;
    };

    const formatTime = (milliseconds) => {
        if (!milliseconds) {
            const total = customerTimes.reduce((sum, time) => sum + time, 0);
            milliseconds = total;
        }
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const resetAll = () => {
        setCustomerTimes([]);
        setCustomerStartTime(null);
        setTotalGameTime(0);
        resetTimer();
        onTimeoutCallbackRef.current = null
    };

    return (
        <TimerContext.Provider value={{
            percentage,
            isActive,
            startTimer,
            stopTimer,
            resetTimer,
            setTimeoutCallback,
            saveCustomerTime,
            calculateTotalTime,
            formatTime,
            customerTimes,
            totalGameTime,
            resetAll
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer debe usarse dentro de TimerProvider');
    }
    return context;
}