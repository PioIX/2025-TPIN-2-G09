"use client"

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export function TimerProvider({ children }) {
    const [percentage, setPercentage] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const intervalRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Efecto para el porcentaje (código original)
    useEffect(() => {
        if (isActive && percentage > 0) {
            intervalRef.current = setInterval(() => {
                setPercentage(prev => {
                    const newValue = prev - 2;
                    if (newValue <= 0) {
                        setIsActive(false);
                        return 0;
                    }
                    return newValue;
                });
            }, 3000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [isActive, percentage]);

    // Efecto para el temporizador MM:SS
    useEffect(() => {
        if (isTimerActive) {
            timerIntervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);

            return () => {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
            };
        }
    }, [isTimerActive]);

    // Función para formatear el tiempo en MM:SS
    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        setIsActive(true);
        setIsTimerActive(true);
    };

    const stopTimer = () => {
        setIsActive(false);
        setIsTimerActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    };

    const resetTimer = () => {
        setPercentage(100);
        setIsActive(false);
        setIsTimerActive(false);
        setSeconds(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    };

    return (
        <TimerContext.Provider value={{ 
            percentage, 
            isActive, 
            seconds,
            isTimerActive,
            formatTime,
            startTimer, 
            stopTimer, 
            resetTimer 
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