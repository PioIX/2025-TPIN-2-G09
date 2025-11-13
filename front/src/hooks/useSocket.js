import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (serverUrl = "ws://10.1.5.119:4000/", options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    console.log('Inicializando socket...');

    const defaultOptions = {
      withCredentials: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      ...options
    };

    const socketIo = io(serverUrl, defaultOptions);

    socketRef.current = socketIo;
    socketIo.on('connect', () => {
      setIsConnected(true);
      console.log('Socket conectado. ID:', socketIo.id);
    });

    socketIo.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Socket desconectado. Razón:', reason);
    });

    socketIo.on('reconnect_attempt', (attemptNumber) => {
      console.log('Intento de reconexión:', attemptNumber);
    });

    socketIo.on('reconnect', (attemptNumber) => {
      console.log('Reconectado después de', attemptNumber, 'intentos');
      setIsConnected(true);
    });

    socketIo.on('reconnect_error', (error) => {
      console.error('Error de reconexión:', error.message);
    });

    socketIo.on('reconnect_failed', () => {
      console.error('Falló la reconexión después de todos los intentos');
    });

    socketIo.on('connect_error', (error) => {
      console.error('Error de conexión:', error.message);
      setIsConnected(false);
    });


    setSocket(socketIo);

    return () => {
      console.log('🧹 Limpiando socket...');
      socketIo.removeAllListeners();
      socketIo.disconnect();
    };
  }, [serverUrl]);

  return { socket, isConnected };
};

export { useSocket };