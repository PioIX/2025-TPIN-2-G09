"use client"

import styles from "./Deliver.module.css"
import {useRef, useEffect, useState } from "react";
import { useTimer } from './TimerContext';

export default function Deliver() {
    const { percentage } = useTimer();
    
    const [characterImage, setCharacterImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showBox, setShowBox] = useState(true);
    const [showThanks, setShowThanks] = useState(false);
    const customerName = localStorage.getItem('currentCustomerName');
    
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                if (customerName) {
                    setCharacterImage(`/imagesCustomers/${customerName}.png`);
                }
            } catch (error) {
                console.error('Error al cargar el customer:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [customerName]);

    const canvasRef = useRef(null);
    const [imagesLoaded, setImagesLoaded] = useState({
        background: false,
        character: false,
        box: false
    });
    const imagesRef = useRef({
        background: null,
        character: null,
        box: null
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
                console.error('Error cargando personaje');
                setImagesLoaded(prev => ({ ...prev, character: false }));
            };
            charImg.src = characterImage;
        }

        //Imagen de la caja
        const boxImg = new Image();
        boxImg.onload = () => {
            imagesRef.current.box = boxImg;
            setImagesLoaded(prev => ({ ...prev, box: true }));
        };
        boxImg.onerror = () => {
            console.error('Error cargando caja de pizza');
            setImagesLoaded(prev => ({ ...prev, box: false }));
        };
        boxImg.src = '/imagesElements/box.png';

        return () => {
            imagesRef.current.background = null;
            imagesRef.current.character = null;
            imagesRef.current.box = null;
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
            const charY = 91 * scaleY;
            const charWidth = 150 * scaleX;
            const charHeight = 280 * scaleY;
            
            ctx.drawImage(imagesRef.current.character, charX, charY, charWidth, charHeight);
        }

        // Dibujar la caja de pizza si está visible
        if (showBox && imagesRef.current.box && imagesLoaded.box) {
            const scaleX = window.innerWidth / 550;
            const scaleY = window.innerHeight / 400;
            
            const boxX = 210 * scaleX; // Posición X de la caja
            const boxY = 295 * scaleY; // Posición Y de la caja
            const boxWidth = 120 * scaleX; // Ancho de la caja
            const boxHeight = 120 * scaleY; // Alto de la caja
            
            ctx.drawImage(imagesRef.current.box, boxX, boxY, boxWidth, boxHeight);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        drawScene(ctx);
    }, [imagesLoaded, showBox]);

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
    }, [imagesLoaded, showBox]);

    const handleCanvasClick = (e) => {
        if (!showBox) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calcular las dimensiones y posición de la caja
        const scaleX = window.innerWidth / 550;
        const scaleY = window.innerHeight / 400;
        
        const boxX = 210 * scaleX;
        const boxY = 295 * scaleY;
        const boxWidth = 120 * scaleX;
        const boxHeight = 120 * scaleY;

        // Verificar si el click está dentro de la caja
        if (x >= boxX && x <= boxX + boxWidth && y >= boxY && y <= boxY + boxHeight) {
            setShowBox(false);
            setTimeout(() => {
                setShowThanks(true);
            }, 300);
        }
    };

    return (
        <div className={styles.orderContainer}>
            <div className={styles.header}>
                <div className={styles.percent}>
                    {percentage}%
                </div>
                <div className={styles.order}>
                
                </div>
                <div className={styles.time}>
                
                </div>
            </div>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                onClick={handleCanvasClick}
                style={{ cursor: showBox ? 'pointer' : 'default' }}
            />
            
            {showThanks && (
                <div className={styles.dialogContainer}>
                    <div className={styles.dialogBubble}>
                        <p className={styles.dialogText}>
                            ¡Gracias!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}