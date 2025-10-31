'use client';

import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";
import Oven from "@/components/Oven";
import Cut from "@/components/Cut";
import Deliver from '@/components/Deliver';
import { TimerProvider, useTimer } from '@/components/TimerContext';

function GameContent() {
    const [showKitchen, setShowKitchen] = useState(false);
    const [showOven, setShowOven] = useState(false);
    const [showCut, setShowCut] = useState(false);
    const [showDeliver, setShowDeliver] = useState(false);
    const [pizzaImage, setPizzaImage] = useState(null);
    const [pizzaFilter, setPizzaFilter] = useState('');

    // Sistema de personajes
    const [customers, setCustomers] = useState([]);
    const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);

    const { stopTimer, resetTimer, formatTime } = useTimer();

    const allCustomers = [
        { id: 1, name: 'Personaje 1' },
        { id: 2, name: 'Personaje 2' },
        { id: 3, name: 'Personaje 3' },
        { id: 4, name: 'Personaje 4' },
        { id: 5, name: 'Personaje 5' },
        { id: 6, name: 'Personaje 6' },
        { id: 7, name: 'Personaje 7' },
        { id: 8, name: 'Personaje 8' }
    ];

    // Función para barajar el array
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Inicializar personajes barajados al montar el componente
    useEffect(() => {
        const shuffled = shuffleArray(allCustomers);
        setCustomers(shuffled);
    }, []);

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

    const handleGoToCut = (cookingState, filter) => {
        console.log("Cambiando a Cut");
        console.log("Estado de cocción:", cookingState);
        console.log("Filtro recibido:", filter);
        setPizzaFilter(filter);
        setShowCut(true);
        setShowOven(false);
    };

    const handleGoToDeliver = () => {
        console.log("Cambiando a Deliver");
        setShowDeliver(true);
        setShowCut(false);
    };

    // Función para pasar al siguiente personaje o terminar el juego
    const handleNextCustomer = () => {
        const nextIndex = currentCustomerIndex + 1;

        if (nextIndex >= customers.length) {
            // Ya pasaron los 8 personajes, terminar el juego y DETENER EL TIMER
            console.log("¡Juego terminado! Han pasado todos los personajes");
            stopTimer();
            setGameFinished(true);
        } else {
            // Resetear estados y pasar al siguiente personaje
            console.log(`Pasando al personaje ${nextIndex + 1} de ${customers.length}`);
            setCurrentCustomerIndex(nextIndex);
            setShowKitchen(false);
            setShowOven(false);
            setShowCut(false);
            setShowDeliver(false);
            setPizzaImage(null);
            setPizzaFilter('');
        }
    };

    // Si no hay personajes cargados aún, mostrar loading
    if (customers.length === 0) {
        return <div className={styles.container1}>Cargando...</div>;
    }

    // Si el juego terminó, mostrar pantalla final
    if (gameFinished) {
        return (
            <div className={styles.container1}>
                <div className={styles.section}>
                    <h1>¡Juego Terminado!</h1>
                    <p>Han pasado los 8 personajes</p>
                    <p>Tiempo total: {formatTime()}</p>
                    <button onClick={() => {
                        resetTimer();
                        window.location.reload();
                    }}>
                        Jugar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    const currentCustomer = customers[currentCustomerIndex];

    return (
        <div className={styles.container1}>
            {
                (!showDeliver) ? (
                    (!showCut) ? (
                        (!showOven) ? (
                            (!showKitchen) ? (
                                <>
                                    <div className={styles.section}>
                                        <Order
                                            key={currentCustomer.id}
                                            character={currentCustomer}
                                            onGoToKitchen={handleGoToKitchen}
                                        />
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
                            <Cut
                                pizzaImage={pizzaImage}
                                pizzaFilter={pizzaFilter}
                                onGoToDeliver={handleGoToDeliver}
                            />
                        )
                ) :
                    (
                        <Deliver
                            onNextCustomer={handleNextCustomer}
                            currentCustomer={currentCustomerIndex + 1}
                            totalCustomers={customers.length}
                        />
                    )
            }
        </div>
    );
}

export default function Game() {
    return (
        <TimerProvider>
            <GameContent />
        </TimerProvider>
    );
}