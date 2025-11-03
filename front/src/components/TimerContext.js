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
                setPercentage((prevPercentage) => {
                    const newValue = prevPercentage - 2;
                    return newValue > 0 ? newValue : 0;
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
        throw new Error(error);
    }
    return context;
}