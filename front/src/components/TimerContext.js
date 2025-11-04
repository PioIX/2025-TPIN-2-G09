"use client"

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export function TimerProvider({ children }) {
    const [percentage, setPercentage] = useState(100);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);
    
    // NUEVO: Variables para tracking de tiempos
    const [customerTimes, setCustomerTimes] = useState([]);
    const [customerStartTime, setCustomerStartTime] = useState(null);
    const [totalGameTime, setTotalGameTime] = useState(0);

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
        // Iniciar el tiempo del cliente cuando empieza el timer
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

    // NUEVO: Guardar el tiempo del cliente actual
    const saveCustomerTime = () => {
        if (customerStartTime) {
            const customerTime = Date.now() - customerStartTime;
            setCustomerTimes(prev => [...prev, customerTime]);
            setCustomerStartTime(Date.now()); // Reiniciar para el próximo cliente
            return customerTime;
        }
        return 0;
    };

    // NUEVO: Calcular tiempo total
    const calculateTotalTime = () => {
        const total = customerTimes.reduce((sum, time) => sum + time, 0);
        setTotalGameTime(total);
        return total;
    };

    // NUEVO: Formatear tiempo en mm:ss
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

    // NUEVO: Resetear todo (para nuevo juego)
    const resetAll = () => {
        setCustomerTimes([]);
        setCustomerStartTime(null);
        setTotalGameTime(0);
        resetTimer();
    };

    return (
        <TimerContext.Provider value={{
            percentage,
            isActive,
            startTimer,
            stopTimer,
            resetTimer,
            // NUEVO: Exportar funciones de tracking
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