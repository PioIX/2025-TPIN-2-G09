'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Oven.module.css';

export default function Oven({ pizzaImage, onGoToCut }) {
    const [isCooking, setIsCooking] = useState(false);

    const startCooking = () => {
        setIsCooking(true);
        // La animación dura 7 segundos, después volvemos al estado inicial
        setTimeout(() => {
            setIsCooking(false);
        }, 7000);
    };

    const handleGoToCut = () => {
        const canvas = canvasRef.current;
        if(!canvas) {
            console.log("No hay canvas");
            return;
        }
        try{
            if(onGoToCut) {
                onGoToKitchen();
            } else {
                console.error("onGoToKitchen no está definida");
            }
        } catch(error){
            console.error("Error al guardar la pizza: ", error);
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

                {/* CAPA 2: Varillas animadas (siempre en movimiento) */}
                <div className={styles.grillLayer}>
                    <div className={styles.grillContainer}>
                        {/* Aumentamos a 120 varillas para cubrir toda la pantalla */}
                        {[...Array(120)].map((_, i) => (
                            <div
                                key={i}
                                className={styles.grillBar}
                                style={{
                                    animationDelay: `${-i * 0.05}s`
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
                    {isCooking ? 'Cocinando...' : 'Cocinar'}
                </button>

                {/* Botón para pasar a cortar*/}
                <div className={styles.btns}>
                    <button className={styles.bake} onClick={handleGoToCut}>Cortar</button>
                </div>
            </div>
        </div>
    );
}