'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function MenuPrincipal() {
  const router = useRouter()
  const [mostrarReglas, setMostrarReglas] = useState(false)

  const handleJugar = () => {
    router.push('/juego')
  }

  const toggleReglas = () => {
    setMostrarReglas(!mostrarReglas)
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      {/* Imagen de fondo */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <Image 
          src="/imagesFondos/FondoMenú.png" 
          alt="Fondo ciudad"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '20px', textAlign: 'center' }}>
        <div>
          <Image 
            src="/imagesFondos/LogoPizza.png" 
            alt="Pizza"
            width={150}
            height={150}
          />
        </div>

        <h1>PIZZAVENTURE</h1>

        <div>
          <button onClick={handleJugar}>
            JUGAR
          </button>

          <button onClick={toggleReglas}>
            REGLAS DEL JUEGO
          </button>
        </div>

        {mostrarReglas && (
          <div 
            onClick={toggleReglas}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '10px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto'
              }}
            >
              <h2>Reglas del Juego</h2>
              
              <div>
                <p>El objetivo del juego es preparar y entregar pizzas correctamente y a tiempo para satisfacer a los clientes y ganar dinero, 
                    puntos y propinas. Con las ganancias se pueden desbloquear nuevos ingredientes y mejorar el menú. 
                    A medida que avanzan los días, aumentan los pedidos y la dificultad. Al final de cada jornada, 
                    el jugador verá su puntaje y posición en el ranking global y semanal. Se espera respeto entre los jugadores y juego limpio. 
                    El éxito depende de la rapidez, precisión y estrategia.</p>
              </div>

              <button onClick={toggleReglas}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}