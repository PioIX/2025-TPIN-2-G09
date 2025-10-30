{/*"use client"

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const GameTimerContext = createContext();

export function GameTimerProvider({ children }) {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000); // Incrementa cada segundo

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [isRunning]);

    const startGameTimer = () => {
        setIsRunning(true);
    };

    const stopGameTimer = () => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const resetGameTimer = () => {
        setSeconds(0);
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    // Formatear el tiempo en MM:SS
    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <GameTimerContext.Provider value={{ 
            seconds,
            formattedTime: formatTime(),
            isRunning,
            startGameTimer,
            stopGameTimer,
            resetGameTimer
        }}>
            {children}
        </GameTimerContext.Provider>
    );
}

export function useGameTimer() {
    const context = useContext(GameTimerContext);
    if (!context) {
        throw new Error('useGameTimer debe usarse dentro de GameTimerProvider');
    }
    return context;
}

// Componente visual del temporizador (para usar en el header)
export function GameTimerDisplay({ className = '', style = {} }) {
    const { formattedTime } = useGameTimer();

    return (
        <div className={className} style={style}>
            {formattedTime}
        </div>
    );
}*/}