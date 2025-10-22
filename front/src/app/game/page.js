'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";
import Oven from "@/components/Oven";
import Cut from "@/components/Cut";
import Deliver from '@/components/Deliver';

export default function Game() {
    const [showKitchen, setShowKitchen] = useState(false);
    const [showOven, setShowOven] = useState(false);
    const [showCut, setShowCut] = useState(false);
    const [showDeliver, setShowDeliver] = useState(false);
    const [pizzaImage, setPizzaImage] = useState(null);

    const handleGoToKitchen = () => {
        console.log("Cambiando a Kitchen");
        setShowKitchen(true);
    };

    const handleGoToOven = (imageData) => {
        console.log("Cambiando a Oven con imagen:", imageData);
        setPizzaImage(imageData);
        setShowKitchen(false);
        setShowOven(true);
    };

    const handleGoToCut = () => {
        console.log("Cambiando a Cut");
        setShowCut(true);
        setShowOven(false);
    };

    const handleGoToDeliver = () => {
        console.log("Cambiando a Deliver");
        setShowDeliver(true);
        setShowCut(false);
    };

    return (
        <>
            
            <div className={styles.container1}>
                {
                    (!showDeliver) ? (
                    (!showCut ) ? (
                    (!showOven) ? (
                        (!showKitchen) ? (
                            <>
                                <div className={styles.section}>
                                    <Order key={Date.now()} onGoToKitchen={handleGoToKitchen} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.section}>
                                    <Kitchen onGoToOven={handleGoToOven} />
                                </div>
                            </>
                        )
                    ) : (
                        <div className={styles.section}>
                            <Oven
                                pizzaImage={pizzaImage}
                                onGoToCut={handleGoToCut}
                            />
                        </div>
                    )
                    ) : 
                    (
                        <Cut pizzaImage={pizzaImage} onGoToDeliver={handleGoToDeliver}></Cut>
                    )
                    ) : 
                    (
                        <Deliver ></Deliver>
                    )
                }
            </div>
        </>

    );
}