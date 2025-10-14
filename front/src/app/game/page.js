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

    useEffect(() => {
        const img = new Image()
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="30" height="30"%3E%3Ccircle cx="15" cy="15" r="10" fill="red"/%3E%3C/svg%3E'
        imageRef.current = img
    }, [])

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
        </>
    );
}