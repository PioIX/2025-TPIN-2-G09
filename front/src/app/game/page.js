'use client';

import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";
import Oven from "@/components/Oven";
import Cut from "@/components/Cut";
import Deliver from '@/components/Deliver';
import { ScoreProvider, useScore } from '@/components/ScoreContext'
import { TimerProvider, useTimer } from '@/components/TimerContext';
import io from 'socket.io-client';

function GameContent() {
    const [showKitchen, setShowKitchen] = useState(false);
    const [showOven, setShowOven] = useState(false);
    const [showCut, setShowCut] = useState(false);
    const [showDeliver, setShowDeliver] = useState(false);
    const [pizzaImage, setPizzaImage] = useState(null);
    const [pizzaFilter, setPizzaFilter] = useState('');
    const [currentOrderText, setCurrentOrderText] = useState(''); 

    const [customers, setCustomers] = useState([]);
    const [currentCustomerIndex, setCurrentCustomerIndex] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);

    const [finalTotalTime, setFinalTotalTime] = useState(0);

    const [socket, setSocket] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [opponentFinished, setOpponentFinished] = useState(false);
    const [opponentTime, setOpponentTime] = useState(null);
    const [opponentMoney, setOpponentMoney] = useState(null);
    const [myMoney, setMyMoney] = useState(0);

    const { stopTimer, resetAll, formatTime, calculateTotalTime, saveCustomerTime, customerTimes, setTimeoutCallback, percentage } = useTimer();
    const { applyTimeoutPenalty } = useScore()

    useEffect(() => {
        const handleTimeout = () => {
            console.log('TIMEOUT DETECTADO - El tiempo se agotó!');
            console.log('Estado actual:', {
                showKitchen,
                showOven,
                showCut,
                showDeliver
            });
            
            const penalizedScore = applyTimeoutPenalty();
            console.log('Penalización aplicada. Score resultante:', penalizedScore);
            
            setShowKitchen(false);
            setShowOven(false);
            setShowCut(false);
            setShowDeliver(true);
            
            setPizzaImage(null);
            setPizzaFilter('');
            
            console.log('Redirigiendo a Deliver...');
        };
        
        setTimeoutCallback(handleTimeout);
        
        return () => {
            setTimeoutCallback(null);
        };
    }, [setTimeoutCallback, applyTimeoutPenalty, showKitchen, showOven, showCut, showDeliver]);



    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(
                    `http://localhost:4000/customersOrder`
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al obtener el pedido');
                }
                const data = await response.json();

                console.log("Clientes obtenidos del servidor:", data);
                console.log("Total de clientes:", data.length);
                
                setCustomers(data);

            } catch (error) {
                console.error('Error al cargar el pedido:', error);
            }
        };

        fetchOrder();
    }, []);

    const handleGoToKitchen = (orderText) => {
        console.log("Cambiando a Kitchen con orden:", orderText);
        setCurrentOrderText(orderText);
        setShowKitchen(true);
    };

    const handleGoToOven = (imageData) => {
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

    const handleNextCustomer = () => {
        const customerTime = saveCustomerTime();
        console.log(`Cliente ${currentCustomerIndex + 1} completado en: ${formatTime(customerTime)}`);

        const nextIndex = currentCustomerIndex + 1;

        if (nextIndex >= customers.length) {
            const totalTime = calculateTotalTime();
            setFinalTotalTime(totalTime);

            const timeInSeconds = Math.floor(totalTime / 1000);
            const money = Math.max(0, 1000 - timeInSeconds);
            setMyMoney(money);

            console.log("¡Juego terminado!");
            console.log("Tiempo total:", formatTime(totalTime));
            console.log("Dinero ganado:", money);
            console.log("Tiempos por cliente:", customerTimes.map((t, i) => `Cliente ${i + 1}: ${formatTime(t)}`));

            stopTimer();

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
            console.log(`Pasando al cliente ${nextIndex + 1} de ${customers.length}`);
            setCurrentCustomerIndex(nextIndex);
            setShowKitchen(false);
            setShowOven(false);
            setShowCut(false);
            setShowDeliver(false);
            setPizzaImage(null);
            setPizzaFilter('');
            setCurrentOrderText(''); 
        }
    };

    if (customers.length === 0) {
        return <div>Cargando clientes...</div>;
    }

    if (gameFinished) {
        return (
            <div className={styles.resultsContainer}>
                <div className={styles.resultsSection}>
                    <div className={styles.emoji}></div>
                    <h1 className={styles.resultTitle}>
                        {opponentFinished ? (
                            finalTotalTime < opponentTime ? '¡GANASTE!' :
                            finalTotalTime > opponentTime ? 'PERDISTE' :
                            '¡EMPATE!'
                        ) : 'JUEGO TERMINADO'}
                    </h1>
                    <p>Has completado los {customers.length} clientes</p>

                    <div className={styles.statsBox}>
                        <div className={`${styles.rankingItem} ${styles.winner}`}>
                            <div className={styles.playerInfo}>
                                <span className={styles.playerName}>Tú</span>
                            </div>
                            <span className={styles.playerTime}>{formatTime(finalTotalTime)}</span>
                            <span className={styles.playerMoney}>${myMoney}</span>
                        </div>

                        {opponentFinished && (
                            <div className={styles.rankingItem}>
                                <div className={styles.playerInfo}>
                                    <span className={styles.playerName}>Oponente</span>
                                </div>
                                <span className={styles.playerTime}>{formatTime(opponentTime)}</span>
                                <span className={styles.playerMoney}>${opponentMoney}</span>
                            </div>
                        )}
                    </div>

                    {!opponentFinished && (
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
                                    Cliente {index + 1} ({customers[index]?.name}): {formatTime(time)}
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
        <div className={styles.container}>
            {
                (!showDeliver) ? (
                    (!showCut) ? (
                        (!showOven) ? (
                            (!showKitchen) ? (
                                <div className={styles.section}>
                                    <Order
                                        key={currentCustomer.id_customer}
                                        customer={currentCustomer}
                                        onGoToKitchen={handleGoToKitchen}
                                    />
                                </div>
                            ) : (
                                <div className={styles.section}>
                                    <Kitchen 
                                        onGoToOven={handleGoToOven}
                                        orderText={currentOrderText}
                                    />
                                </div>
                            )
                        ) : (
                            <div className={styles.section}>
                                <Oven
                                    pizzaImage={pizzaImage}
                                    onGoToCut={handleGoToCut}
                                    orderText={currentOrderText}
                                />
                            </div>
                        )
                    ) : (
                        <Cut
                            pizzaImage={pizzaImage}
                            pizzaFilter={pizzaFilter}
                            onGoToDeliver={handleGoToDeliver}
                            orderText={currentOrderText}
                        />
                    )
                ) : (
                    <Deliver
                        onNextCustomer={handleNextCustomer}
                        currentCustomer={currentCustomerIndex + 1}
                        totalCustomers={customers.length}
                        orderText={currentOrderText}
                    />
                )
            }
        </div>
    );
}

export default function Game() {
    return (
        <TimerProvider>
            <ScoreProvider>
                <GameContent />
            </ScoreProvider>
        </TimerProvider>
    );
}