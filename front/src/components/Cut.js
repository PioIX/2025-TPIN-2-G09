'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Oven.module.css';

export default function Oven({ pizzaImage, onGoToCut }) {
    const [isCooking, setIsCooking] = useState(false);
    const [cookingTime, setCookingTime] = useState(10);
    const [timeLeft, setTimeLeft] = useState(0);
    const [cookingState, setCookingState] = useState('raw');
    const [finalPizzaFilter, setFinalPizzaFilter] = useState('');
    const [pizzaPassedOven, setPizzaPassedOven] = useState(false);
    const [cookingFinished, setCookingFinished] = useState(false);

    const startCooking = () => {
        setIsCooking(true);
        setTimeLeft(cookingTime);
        setPizzaPassedOven(false);
        
        setTimeout(() => {
            setPizzaPassedOven(true);
        }, (cookingTime / 2) * 1000);
    };

    const decreaseTime = () => {
        if (cookingTime > 5) {
            setCookingTime(prev => prev - 1);
        }
    };

    const increaseTime = () => {
        if (cookingTime < 20) {
            setCookingTime(prev => prev + 1);
        }
    };

    const getFilterStyle = (time) => {
        if (time < 8) {
            return 'brightness(1.1) saturate(0.8)';
        } else if (time >= 8 && time <= 12) {
            return 'brightness(0.85) saturate(1.3) contrast(1.1)';
        } else {
            const burnLevel = (time - 12) / 8;
            const brightness = 0.5 - (burnLevel * 0.2);
            return `brightness(${brightness}) saturate(0.6) sepia(0.4)`;
        }
    };

    const getCurrentFilterStyle = () => {
        if (!pizzaPassedOven) {
            return 'brightness(1) saturate(1)';
        }
        return getFilterStyle(cookingTime);
    };

    const handleGoToCut = (state, filter) => {
        if (onGoToCut) {
            onGoToCut(state, filter);
        }
    };

    useEffect(() => {
        if (isCooking && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (isCooking && timeLeft === 0) {
            setIsCooking(false);
            
            let finalState = 'raw';
            if (cookingTime < 8) {
                finalState = 'raw';
            } else if (cookingTime >= 8 && cookingTime <= 12) {
                finalState = 'perfect';
            } else {
                finalState = 'burnt';
            }
            
            const finalFilter = getFilterStyle(cookingTime);
            setCookingState(finalState);
            setFinalPizzaFilter(finalFilter);

            setTimeout(() => {
                handleGoToCut(finalState, finalFilter);
            }, 500);
        }
    }, [isCooking, timeLeft, cookingTime]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.percent}></div>
                <div className={styles.order}></div>
                <div className={styles.time}></div>
            </div>

            <div className={styles.ovenWrapper}>
                <div className={styles.backgroundLayer}>
                    <Image
                        src="/imagesFondos/FondoCocina.png"
                        alt="Fondo Cocina"
                        fill
                        className={styles.image}
                        priority
                    />
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: '-35%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '400px',
                        height: '400px',
                        zIndex: 1,
                    }}
                >
                    <img
                        src="/imagesFondos/TablaPizza.png"
                        alt="Mesita"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </div>

                {pizzaImage && !isCooking && !finalPizzaFilter && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '-22%',
                            top: '41%',
                            width: '140px',
                            height: '140px',
                            zIndex: 2,
                        }}
                    >
                        <img
                            src={pizzaImage}
                            alt="Pizza en la mesita"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4))',
                            }}
                        />
                    </div>
                )}

                <div className={styles.grillLayer}>
                    <div className={styles.grillContainer}>
                        {[...Array(120)].map((_, i) => (
                            <div
                                key={i}
                                className={styles.grillBar}
                                style={{
                                    animationDelay: `${-i * 0.07}s`,
                                    animationPlayState: isCooking ? 'running' : 'paused'
                                }}
                            >
                                <Image
                                    src="/imagesFondos/Varilla.png"
                                    alt="Varilla"
                                    fill
                                    className={styles.grillImage}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {pizzaImage && isCooking && (
                    <div 
                        className={styles.pizzaSliding}
                        style={{
                            animationDuration: `${cookingTime}s`
                        }}
                    >
                        <img
                            src={pizzaImage}
                            alt="Pizza cocinandose"
                            className={styles.pizzaImage}
                            style={{
                                filter: getCurrentFilterStyle()
                            }}
                        />
                    </div>
                )}

                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '110%',
                        height: '110%',
                        zIndex: 4,
                        pointerEvents: 'none',
                    }}
                >
                    <Image
                        src="/imagesFondos/HornoCocina.png"
                        alt="Marco Horno"
                        fill
                        className={styles.image}
                        priority
                    />
                </div>

                {!isCooking && (
                    <div className={styles.controlPanel}>
                        <div className={styles.timeSelector}>
                            <button
                                className={styles.timeButton}
                                onClick={decreaseTime}
                            >
                                -
                            </button>
                            <div className={styles.timeDisplay}>
                                {cookingTime}s
                            </div>
                            <button
                                className={styles.timeButton}
                                onClick={increaseTime}
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={startCooking}
                            className={styles.toggleButton}
                        >
                            Cocinar
                        </button>
                    </div>
                )}

                {isCooking && (
                    <div className={styles.timerDisplay}>
                        <div className={styles.timerNumber}>{timeLeft}</div>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill}
                                style={{ 
                                    width: `${((cookingTime - timeLeft) / cookingTime) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}