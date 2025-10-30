"use client"

import styles from "./Deliver.module.css"
import {useRef, useEffect, useState } from "react";
import { useTimer } from './TimerContext';

export default function Deliver() {
    const { percentage } = useTimer();
    
    localStorage.getItem('currentCustomerName');
    const [characterImage, setCharacterImage] = useState('');
    const [loading, setLoading] = useState(true);
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
            const charY = 91 * scaleY; // Posición final directa
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
        
        drawScene(ctx);
    }, [imagesLoaded]);

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
            />
        </div>
    );
}