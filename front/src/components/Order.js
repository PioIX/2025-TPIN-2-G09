"use client"

import { useRef, useEffect, useState } from 'react';
import styles from "./Order.module.css";

export default function Order({ 
  characterImage = '/imagesCustomers/Personaje1.png',
  onOkClick,
  orderId
}) {
  const [orderText, setOrderText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  // Función para obtener el pedido desde la base de datos
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/customersOrder?id=${orderId}`);
        const data = await response.json();
        setOrderText(data.orderText || '');
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
        setOrderText('Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

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
    characterY: 400,
    targetY: 91,
    isAnimating: true,
    animationSpeed: 2,
    hasFinished: false
  });

  useEffect(() => {
    const bgImg = document.createElement('img');
    bgImg.onload = () => {
      imagesRef.current.background = bgImg;
      setImagesLoaded(prev => ({ ...prev, background: true }));
    };
    bgImg.src = '/imagesFondos/FondoPizzeria.png';

    const charImg = document.createElement('img');
    charImg.onload = () => {
      imagesRef.current.character = charImg;
      setImagesLoaded(prev => ({ ...prev, character: true }));
    };
    charImg.src = characterImage;
  }, [characterImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    const animate = () => {
      if (animationRef.current.isAnimating) {
        if (animationRef.current.characterY > animationRef.current.targetY) {
          animationRef.current.characterY -= animationRef.current.animationSpeed;
          
          if (animationRef.current.characterY <= animationRef.current.targetY) {
            animationRef.current.characterY = animationRef.current.targetY;
            animationRef.current.isAnimating = false;
            animationRef.current.hasFinished = true;
            
            // Mostrar diálogo inmediatamente cuando termine la animación
            if (!loading && orderText) {
              setShowDialog(true);
            }
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
  }, [imagesLoaded, loading, orderText]);

  // Si el pedido se carga después de que terminó la animación, mostrar el diálogo
  useEffect(() => {
    if (animationRef.current.hasFinished && !loading && orderText && !showDialog) {
      setShowDialog(true);
    }
  }, [loading, orderText, showDialog]);

  const drawScene = (ctx) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (imagesRef.current.background && imagesLoaded.background) {
      ctx.drawImage(imagesRef.current.background, 0, 0, window.innerWidth, window.innerHeight);
    }

    if (imagesRef.current.character && imagesLoaded.character) {
      const scaleX = window.innerWidth / 550;
      const scaleY = window.innerHeight / 400;
      
      const charX = 50 * scaleX;
      const charY = animationRef.current.characterY * scaleY;
      const charWidth = 150 * scaleX;
      const charHeight = 280 * scaleY;
      
      ctx.drawImage(imagesRef.current.character, charX, charY, charWidth, charHeight);
    }
  };

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

  const handleOkClick = () => {
    if (onOkClick) {
      onOkClick();
    } else {
      window.location.href = '/kitchen';
    }
  };

  return (
    <div className={styles.orderContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
      />
      
      {showDialog && !loading && (
        <div className={styles.dialogContainer}>
          <div className={styles.dialogBubble}>
            <p className={styles.dialogText}>
              {orderText}
            </p>
          </div>
          
          <button
            onClick={handleOkClick}
            className={styles.okButton}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}