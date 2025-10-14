'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.css'

export default function MenuPrincipal() {
  const router = useRouter()
  const [mostrarReglas, setMostrarReglas] = useState(false)

  const handleJugar = () => {
    router.push('/game')
  }

  const toggleReglas = () => {
    setMostrarReglas(!mostrarReglas)
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
      </div>
    </div>
  )
}