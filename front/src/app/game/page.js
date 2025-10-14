"use client"

import { useEffect, useRef, useState } from 'react'

export default function PizzaGame() {
  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState({
    background: false,
    character: false
  });
  const imagesRef = useRef({
    background: null,
    character: null
  });
  const animationRef = useRef({
    characterY: 400, // Empieza fuera de la pantalla (abajo)
    targetY: 91,     // Posición final
    isAnimating: true,
    animationSpeed: 3 // Velocidad de la animación
  });

  useEffect(() => {
    // Cargar imagen de fondo
    const bgImg = document.createElement('img');
    bgImg.onload = () => {
      imagesRef.current.background = bgImg;
      setImagesLoaded(prev => ({ ...prev, background: true }));
    };
    bgImg.src = '/imagesFondos/FondoPizzeria.png';

    // Cargar imagen del personaje
    const charImg = document.createElement('img');
    charImg.onload = () => {
      imagesRef.current.character = charImg;
      setImagesLoaded(prev => ({ ...prev, character: true }));
    };
    charImg.src = '/imagesCustomers/Personaje1.png';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Loop de animación
    let animationFrameId;
    const animate = () => {
      // Actualizar posición del personaje si está animando
      if (animationRef.current.isAnimating) {
        if (animationRef.current.characterY > animationRef.current.targetY) {
          animationRef.current.characterY -= animationRef.current.animationSpeed;
          
          // Detener la animación cuando llegue a la posición final
          if (animationRef.current.characterY <= animationRef.current.targetY) {
            animationRef.current.characterY = animationRef.current.targetY;
            animationRef.current.isAnimating = false;
          }
        }
      }
      
      drawScene(ctx);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [imagesLoaded]);

  const drawScene = (ctx) => {
    // Limpiar canvas
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Dibujar fondo
    if (imagesRef.current.background && imagesLoaded.background) {
      ctx.drawImage(imagesRef.current.background, 0, 0, window.innerWidth, window.innerHeight);
    }

    // Dibujar personaje
    if (imagesRef.current.character && imagesLoaded.character) {
      // Calcular proporciones para que el personaje mantenga su tamaño relativo
      const scaleX = window.innerWidth / 550;
      const scaleY = window.innerHeight / 400;
      
      const charX = 50 * scaleX;
      const charY = animationRef.current.characterY * scaleY; // Usa la posición animada
      const charWidth = 150 * scaleX;
      const charHeight = 280 * scaleY;
      
      ctx.drawImage(imagesRef.current.character, charX, charY, charWidth, charHeight);
    }
  };

  // Redibujar cuando cambie el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        drawScene(ctx);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded]);

  return (
    <div style={{ 
      margin: 0,
      padding: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
}