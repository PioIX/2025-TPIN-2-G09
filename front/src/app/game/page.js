"use client"

import { useRef, useState } from "react";
import { useEffect } from "react";

export default function Game(){
    const canvasRef = useRef(null);
    const canvasImageRef = useRef(null);
    const canvasClickRef = useRef(null);
    const [painting, setPainting] = useState(false)
    const [paintingImage, setPaintingImage] = useState(false)
    const imageRef = useRef(null)
    
     // Estados y refs del juego de pizza
    const pizzaCanvasRef = useRef(null);
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

    //Cargar imagen para dibujo
    useEffect(() => {
        const img = new Image()
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="30" height="30"%3E%3Ccircle cx="15" cy="15" r="10" fill="red"/%3E%3C/svg%3E'
        imageRef.current = img
    }, [])
  
    //Cargar imágenes del juego de pizza
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

    //Pintar con línea
    const startPaint = (e) => {
        setPainting(true)
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect()

        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    }

    const paint = (e) => {
        if(!painting) return;
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect()

        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.stroke()
    }

    const finishPaint = () => {
        setPainting(false)
    }
    
    //Pintar con imagen
    const startPaintImage = (e) => {
        setPaintingImage(true)
        paintImage(e)
    }

    const paintI = (e) => {
        if(!paintingImage) return;
        paintImage(e)
    }
    
    const paintImage = (e) => {
        const canvas = canvasImageRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (imageRef.current) {
            ctx.drawImage(imageRef.current, x - 15, y - 15, 30, 30);
        }
    }

    const finishPaintImage = () => {
        setPaintingImage(false)
    }

    //Pintar con imagen, un solo click
    const clickImage = (e) => {
        const canvas = canvasClickRef.current
        if(!canvas) return;
        const ctx = canvas.getContext('2d')
         const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (imageRef.current) {
            ctx.drawImage(imageRef.current, x - 15, y - 15, 30, 30);
        }
    }
    
    // Funciones del juego de pizza
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

    // Animación del juego de pizza
    useEffect(() => {
        const canvas = pizzaCanvasRef.current;
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

    // Event listeners del juego de pizza
    useEffect(() => {
        const canvas = pizzaCanvasRef.current;
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

    // Resize handler del juego de pizza
    useEffect(() => {
        const handleResize = () => {
            const canvas = pizzaCanvasRef.current;
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
        <>
            <div>
                <h1>Dibuja con el Mouse</h1>
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    onMouseDown={startPaint}
                    onMouseMove={paint}
                    onMouseUp={finishPaint}
                    onMouseLeave={finishPaint}
                    style={{ border: '1px solid black', cursor: 'crosshair' }}
                />
            </div>
            <div>
                <h1>Dibuja una imagen con el Mouse</h1>
                <canvas
                    ref={canvasImageRef}
                    width={600}
                    height={400}
                    onMouseDown={startPaintImage}
                    onMouseMove={paintI}
                    onMouseUp={finishPaintImage}
                    onMouseLeave={finishPaintImage}
                    style={{ border: '1px solid black', cursor: 'crosshair' }}
                />
            </div>
            <div>
                <h1>Coloca imágenes con click</h1>
                <canvas
                    ref={canvasClickRef}
                    width={600}
                    height={400}
                    onClick={clickImage}
                    style={{ border: '1px solid black', cursor: 'crosshair' }}
                />
            </div>
            <div style={{ 
                margin: 0,
                padding: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden'
            }}>
                <canvas
                    ref={pizzaCanvasRef}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        margin: 0,
                        padding: 0
                    }}
                />
            </div>
        </>
    );
}