"use client"

import { useRef, useEffect, useState } from 'react';
import styles from "./Order.module.css";
import { useTimer } from '../contexts/TimerContext';
import { useMoney } from '../contexts/MoneyContext'
import { Socket } from 'engine.io-client';
import { useSocket } from '@/hooks/useSocket';

export default function Order({ customer, onGoToKitchen }) {
  const [orderText, setOrderText] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [characterImage, setCharacterImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showOrderInHeader, setShowOrderInHeader] = useState(false);
  const { percentage, startTimer } = useTimer();
  const { money } = useMoney()
  const {socket} = useSocket()

  useEffect(() => {
    if (customer) {
      console.log("Customer recibido en Order:", customer);
      
      setCustomerId(customer.id_customer);
      setOrderText(customer.text || '');
      setCustomerName(customer.name || '');
      
      localStorage.setItem('currentCustomerName', customer.name);
      localStorage.setItem('currentPizzaId', customer.id_pizza);
      localStorage.setItem('currentOrderText', customer.text || ''); // Guardar la orden
      console.log('Order guardó:', customer.name, 'Pizza ID:', customer.id_pizza);
      
      if (customer.name) {
        setCharacterImage(`/imagesCustomers/${customer.name}.png`);
      }
      
      setLoading(false);
    }
  }, [customer]);

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
    const bgImg = new Image();
    bgImg.onload = () => {
      imagesRef.current.background = bgImg;
      setImagesLoaded(prev => ({ ...prev, background: true }));
    };
    bgImg.onerror = () => {
      console.error('Error cargando fondo');
      setImagesLoaded(prev => ({ ...prev, background: false }));
    };
    bgImg.src = '/imagesFondos/FondoPizzeria.png';

    if (characterImage) {
      const charImg = new Image();
      charImg.onload = () => {
        imagesRef.current.character = charImg;
        setImagesLoaded(prev => ({ ...prev, character: true }));
      };
      charImg.onerror = () => {
        console.error('Error cargando personaje:', characterImage);
        setImagesLoaded(prev => ({ ...prev, character: false }));
      };
      charImg.src = characterImage;
    }

    return () => {
      imagesRef.current.background = null;
      imagesRef.current.character = null;
    };
  }, [characterImage]);

  const drawScene = (ctx) => {
    if (!ctx) return;

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const animate = () => {
      if (animationRef.current.isAnimating) {
        if (animationRef.current.characterY > animationRef.current.targetY) {
          animationRef.current.characterY -= animationRef.current.animationSpeed;

          if (animationRef.current.characterY <= animationRef.current.targetY) {
            animationRef.current.characterY = animationRef.current.targetY;
            animationRef.current.isAnimating = false;
            animationRef.current.hasFinished = true;

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

  useEffect(() => {
    if (animationRef.current.hasFinished && !loading && orderText && !showDialog) {
      setShowDialog(true);
    }
  }, [loading, orderText, showDialog]);

  const handleGoToKitchen = () => {
    try {
      socket.emit("pingall", { message: "Nueva orden enviada a cocina." });
      //Mostrar la orden en el header antes de ir a la cocina
      setShowOrderInHeader(true);
      //INICIAR EL TIMER AL PRESIONAR OK
      startTimer();
      if (onGoToKitchen) {
        onGoToKitchen(orderText); // Pasar el orderText al componente padre
      } else {
        console.error("onGoToKitchen no está definida");
      }
    } catch (error) {
      console.error("Error al guardar la pizza: ", error);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawScene(ctx);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded]);

  return (
    <div className={styles.orderContainer}>
      <div className={styles.header}>
        <div className={styles.percent}>{percentage}%</div>
        <div className={styles.money}>${money}</div>
      </div>
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

          <div className={styles.btns}>
            <button className={styles.bake} onClick={handleGoToKitchen}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}