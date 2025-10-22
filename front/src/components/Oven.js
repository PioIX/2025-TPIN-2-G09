'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Oven.module.css';

export default function Oven({ pizzaImage, onGoToCut }) {
    const [isCooking, setIsCooking] = useState(false);
    const [pizzaMoving, setPizzaMoving] = useState(false);

    const startCooking = () => {
        // Directamente comienza la cocción sin movimiento previo
        setIsCooking(true);
        
        // La animación de cocción dura 7 segundos
        setTimeout(() => {
            setIsCooking(false);
            handleGoToCut()
        }, 7000);
    };

    const handleGoToCut = () => {
        if(onGoToCut) {
            onGoToCut();
        } else {
            console.error("onGoToCut no está definida");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.ovenWrapper}>

                {/* CAPA 1: Fondo de la cocina */}
                <div className={styles.backgroundLayer}>
                    <Image
                        src="/imagesFondos/FondoCocina.png"
                        alt="Fondo Cocina"
                        fill
                        className={styles.image}
                        priority
                    />
                </div>

                {/* Mesita de la izquierda - CASI EN LA PUNTA IZQUIERDA */}
                <div style={{
                    position: 'absolute',
                    left: '-35%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '400px',
                    height: '400px',
                    zIndex: 1
                }}>
                    <img
                        src="/imagesFondos/TablaPizza.png"
                        alt="Mesita"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>

                {/* Pizza en la mesita (estado inicial) - CENTRADA EN LA TABLA */}
                {pizzaImage && !isCooking && (
                    <div style={{
                        position: 'absolute',
                        left: '-22%',
                        top: '41%',
                        width: '140px',
                        height: '140px',
                        zIndex: 2
                    }}>
                        <img
                            src={pizzaImage}
                            alt="Pizza en la mesita"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4))'
                            }}
                        />
                    </div>
                )}
                {/* CAPA 2: Varillas animadas (siempre en movimiento) */}
                <div className={styles.grillLayer}>
                    <div className={styles.grillContainer}>
                        {/* Aumentamos a 120 varillas para cubrir toda la pantalla */}
                        {[...Array(120)].map((_, i) => (
                            <div
                                key={i}
                                className={styles.grillBar}
                                style={{
                                    animationDelay: `${-i * 0.07}s`
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

                {/* CAPA 3: Pizza que se desliza cocinando */}
                {pizzaImage && isCooking && (
                    <div className={styles.pizzaSliding}>
                        <img
                            src={pizzaImage}
                            alt="Pizza cocinándose"
                            className={styles.pizzaImage}
                        />
                    </div>
                )}

                {/* CAPA 4: Marco del horno (encima de todo) - MÁS GRANDE */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '110%',
                    height: '110%',
                    zIndex: 4,
                    pointerEvents: 'none'
                }}>
                    <Image
                        src="/imagesFondos/HornoCocina.png"
                        alt="Marco Horno"
                        fill
                        className={styles.image}
                        priority
                    />
                </div>

                {/* Botón para iniciar la cocción - MÁS ABAJO */}
                <button
                    onClick={startCooking}
                    className={styles.toggleButton}
                    disabled={isCooking}
                    style={{
                        bottom: '5px'
                    }}
                >
                    {isCooking ? 'Cocinando...' : 'Cocinar'}
                </button>

                {/* Botón para pasar a cortar - MÁS ABAJO */}
                <button 
                    className={styles.toggleButton} 
                    onClick={handleGoToCut}
                    style={{
                        bottom: '-50px'
                    }}
                >
                    Cortar
                </button>
            </div>
        </div>
    );
    
}