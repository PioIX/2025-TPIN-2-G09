"use client"

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export function TimerProvider({ children }) {
    const [percentage, setPercentage] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);

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
            }, 3000); // 3 segundos

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [isActive, percentage]);

    const startTimer = () => {
        setIsActive(true);
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

    return (
        <TimerContext.Provider value={{ 
            percentage, 
            isActive, 
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