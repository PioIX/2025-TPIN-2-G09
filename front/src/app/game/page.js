'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";
import Oven from "@/components/Oven";
import Cut from "@/components/Cut";

export default function Game(){
    const [showKitchen, setShowKitchen] = useState(false);
    const [showOven, setShowOven] = useState(false);
    const [showCut, setShowCut] = useState(false);
    const [pizzaImage, setPizzaImage] = useState(null);

    const handleGoToKitchen = () => {
        console.log("Cambiando a Kitchen");
        setShowKitchen(true);
    };

    const handleBackToKitchen = () => {
        console.log("Volviendo a Kitchen");
        setShowKitchen(false);
    };

    const handleGoToOven = (imageData) => {
        console.log("Cambiando a Oven con imagen:", imageData);
        setPizzaImage(imageData);
        setShowOven(true);
    };

    const handleBackToOven = () => {
        console.log("Volviendo a Oven");
        setShowOven(false);
    };

    const handleGoToCut = () => {
        console.log("Cambiando a Cut");
        setShowCut(true);
    };

    const handleBackToCut = () => {
        console.log("Volviendo a Cut");
        setShowCut(false);
    };

    return (
        <>
            
            <div className={styles.container1}>
                {!showKitchen ? (
                    <>
                        <div className={styles.section}>
                            <Order key={Date.now()} onGoToKitchen={handleGoToKitchen}/>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.section}>
                            <Kitchen onGoToOven={handleGoToOven} />
                        </div>
                    </>
                )}
            </div>
            <div className={styles.container2}>
                {!showOven ? (
                    <div className={styles.section}>
                        <Kitchen onGoToOven={handleGoToOven} />
                    </div>
                ) : (
                    <div className={styles.section}>
                        <Oven 
                            pizzaImage={pizzaImage} 
                            onBack={handleBackToKitchen}
                        />
                    </div>
                )}
            </div>
            <div className={styles.container3}>
                {!showCut ? (
                    <div className={styles.section}>
                        <Oven onGoToCut={handleGoToCut} />
                    </div>
                ) : (
                    <div className={styles.section}>
                        <Cut onGoToCut={handleGoToDeliver} />
                    </div>
                )}
                <Cut pizzaImage={pizzaImage}></Cut>
            </div>
        </>
        
    );
}

