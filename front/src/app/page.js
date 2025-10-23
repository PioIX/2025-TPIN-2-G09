'use client';

import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";
import Oven from "@/components/Oven";
import Cut from "@/components/Cut";
import Deliver from '@/components/Deliver';

export default function Game() {
    const [currentScreen, setCurrentScreen] = useState('order');
    const [pizzaImage, setPizzaImage] = useState(null);
    const [pizzaFilter, setPizzaFilter] = useState('');

    useEffect(() => {
        console.log("🎬 Current screen changed to:", currentScreen);
    }, [currentScreen]);

    const handleGoToKitchen = () => {
        console.log("Cambiando a Kitchen");
        setCurrentScreen('kitchen');
    };

    const handleGoToOven = (imageData) => {
        console.log("Cambiando a Oven con imagen:", imageData);
        setPizzaImage(imageData);
        setCurrentScreen('oven');
    };

    const handleGoToCut = (cookingState, filter) => {
        console.log("========= HANDLE GO TO CUT LLAMADO =========");
        console.log("Estado de cocción:", cookingState);
        console.log("Filtro recibido:", filter);
        console.log("Current screen ANTES:", currentScreen);
        
        setPizzaFilter(filter);
        setCurrentScreen('cut');
        
        console.log("setCurrentScreen('cut') EJECUTADO");
    };

    const handleGoToDeliver = () => {
        console.log("Cambiando a Deliver");
        setCurrentScreen('deliver');
    };

    console.log("🔄 RENDERIZANDO Game con currentScreen:", currentScreen);

    return (
        <div className={styles.container1}>
            <div className={styles.section}>
                {currentScreen === 'order' && <Order key={Date.now()} onGoToKitchen={handleGoToKitchen} />}
                {currentScreen === 'kitchen' && <Kitchen onGoToOven={handleGoToOven} />}
                {currentScreen === 'oven' && <Oven pizzaImage={pizzaImage} onGoToCut={handleGoToCut} />}
                {currentScreen === 'cut' && <Cut pizzaImage={pizzaImage} pizzaFilter={pizzaFilter} onGoToDeliver={handleGoToDeliver} />}
                {currentScreen === 'deliver' && <Deliver />}
            </div>
        </div>
    );
}