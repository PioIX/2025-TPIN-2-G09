'use client';

import { useState, useEffect, useRef } from 'react';
import styles from "./page.module.css";
import Kitchen from "@/components/Kitchen";
import Order from "@/components/Order";
import Oven from "@/components/Oven";
import Cut from "@/components/Cut";
import Deliver from '@/components/Deliver';
import { ScoreProvider, useScore } from '@/contexts/ScoreContext'
import { TimerProvider, useTimer } from '@/contexts/TimerContext';
import { MoneyProvider, useMoney } from '@/contexts/MoneyContext';
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
    const [userId, setUserId] = useState(null);
    const [opponentFinished, setOpponentFinished] = useState(false);
    const [opponentTime, setOpponentTime] = useState(null);
    const [opponentScore, setOpponentScore] = useState(null);
    const [customerScores, setCustomerScores] = useState([]);
    
    const socketRef = useRef(socket);
    const isConnectedRef = useRef(isConnected);
    const roomCodeRef = useRef(roomCode);
    const userIdRef = useRef(userId);
    const gameFinishedRef = useRef(false);
    
    const { money, addMoney } = useMoney()
    const { stopTimer, resetAll, formatTime, calculateTotalTime, saveCustomerTime, customerTimes, setTimeoutCallback, percentage } = useTimer();
    const { applyTimeoutPenalty, calculateTotalScore, score, validationDetails, resetAllScores } = useScore()
    const [totalScore, setTotalScore] = useState(0);

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
        userIdRef.current = userId;
    }, [userId]);

    useEffect(() => {
        gameFinishedRef.current = gameFinished;
    }, [gameFinished]);

    useEffect(() => {
        const storedRoomCode = localStorage.getItem('roomCode') || sessionStorage.getItem('roomCode');
        if (storedRoomCode) {
            setRoomCode(storedRoomCode);
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        if (codeFromUrl) {
            setRoomCode(codeFromUrl);
        }

        const storedUserId = localStorage.getItem('id_user') || sessionStorage.getItem('id_user');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    useEffect(() => {
        if (!socket || !isConnected || !roomCode || !userId) {
            return;
        }

        socket.emit('joinRoom', { code: roomCode, id_user: userId });

        socket.on('roomJoined', (data) => {
            console.log('Unido a la sala exitosamente:', data);
        });

        return () => {
            socket.off('roomJoined');
        };
    }, [socket, isConnected, roomCode, userId]);

    useEffect(() => {
        if (!socket || !isConnected) {
            return;
        }

        const handleOpponentFinished = (data) => {
            console.log('Oponente termino el juego:', data);
            setOpponentFinished(true);
            setOpponentTime(data.totalTime);
            setOpponentScore(data.totalScore);
        };

        const handleDisconnect = (reason) => {
            console.log('Socket desconectado. Razon:', reason);
            if (reason === 'io server disconnect') {
                socket.connect();
            }
        };

        const handleReconnect = (attemptNumber) => {
            console.log('Socket reconectado despues de', attemptNumber, 'intentos');
            
            if (roomCodeRef.current && userIdRef.current) {
                socket.emit('joinRoom', { code: roomCodeRef.current, id_user: userIdRef.current });
                
                if (gameFinishedRef.current) {
                    console.log('Reenviando resultado del juego despues de reconexion');
                    socket.emit('gameFinished', {
                        playerId: userIdRef.current,
                        roomCode: roomCodeRef.current,
                        totalTime: finalTotalTime,
                        totalScore: finalTotalScore,
                        customerTimes: customerTimes,
                        customerScores: customerScores
                    });
                }
            }
        };

        const handleConnectError = (error) => {
            console.error('Error de conexion:', error.message);
        };

        socket.on('oponenteTermino', handleOpponentFinished);
        socket.on('disconnect', handleDisconnect);
        socket.on('reconnect', handleReconnect);
        socket.on('connect_error', handleConnectError);

        return () => {
            socket.off('oponenteTermino', handleOpponentFinished);
            socket.off('disconnect', handleDisconnect);
            socket.off('reconnect', handleReconnect);
            socket.off('connect_error', handleConnectError);
        };
    }, [socket, isConnected, finalTotalTime, finalTotalScore, customerTimes, customerScores]);

    useEffect(() => {
        const handleTimeout = () => {
            const penalizedScore = applyTimeoutPenalty();
            
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

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(url + "/customersOrder");

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al obtener el pedido');
                }
                const data = await response.json();

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

        resetAllScores();

        const nextIndex = currentCustomerIndex + 1;

        if (nextIndex >= customers.length) {
            const totalTime = calculateTotalTime();
            setFinalTotalTime(totalTime);

            const allCustomersScore = updatedCustomerScores.reduce((sum, cs) => sum + cs.scores.total, 0);
            setFinalTotalScore(allCustomersScore);

            stopTimer();

            const currentSocket = socketRef.current;
            const currentIsConnected = isConnectedRef.current;
            const currentRoomCode = roomCodeRef.current;
            const currentUserId = userIdRef.current;

            if (currentSocket && currentIsConnected && currentRoomCode && currentUserId) {
                const gameData = {
                    playerId: currentUserId,
                    roomCode: currentRoomCode,
                    totalTime: totalTime,
                    totalScore: allCustomersScore,
                    customerTimes: customerTimes,
                    customerScores: updatedCustomerScores
                };

                currentSocket.emit('gameFinished', gameData);

                setTimeout(() => {
                    if (socketRef.current && isConnectedRef.current) {
                        socketRef.current.emit('gameFinished', gameData);
                    }
                }, 2000);
            }

            setGameFinished(true);
        } else {
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
                            iWon ? 'GANASTE' :
                            iLost ? 'PERDISTE' :
                            'EMPATE'
                        ) : 'JUEGO TERMINADO'}
                    </h1>
                    <p>Has completado los {customers.length} clientes</p>

                    <div className={styles.statsBox}>
                        <div className={`${styles.rankingItem} ${iWon ? styles.winner : ''}`}>
                            <div className={styles.playerInfo}>
                                <span className={styles.playerName}>
                                    {iWon ? '🥇 ' : iLost ? '🥈 ' : ''}Tu
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
                            {isConnected ? (
                                <p style={{color: 'green', fontSize: '0.9em', marginTop: '10px'}}>
                                    Conectado - Recibiras los resultados automaticamente
                                </p>
                            ) : (
                                <p style={{color: 'red', fontSize: '0.9em', marginTop: '10px'}}>
                                    Reconectando...
                                </p>
                            )}
                        </div>
                    )}

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

                    {!isConnected && (
                        <div className={styles.connectionWarning}>
                            Conexion perdida con el servidor - Intentando reconectar...
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