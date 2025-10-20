'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Oven.module.css';

export default function Oven({ pizzaImage, onBack }) {
    const [isCooking, setIsCooking] = useState(false);

    const startCooking = () => {
        setIsCooking(true);
        // La animación dura 4 segundos, después volvemos al estado inicial
        setTimeout(() => {
            setIsCooking(false);
        }, 4000);
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

                {/* CAPA 2: Varillas animadas (múltiples copias en loop) */}
                <div className={styles.grillLayer}>
                    <div className={styles.grillContainer}>
                        {/* Creamos múltiples varillas para efecto continuo */}
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className={styles.grillBar}>
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

                {/* CAPA 3: Pizza que se desliza */}
                {pizzaImage && isCooking && (
                    <div className={styles.pizzaSliding}>
                        <img 
                            src={pizzaImage} 
                            alt="Pizza cocinándose"
                            className={styles.pizzaImage}
                        />
                    </div>
                )}

                {/* CAPA 4: Marco del horno (encima de todo) */}
                <div className={styles.ovenFrame}>
                    <Image 
                        src="/imagesFondos/HornoCocina.png"
                        alt="Marco Horno"
                        fill
                        className={styles.image}
                        priority
                    />
                </div>

                {/* Botón para iniciar la cocción */}
                <button
                    onClick={startCooking}
                    className={styles.toggleButton}
                    disabled={isCooking}
                >
                    {isCooking ? 'Cocinando...' : 'Cerrar Horno'}
                </button>
            </div>
        </div>
    );
}