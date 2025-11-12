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
import { MoneyProvider, useMoney } from '@/components/MoneyContext';
import { useSocket } from '@/hooks/useSocket';
import { useConnection } from '@/hooks/useConnection';

function GameContent() {
    const { url } = useConnection();
    const { socket, isConnected } = useSocket();
    
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
    const [finalTotalScore, setFinalTotalScore] = useState(0);

    const [roomCode, setRoomCode] = useState(null);
    const [opponentFinished, setOpponentFinished] = useState(false);
    const [opponentTime, setOpponentTime] = useState(null);
    const [opponentScore, setOpponentScore] = useState(null);
    const [customerScores, setCustomerScores] = useState([]);
    
    // ✅ Usar refs para mantener valores actualizados en los callbacks
    const socketRef = useRef(socket);
    const isConnectedRef = useRef(isConnected);
    const roomCodeRef = useRef(roomCode);
    const gameFinishedRef = useRef(false);
    
    const { money, addMoney } = useMoney()
    const { stopTimer, resetAll, formatTime, calculateTotalTime, saveCustomerTime, customerTimes, setTimeoutCallback, percentage } = useTimer();
    const { applyTimeoutPenalty, calculateTotalScore, score, validationDetails, resetAllScores } = useScore()
    const [totalScore, setTotalScore] = useState(0);

    // ✅ Mantener refs actualizadas
    useEffect(() => {
        socketRef.current = socket;
    }, [socket]);

    useEffect(() => {
        isConnectedRef.current = isConnected;
    }, [isConnected]);

    useEffect(() => {
        roomCodeRef.current = roomCode;
    }, [roomCode]);

    useEffect(() => {
        gameFinishedRef.current = gameFinished;
    }, [gameFinished]);

    // ✅ Obtener el roomCode
    useEffect(() => {
        const storedRoomCode = localStorage.getItem('roomCode') || sessionStorage.getItem('roomCode');
        if (storedRoomCode) {
            setRoomCode(storedRoomCode);
            console.log('Room code obtenido:', storedRoomCode);
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        if (codeFromUrl) {
            setRoomCode(codeFromUrl);
            console.log('Room code desde URL:', codeFromUrl);
        }
    }, []);

    // ✅ Unirse a la sala
    useEffect(() => {
        if (!socket || !isConnected || !roomCode) {
            return;
        }

        console.log('Uniéndome a la sala:', roomCode);
        const id_user = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        socket.emit('joinRoom', { code: roomCode, id_user: id_user });

        socket.on('roomJoined', (data) => {
            console.log('Unido a la sala exitosamente:', data);
        });

        return () => {
            socket.off('roomJoined');
        };
    }, [socket, isConnected, roomCode]);

    // ✅ Configurar listeners del socket con mejor manejo
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('Socket no disponible o no conectado');
            return;
        }

        console.log('Configurando listeners del socket');

        // ✅ Escuchar cuando el oponente termina
        const handleOpponentFinished = (data) => {
            console.log('Oponente terminó el juego:', data);
            setOpponentFinished(true);
            setOpponentTime(data.totalTime);
            setOpponentScore(data.totalScore);
        };

        // ✅ Confirmación de que nuestro gameFinished fue recibido
        const handleGameFinishedAck = (data) => {
            console.log('Servidor confirmó recepción de gameFinished:', data);
        };

        // ✅ Detectar desconexión
        const handleDisconnect = (reason) => {
            console.log('Socket desconectado. Razón:', reason);
            if (reason === 'io server disconnect') {
                console.log('Intentando reconectar...');
                socket.connect();
            }
        };

        // ✅ Detectar reconexión
        const handleReconnect = (attemptNumber) => {
            console.log('Socket reconectado después de', attemptNumber, 'intentos');
            
            // Re-unirse a la sala
            if (roomCodeRef.current) {
                console.log('Re-uniéndose a la sala:', roomCodeRef.current);
                const id_user = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
                socket.emit('joinRoom', { code: roomCodeRef.current, id_user: id_user });
                
                // Si ya terminamos el juego, reenviar el resultado
                if (gameFinishedRef.current) {
                    console.log('Reenviando resultado del juego después de reconexión');
                    socket.emit('gameFinished', {
                        playerId: socket.id,
                        roomCode: roomCodeRef.current,
                        totalTime: finalTotalTime,
                        totalScore: finalTotalScore,
                        customerTimes: customerTimes,
                        customerScores: customerScores
                    });
                }
            }
        };

        // ✅ Detectar errores
        const handleConnectError = (error) => {
            console.error('Error de conexión:', error.message);
        };

        socket.on('opponentFinished', handleOpponentFinished);
        socket.on('gameFinishedAck', handleGameFinishedAck);
        socket.on('disconnect', handleDisconnect);
        socket.on('reconnect', handleReconnect);
        socket.on('connect_error', handleConnectError);

        return () => {
            socket.off('opponentFinished', handleOpponentFinished);
            socket.off('gameFinishedAck', handleGameFinishedAck);
            socket.off('disconnect', handleDisconnect);
            socket.off('reconnect', handleReconnect);
            socket.off('connect_error', handleConnectError);
        };
    }, [socket, isConnected, finalTotalTime, finalTotalScore, customerTimes, customerScores]);

    // ✅ Manejar timeout
    useEffect(() => {
        const handleTimeout = () => {
            console.log('TIMEOUT DETECTADO - El tiempo se agotó!');
            
            const penalizedScore = applyTimeoutPenalty();
            console.log('Penalización aplicada. Score resultante:', penalizedScore);
            
            setShowKitchen(false);
            setShowOven(false);
            setShowCut(false);
            setShowDeliver(true);
            
            setPizzaImage(null);
            setPizzaFilter('');
        };
        
        setTimeoutCallback(handleTimeout);
        
        return () => {
            setTimeoutCallback(null);
        };
    }, [setTimeoutCallback, applyTimeoutPenalty]);

    // ✅ Cargar clientes
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(url + "/customersOrder");

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al obtener el pedido');
                }
                const data = await response.json();

                console.log("Clientes obtenidos del servidor:", data);
                setCustomers(data);

            } catch (error) {
                console.error('Error al cargar el pedido:', error);
            }
        };

        fetchOrder();
    }, [url]);

    const handleGoToKitchen = (orderText) => {
        setCurrentOrderText(orderText);
        setShowKitchen(true);
    };

    const handleGoToOven = (imageData) => {
        setPizzaImage(imageData);
        setShowKitchen(false);
        setShowOven(true);
    };

    const handleGoToCut = (cookingState, filter) => {
        setPizzaFilter(filter);
        setShowCut(true);
        setShowOven(false);
    };

    const handleGoToDeliver = () => {
        setShowDeliver(true);
        setShowCut(false);
    };

    const handleNextCustomer = () => {
        const customerTime = saveCustomerTime();
        console.log(`Cliente ${currentCustomerIndex + 1} completado en: ${formatTime(customerTime)}`);

        const currentTotalScore = calculateTotalScore();
        setTotalScore(currentTotalScore);
        addMoney(currentTotalScore);

        const customerScore = {
            customerIndex: currentCustomerIndex,
            customerName: customers[currentCustomerIndex]?.name,
            time: customerTime,
            scores: {
                kitchen: score.kitchen,
                oven: score.oven,
                cut: score.cut,
                total: currentTotalScore
            },
            validations: {
                kitchen: validationDetails.kitchen,
                oven: validationDetails.oven,
                cut: validationDetails.cut
            }
        };

        const updatedCustomerScores = [...customerScores, customerScore];
        setCustomerScores(updatedCustomerScores);
        console.log('Score del cliente guardado:', customerScore);

        resetAllScores();

        const nextIndex = currentCustomerIndex + 1;

        if (nextIndex >= customers.length) {
            const totalTime = calculateTotalTime();
            setFinalTotalTime(totalTime);

            const allCustomersScore = updatedCustomerScores.reduce((sum, cs) => sum + cs.scores.total, 0);
            setFinalTotalScore(allCustomersScore);

            console.log("¡Juego terminado!");
            console.log("Tiempo total:", formatTime(totalTime));
            console.log("Score total:", allCustomersScore);

            stopTimer();

            // ✅ Usar refs para asegurar valores actuales
            const currentSocket = socketRef.current;
            const currentIsConnected = isConnectedRef.current;
            const currentRoomCode = roomCodeRef.current;

            // ✅ Enviar gameFinished con retry
            if (currentSocket && currentIsConnected && currentRoomCode) {
                console.log('Enviando gameFinished...');
                console.log('Socket ID:', currentSocket.id);
                console.log('Room Code:', currentRoomCode);
                console.log('Total Score:', allCustomersScore);
                console.log('Total Time:', totalTime);
                
                const gameData = {
                    playerId: currentSocket.id,
                    roomCode: currentRoomCode,
                    totalTime: totalTime,
                    totalScore: allCustomersScore,
                    customerTimes: customerTimes,
                    customerScores: updatedCustomerScores
                };

                // Enviar el evento
                currentSocket.emit('gameFinished', gameData);
                console.log('Evento gameFinished enviado');

                // ✅ Reenviar después de 2 segundos por si acaso
                setTimeout(() => {
                    if (socketRef.current && isConnectedRef.current) {
                        console.log('Reenviando gameFinished por seguridad...');
                        socketRef.current.emit('gameFinished', gameData);
                    }
                }, 2000);

            } else {
                console.error('No se pudo enviar gameFinished:');
                console.error('   - Socket:', currentSocket ? 'existe' : 'null');
                console.error('   - isConnected:', currentIsConnected);
                console.error('   - roomCode:', currentRoomCode);
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
        return <div className={styles.loadingContainer}>Cargando clientes...</div>;
    }

    // ✅ Pantalla de resultados mejorada
    if (gameFinished) {
        const iWon = opponentFinished && finalTotalScore > opponentScore;
        const iLost = opponentFinished && finalTotalScore < opponentScore;
        const isTie = opponentFinished && finalTotalScore === opponentScore;

        return (
            <div className={styles.resultsContainer}>
                <div className={styles.resultsSection}>
                    <div className={styles.emoji}>
                        {opponentFinished ? (
                            iWon ? '🏆' : iLost ? '😢' : '🤝'
                        ) : '⏳'}
                    </div>
                    <h1 className={styles.resultTitle}>
                        {opponentFinished ? (
                            iWon ? '¡GANASTE!' :
                            iLost ? 'PERDISTE' :
                            '¡EMPATE!'
                        ) : 'JUEGO TERMINADO'}
                    </h1>
                    <p>Has completado los {customers.length} clientes</p>

                    <div className={styles.statsBox}>
                        <div className={`${styles.rankingItem} ${iWon ? styles.winner : ''}`}>
                            <div className={styles.playerInfo}>
                                <span className={styles.playerName}>
                                    {iWon ? '🥇 ' : iLost ? '🥈 ' : ''}Tú
                                </span>
                            </div>
                            <div className={styles.playerStats}>
                                <span className={styles.playerTime}>{formatTime(finalTotalTime)}</span>
                                <span className={styles.playerScore}>{finalTotalScore} pts</span>
                            </div>
                        </div>

                        {opponentFinished && (
                            <div className={`${styles.rankingItem} ${!iWon && !isTie ? styles.winner : ''}`}>
                                <div className={styles.playerInfo}>
                                    <span className={styles.playerName}>
                                        {!iWon && !isTie ? '🥇 ' : iWon ? '🥈 ' : ''}Oponente
                                    </span>
                                </div>
                                <div className={styles.playerStats}>
                                    <span className={styles.playerTime}>{formatTime(opponentTime)}</span>
                                    <span className={styles.playerScore}>{opponentScore} pts</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!opponentFinished && (
                        <div className={styles.waitingBox}>
                            <p>Esperando a que el otro jugador termine...</p>
                            <p className={styles.yourScore}>Tu score: <strong>{finalTotalScore}</strong> puntos</p>
                            {/* ✅ Indicador de estado de conexión */}
                            {isConnected ? (
                                <p style={{color: 'green', fontSize: '0.9em', marginTop: '10px'}}>
                                    Conectado - Recibirás los resultados automáticamente
                                </p>
                            ) : (
                                <p style={{color: 'red', fontSize: '0.9em', marginTop: '10px'}}>
                                    Reconectando...
                                </p>
                            )}
                        </div>
                    )}

                    {/* Desglose por Cliente */}
                    <details className={styles.detailsSection} open>
                        <summary className={styles.detailsSummary}>
                            Resultados por Cliente
                        </summary>
                        <div className={styles.scoreRanking}>
                            {customerScores.map((cs, index) => (
                                <div key={index} className={styles.customerScoreCard}>
                                    <div className={styles.customerHeader}>
                                        <span className={styles.customerNumber}>Cliente {index + 1}</span>
                                        <span className={styles.customerTime}>{formatTime(cs.time)}</span>
                                    </div>
                                    
                                    <div className={styles.scoresGrid}>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Kitchen</span>
                                            <span className={styles.scoreValue}>{cs.scores.kitchen ?? 'N/A'}</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Oven</span>
                                            <span className={styles.scoreValue}>{cs.scores.oven ?? 'N/A'}</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Cut</span>
                                            <span className={styles.scoreValue}>{cs.scores.cut ?? 'N/A'}</span>
                                        </div>
                                        <div className={`${styles.scoreItem} ${styles.totalScore}`}>
                                            <span className={styles.scoreLabel}>Total</span>
                                            <span className={styles.scoreValue}>{cs.scores.total}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <div className={styles.totalSummary}>
                                <span>Score Total Acumulado:</span>
                                <span className={styles.grandTotal}>{finalTotalScore} pts</span>
                            </div>
                        </div>
                    </details>

                    {/* Indicador de conexión */}
                    {!isConnected && (
                        <div className={styles.connectionWarning}>
                            Conexión perdida con el servidor - Intentando reconectar...
                        </div>
                    )}
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
                <MoneyProvider>
                    <GameContent />
                </MoneyProvider>
            </ScoreProvider>
        </TimerProvider>
    );
}