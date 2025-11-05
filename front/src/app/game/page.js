'use client';

import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";
import Oven from "@/components/Oven";
import Cut from "@/components/Cut";
import Deliver from '@/components/Deliver';
import { TimerProvider, useTimer } from '@/components/TimerContext';
import io from 'socket.io-client';

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

    // NUEVO: Socket y datos del jugador
    const [socket, setSocket] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [opponentFinished, setOpponentFinished] = useState(false);
    const [opponentTime, setOpponentTime] = useState(null);
    const [opponentMoney, setOpponentMoney] = useState(null);
    const [myMoney, setMyMoney] = useState(0);

    const { stopTimer, resetAll, formatTime, calculateTotalTime, saveCustomerTime, customerTimes } = useTimer();

    const allCustomers = [
        { id: 1, name: 'Personaje1' },
        { id: 2, name: 'Personaje2' },
        { id: 3, name: 'Personaje3' },
        { id: 4, name: 'Personaje4' },
        { id: 5, name: 'Personaje5' },
        { id: 6, name: 'Personaje6' },
        { id: 7, name: 'Personaje7' },
        { id: 8, name: 'Personaje8' }
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

    // MODIFICADO: Función para pasar al siguiente personaje o terminar el juego
    const handleNextCustomer = () => {
        // GUARDAR el tiempo del cliente actual
        const customerTime = saveCustomerTime();
        console.log(`⏱️ Cliente ${currentCustomerIndex + 1} completado en: ${formatTime(customerTime)}`);

        const nextIndex = currentCustomerIndex + 1;

        if (nextIndex >= customers.length) {
            // CALCULAR tiempo total
            const totalTime = calculateTotalTime();

            // CALCULAR money (misma lógica que el servidor)
            const timeInSeconds = Math.floor(totalTime / 1000);
            const money = Math.max(0, 1000 - timeInSeconds);
            setMyMoney(money);

            console.log("¡Juego terminado!");
            console.log("Tiempo total:", formatTime(totalTime));
            console.log("Dinero ganado:", money);
            console.log("Tiempos por cliente:", customerTimes.map((t, i) => `Cliente ${i + 1}: ${formatTime(t)}`));

            // DETENER el timer
            stopTimer();

            // EMITIR evento socket
            if (socket && roomCode && playerId) {
                socket.emit('gameFinished', {
                    playerId: playerId,
                    roomCode: roomCode,
                    totalTime: totalTime,
                    customerTimes: customerTimes
                });
                console.log('Evento gameFinished enviado al servidor');
            }

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
        const myTotalTime = calculateTotalTime();

        return (
            <div className={styles.container1}>
                <div className={styles.section}>
                    <h1>¡Juego Terminado!</h1>
                    <p>Has completado los 8 clientes</p>

                    <div className={styles.statsBox}>
                        <h2>Tu tiempo: {formatTime(myTotalTime)}</h2>
                        <h2>Dinero ganado: ${myMoney}</h2>
                    </div>

                    {opponentFinished ? (
                        <div className={styles.opponentBox}>
                            <h3>Resultado del oponente:</h3>
                            <p>Tiempo: {formatTime(opponentTime)}</p>
                            <p>Dinero: ${opponentMoney}</p>
                            <h1 className={styles.resultTitle}>
                                {myTotalTime < opponentTime ? '¡GANASTE!' :
                                    myTotalTime > opponentTime ? 'Perdiste' :
                                        '¡EMPATE!'}
                            </h1>
                        </div>
                    ) : (
                        <div className={styles.waitingBox}>
                            <p>Esperando a que el otro jugador termine...</p>
                        </div>
                    )}

                    <details className={styles.detailsSection}>
                        <summary className={styles.detailsSummary}>
                            Ver tiempos detallados por cliente
                        </summary>
                        <ul className={styles.timesList}>
                            {customerTimes.map((time, index) => (
                                <li key={index}>
                                    Cliente {index + 1}: {formatTime(time)}
                                </li>
                            ))}
                        </ul>
                    </details>
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