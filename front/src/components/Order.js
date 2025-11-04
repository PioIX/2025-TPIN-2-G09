"use client"

import { useRef, useEffect, useState } from 'react';
import styles from "./Order.module.css";
import { useTimer } from './TimerContext';

export default function Order({onGoToKitchen}) {
  const [orderText, setOrderText] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [characterImage, setCharacterImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false)
  const { percentage, startTimer } = useTimer();

 useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:4000/customersOrder`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al obtener el pedido');
        }
        const data = await response.json();
        setCustomerId(data.id_customer);
        setOrderText(data.orderText || '');
        setCustomerName(data.customerName || '');
        
        localStorage.setItem('currentCustomerName', data.customerName);
        localStorage.setItem('currentPizzaId', data.id_pizza);
        console.log('Order guardó:', data.customerName, 'Pizza ID:', data.id_pizza);
        
        if (data.customerName) {
          setCharacterImage(`/imagesCustomers/${data.customerName}.png`);
        }
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
        setOrderText('No se pudo cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

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

    const charImg = new Image();
    charImg.onload = () => {
      imagesRef.current.character = charImg;
      setImagesLoaded(prev => ({ ...prev, character: true }));
    };
    charImg.onerror = () => {
      setImagesLoaded(prev => ({ ...prev, character: false }));
    };
    charImg.src = characterImage;

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
      try{
      //INICIAR EL TIMER AL PRESIONAR OK
      startTimer();
      if(onGoToKitchen) {
        onGoToKitchen();
      } else {
        console.error("onGoToKitchen no está definida");
      }
    } catch(error){
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
        <div className={styles.order}></div>
        <div className={styles.time}></div>
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