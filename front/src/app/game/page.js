"use client"

import { useEffect, useRef, useState } from 'react'

export default function PizzaGame() {
  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState({
    background: false,
    character: false,
    kitchen: false
  });
  const imagesRef = useRef({
    background: null,
    character: null,
    kitchen: null
  });
  const [showKitchen, setShowKitchen] = useState(false);
  const animationRef = useRef({
    characterY: 400,
    targetY: 91,
    isAnimating: true,
    animationSpeed: 5,
    showBubble: false
  });
  const buttonRef = useRef({
    x: 0,
    y: 0,
    width: 180,
    height: 45,
    hover: false
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
    charImg.src = '/imagesCustomers/Personaje1.png';

    const kitchenImg = document.createElement('img');
    kitchenImg.onload = () => {
      imagesRef.current.kitchen = kitchenImg;
      setImagesLoaded(prev => ({ ...prev, kitchen: true }));
    };
    kitchenImg.src = '/imagesFondos/FondoCocina.png';
  }, []);

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
            
            setTimeout(() => {
              animationRef.current.showBubble = true;
            }, 300);
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
  }, [imagesLoaded, showKitchen]);

  const drawBubble = (ctx) => {
    const x = window.innerWidth * 0.3;
    const y = window.innerHeight * 0.25;
    const width = 450;
    const height = 120;

    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;

    ctx.fillStyle = '#FFE5E5';
    ctx.strokeStyle = '#FF9999';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 18);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 40, y + height);
    ctx.lineTo(x + 50, y + height + 15);
    ctx.lineTo(x + 60, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#333';
    ctx.font = '17px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pedido', x + width/2, y + 30);

    return { x, y, width, height };
  };

  const drawButton = (ctx, bubbleInfo) => {
    const btn = buttonRef.current;
    btn.x = bubbleInfo.x + bubbleInfo.width/2 - btn.width/2;
    btn.y = bubbleInfo.y + bubbleInfo.height + 25;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = btn.hover ? '#ffdadaff' : '#FF6B6B';
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 10);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ok', btn.x + btn.width/2, btn.y + btn.height/2 + 5);
  };

  const drawScene = (ctx) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (showKitchen) {
      if (imagesRef.current.kitchen && imagesLoaded.kitchen) {
        ctx.drawImage(imagesRef.current.kitchen, 0, 0, window.innerWidth, window.innerHeight);
      }
    } else {
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

      if (animationRef.current.showBubble) {
        const bubbleInfo = drawBubble(ctx);
        drawButton(ctx, bubbleInfo);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e) => {
      if (showKitchen) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const btn = buttonRef.current;
      
      const wasHover = btn.hover;
      btn.hover = x >= btn.x && x <= btn.x + btn.width && 
                  y >= btn.y && y <= btn.y + btn.height;
      
      if (wasHover !== btn.hover) {
        canvas.style.cursor = btn.hover ? 'pointer' : 'default';
      }
    };

    const handleClick = (e) => {
      if (showKitchen) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const btn = buttonRef.current;
      
      if (x >= btn.x && x <= btn.x + btn.width && 
          y >= btn.y && y <= btn.y + btn.height) {
        setShowKitchen(true);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [showKitchen]);

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
  }, [imagesLoaded, showKitchen]);

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