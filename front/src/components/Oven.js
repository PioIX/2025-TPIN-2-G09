'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Oven.module.css';

export default function Oven({ pizzaImage, onBack }) {
    const [ovenOpen, setOvenOpen] = useState(false);

    const toggleOven = () => {
        setOvenOpen(!ovenOpen);
    };

    return (
        <div className={styles.container}>
            <div className={styles.ovenWrapper}>
                <div className={styles.ovenContainer}>
                    {/* Imagen del horno */}
                    <div className={styles.ovenImage}>
                        {ovenOpen ? (
                            <Image 
                                src="/imagesFondos/horno.png"
                                alt="Horno Abierto"
                                fill
                                className={styles.image}
                                priority
                            />
                        ) : (
                            <Image 
                                src="/imagesFondos/hornoCerrado.png"
                                alt="Horno Cerrado"
                                fill
                                className={styles.image}
                                priority
                            />
                        )}
                    </div>

                    {/* Pizza dentro del horno (solo cuando está abierto) */}
                    {pizzaImage && ovenOpen && (
                        <div className={styles.pizzaInOven}>
                            <img 
                                src={pizzaImage} 
                                alt="Pizza en el horno"
                                className={styles.pizzaImage}
                            />
                        </div>
                    )}
                </div>

                {/* Botón de abrir/cerrar */}
                <button
                    onClick={toggleOven}
                    className={styles.toggleButton}
                >
                    {ovenOpen ? '🔥 Cerrar Horno' : '👨‍🍳 Abrir Horno'}
                </button>
            </div>
        </div>
    );
}