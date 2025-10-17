'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";
import Oven from "@/components/Oven";

export default function Game(){
    const [showOven, setShowOven] = useState(false);
    const [pizzaImage, setPizzaImage] = useState(null);

    const handleGoToOven = (imageData) => {
        console.log("Cambiando a Oven con imagen:", imageData);
        setPizzaImage(imageData);
        setShowOven(true);
    };

    const handleBackToKitchen = () => {
        console.log("Volviendo a Kitchen");
        setShowOven(false);
    };

    return (
        <div className={styles.container}>
            {!showOven ? (
                <>
                    <div className={styles.section}>
                        <Order key={Date.now()} />
                    </div>
                    <div className={styles.section}>
                        <Kitchen onGoToOven={handleGoToOven} />
                    </div>
                </>
            ) : (
                <div className={styles.section}>
                    <Oven 
                        pizzaImage={pizzaImage} 
                        onBack={handleBackToKitchen}
                    />
                </div>
            )}
        </div>
    );
}

