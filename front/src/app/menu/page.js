'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.css'
import { useSocket } from '@/hooks/useSocket'
import Popup from 'reactjs-popup'
import Input from '@/components/Input'
import Lobby from '@/components/Lobby'

export default function MenuPrincipal() {
  const router = useRouter()
  const [mostrarReglas, setMostrarReglas] = useState(false)
  const { socket, isConnected } = useSocket();
  const [code, setCode] = useState("");
  const [inLobby, setInLobby] = useState(false);
  const [jugadores, setJugadores] = useState([]); // ← AÑADIDO
  const [userId, setUserId] = useState(null); // ← AÑADIDO

  useEffect(() => {
    // Obtener el userId del sessionStorage
    const id = sessionStorage.getItem("playerId");
    if (id) {
      setUserId(parseInt(id));
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("updatePlayers", (jugadores) => {
      console.log("Actualización de jugadores recibida");
      console.log("Jugadores actuales:", jugadores);
      setJugadores(jugadores);
    });

    socket.on("gameStart", (data) => {
      console.log("Recibido gameStart con code:", data.code);
      router.push(`/game?code=${data.code}`);
    });

    socket.on("roomCreated", (data) => {
      console.log("Sala creada con código:", data.code);
      setCode(data.code);
      setInLobby(true);
      setCreateRoomOpen(false); // Cerrar popup
    });

    socket.on("roomJoined", (data) => {
      console.log("Unido a sala:", data.code);
      setCode(data.code);
      setInLobby(true);
      setJoinRoomOpen(false); // Cerrar popup
    });

    socket.on("errorRoom", (msg) => {
      alert("Error: " + msg);
    });

    return () => {
      socket.off("updatePlayers");
      socket.off("gameStart");
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("errorRoom");
    };
  }, [socket, router]);

  const handleJugar = () => {
    setIsPopUpGameOpen(true);
  }

  function createRoom() {
    console.log("Crear sala");

    const id_user = sessionStorage.getItem("playerId");
    
    if (!id_user) {
      alert("No se encontró el ID del jugador");
      return;
    }

    socket.emit("createRoom", { id_user: parseInt(id_user) });
  }

  function joinRoom() {
    console.log("Unirse a sala:", code);

    const id_user = sessionStorage.getItem("playerId");
    
    if (!id_user) {
      alert("No se encontró el ID del jugador");
      return;
    }

    if (!code || code.trim() === "") {
      alert("Por favor ingresa un código de sala");
      return;
    }

    socket.emit("joinRoom", { 
      code: code.trim().toUpperCase(), 
      id_user: parseInt(id_user) 
    });
  }

  const toggleReglas = () => {
    setMostrarReglas(!mostrarReglas)
  }

  // handle PopUp
  const [isPopUpGameOpen, setIsPopUpGameOpen] = useState(false);
  const [isCreateRoomOpen, setCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setJoinRoomOpen] = useState(false);

  function showCreateRoom() {
    setIsPopUpGameOpen(false);
    setCreateRoomOpen(true);
  }
  
  function showJoinRoom() {
    setIsPopUpGameOpen(false);
    setJoinRoomOpen(true);
  }

  const closePopupGame = () => setIsPopUpGameOpen(false)
  const closeCreateRoom = () => setCreateRoomOpen(false);
  const closeJoinRoom = () => setJoinRoomOpen(false);

  if (inLobby) {
    return (
      <Lobby 
        code={code} 
        socket={socket} 
        jugadores={jugadores}
        userId={userId}
      />
    )
  }

  return (
    <div className={styles.menuContainer}>
      <div className={styles.backgroundImage}>
        <Image 
          src="/imagesFondos/FondoMenú.png" 
          alt="Fondo ciudad"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>PIZZAVENTURE</h1>

        <div className={styles.buttonsContainer}>
          <button className={styles.gameButton} onClick={handleJugar}>
            JUGAR
          </button>

          <button className={`${styles.gameButton} ${styles.rulesButton}`} onClick={toggleReglas}>
            REGLAS DEL JUEGO
          </button>
        </div>

        {mostrarReglas && (
          <div className={styles.modalOverlay} onClick={toggleReglas}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Reglas del Juego</h2>
              
              <p className={styles.modalText}>
                El objetivo del juego es preparar y entregar pizzas correctamente y a tiempo para satisfacer a los clientes y ganar dinero, 
                puntos y propinas. Con las ganancias se pueden desbloquear nuevos ingredientes y mejorar el menú. 
                A medida que avanzan los días, aumentan los pedidos y la dificultad. 
                Al final de cada jornada, el jugador verá su puntaje y posición en el ranking global y semanal. 
                Se espera respeto entre los jugadores y juego limpio. 
                El éxito depende de la rapidez, precisión y estrategia.
              </p>

              <button className={styles.closeButton} onClick={toggleReglas}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        <Popup
          open={isPopUpGameOpen}
          onClose={closePopupGame}
          modal
          nested
          closeOnDocumentClick={false}
        >
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>Jugar</h2>
            </div>
            <div className={styles.content}>
              <button onClick={showCreateRoom} className={styles.joinBtn}> Crear una sala </button>
              <button onClick={showJoinRoom} className={styles.joinBtn}> Unirse a una sala </button>
            </div>
            <div className={styles.actions}>
              <button onClick={closePopupGame} className={styles.cancelBtn}>
                Cerrar
              </button>
            </div>
          </div>
        </Popup>

        <Popup
          open={isCreateRoomOpen}
          onClose={closeCreateRoom}
          modal
          nested
          closeOnDocumentClick={false}
        >
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>Crear una Sala</h2>
            </div>
            <div className={styles.content}>
              <p>Aquí puedes configurar y crear una nueva sala de juego.</p>
            </div>
            <div className={styles.actions}>
              <button onClick={createRoom} className={styles.createBtn}>
                Crear
              </button>
              <button onClick={closeCreateRoom} className={styles.cancelBtn}>
                Cancelar
              </button>
            </div>
          </div>
        </Popup>

        <Popup
          open={isJoinRoomOpen}
          onClose={closeJoinRoom}
          modal
          nested
          closeOnDocumentClick={false}
        >
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2>Unirse a una Sala</h2>
            </div>
            <div className={styles.content}>
              <p>Escribe el código de la sala</p>
            </div>
            <Input 
              placeholder="ABC123..." 
              type="text" 
              onChange={(e) => {setCode(e.target.value)}}
            />
            <br/>
            <br/>
            <div className={styles.actions}>
              <button onClick={joinRoom} className={styles.createBtn}>
                Unirse
              </button>
              <button onClick={closeJoinRoom} className={styles.cancelBtn}>
                Cancelar
              </button>
            </div>
          </div>
        </Popup>
      </div>
    </div>
  )
}