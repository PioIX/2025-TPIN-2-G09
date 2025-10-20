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
                {/* Imagen completa del horno/cocina */}
                <div className={styles.ovenImage}>
                    <Image 
                        src="/imagesFondos/FondoCocina.png"
                        alt="Cocina"
                        fill
                        className={styles.image}
                        priority
                    />
                </div>

                {/* Pizza que se desliza por debajo */}
                {pizzaImage && isCooking && (
                    <div className={styles.pizzaSliding}>
                        <img 
                            src={pizzaImage} 
                            alt="Pizza cocinándose"
                            className={styles.pizzaImage}
                        />
                    </div>
                )}

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