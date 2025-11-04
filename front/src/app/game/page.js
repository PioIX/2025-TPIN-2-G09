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

    // NUEVO: Inicializar socket
    useEffect(() => {
        const newSocket = io('http://localhost:4000');
        setSocket(newSocket);

        // Obtener datos del jugador del localStorage
        const userId = localStorage.getItem('id_user');
        const code = localStorage.getItem('roomCode');
        setPlayerId(userId);
        setRoomCode(code);

        // Escuchar cuando el oponente termina
        newSocket.on('playerFinished', (data) => {
            console.log('🏁 Oponente terminó:', data);
            setOpponentFinished(true);
            setOpponentTime(data.totalTime);
            setOpponentMoney(data.money);
        });

        // Escuchar resultado final del juego
        newSocket.on('gameResults', (data) => {
            console.log('🎮 Resultados finales:', data);
            // Puedes agregar lógica adicional aquí si quieres
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

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
            
            console.log("🏁 ¡Juego terminado!");
            console.log("⏱️ Tiempo total:", formatTime(totalTime));
            console.log("💰 Dinero ganado:", money);
            console.log("📊 Tiempos por cliente:", customerTimes.map((t, i) => `Cliente ${i + 1}: ${formatTime(t)}`));

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
                console.log('📤 Evento gameFinished enviado al servidor');
            }

            setGameFinished(true);
        } else {
            // Resetear estados y pasar al siguiente personaje
            console.log(`➡️ Pasando al personaje ${nextIndex + 1} de ${customers.length}`);
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
                    <h1>🏁 ¡Juego Terminado!</h1>
                    <p>Has completado los 8 clientes</p>
                    
                    <div style={{margin: '20px 0', padding: '20px', background: '#f0f0f0', borderRadius: '10px'}}>
                        <h2>⏱️ Tu tiempo: {formatTime(myTotalTime)}</h2>
                        <h2>💰 Dinero ganado: ${myMoney}</h2>
                    </div>
                    
                    {opponentFinished ? (
                        <div style={{margin: '20px 0', padding: '20px', background: '#e0e0e0', borderRadius: '10px'}}>
                            <h3>Resultado del oponente:</h3>
                            <p>⏱️ Tiempo: {formatTime(opponentTime)}</p>
                            <p>💰 Dinero: ${opponentMoney}</p>
                            <h1 style={{fontSize: '48px', margin: '20px 0'}}>
                                {myTotalTime < opponentTime ? '🎉 ¡GANASTE!' : 
                                 myTotalTime > opponentTime ? '😢 Perdiste' : 
                                 '🤝 ¡EMPATE!'}
                            </h1>
                        </div>
                    ) : (
                        <div style={{padding: '20px', background: '#fff3cd', borderRadius: '10px'}}>
                            <p>⏳ Esperando a que el otro jugador termine...</p>
                        </div>
                    )}

                    <details style={{marginTop: '20px', textAlign: 'left'}}>
                        <summary style={{cursor: 'pointer', fontWeight: 'bold'}}>
                            📊 Ver tiempos detallados por cliente
                        </summary>
                        <ul style={{marginTop: '10px'}}>
                            {customerTimes.map((time, index) => (
                                <li key={index}>
                                    Cliente {index + 1}: {formatTime(time)}
                                </li>
                            ))}
                        </ul>
                    </details>

                    <button 
                        onClick={() => {
                            resetAll();
                            window.location.reload();
                        }}
                        style={{
                            marginTop: '30px',
                            padding: '15px 30px',
                            fontSize: '18px',
                            cursor: 'pointer',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        🔄 Jugar de nuevo
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