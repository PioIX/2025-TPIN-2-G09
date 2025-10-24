"use client"

import { useEffect, useState, useRef } from "react"
import styles from "./Cut.module.css"
import clsx from "clsx"

//SECCIÓN DE CORTAR
export default function Cut({pizzaImage, pizzaFilter, onGoToDeliver}){
    const [cursorStyle, setCursorStyle] = useState(false)
    const [visibleKnife, setVisibleKnife] = useState(true)
    const [showDoneButton, setShowDoneButton] = useState(false)
    const canvasRef = useRef(null)
    const containerRef = useRef(null)

    const knifeCursor = () => {
        setCursorStyle(true)
        setVisibleKnife(false)
        setShowDoneButton(true)
    }

    const resetCursor = () => {
        setCursorStyle(false)
        setVisibleKnife(false)
        setShowDoneButton(false)
    }

    const handleGoToDeliver = () => {
        try{
            if(onGoToDeliver) {
                onGoToDeliver();
            } else {
                console.error("onGoToDeliver no está definida");
            }
        } catch(error){
            console.error("Error al cambiar de página: ", error);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current 
        if (!canvas || !container) return
        const ctx = canvas.getContext('2d')

        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect()
            const extraSize = 80
            canvas.width = rect.width + (extraSize * 2)
            canvas.height = rect.height + (extraSize * 2)
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        const handleMouseMove = (e) => {
            if (!cursorStyle) return

            const rect = canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const centerX = canvas.width / 2
            const centerY = canvas.height / 2

            const angle = Math.atan2(mouseY - centerY, mouseX - centerX)

            const maxLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2)

            const endX = centerX + Math.cos(angle) * maxLength
            const endY = centerY + Math.sin(angle) * maxLength
            const startX = centerX - Math.cos(angle) * maxLength
            const startY = centerY - Math.sin(angle) * maxLength

            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 3
            ctx.stroke()
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('resize', resizeCanvas)
        }
    }, [cursorStyle])

    return(
        <>
            <div className={clsx(styles.container, {[styles.cursorKnife]: cursorStyle == true})}>
                <div className={styles.header}>
                    <div className={styles.percent}>
                
                    </div>
                    <div className={styles.order}>
                
                    </div>
                    <div className={styles.time}>

                    </div>
                </div>
                <div className={styles.table}>
                    <div className={styles.pizzaCanvas} ref={containerRef} style={{position: 'relative'}}>
                        <img 
                            className={pizzaImage} 
                            src={pizzaImage} 
                            style={{
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain', 
                                display: 'block',
                                filter: pizzaFilter || 'none'
                            }}
                        />
                        <canvas 
                            ref={canvasRef} 
                            style={{
                                position: 'absolute', 
                                top: '-80px', 
                                left: '-80px', 
                                width: 'calc(100% + 160px)', 
                                height: 'calc(100% + 160px)', 
                                pointerEvents: cursorStyle ? 'auto' : 'none'
                            }}
                        />
                    </div>
                    <button 
                        className={`${styles.knifeCursor} ${!visibleKnife ? styles.hidden : ''}`} 
                        onClick={knifeCursor} 
                        style={{ visibility: visibleKnife ? 'visible' : 'hidden'}}
                    >
                        <img className={styles.knife} src="/imagesElements/knife.png"/>
                    </button>
                    <button 
                        className={styles.doneButton} 
                        onClick={resetCursor} 
                        style={{ visibility: showDoneButton ? 'visible' : 'hidden'}}
                    >
                        Listo
                    </button>
                </div>
                <div className={styles.boxes}>
                    <img className={styles.box} src="/imagesElements/boxes.png"/>
                </div>
                <div className={styles.btns}>
                    <button className={styles.deliver} onClick={handleGoToDeliver}>Entregar</button>
                </div>
            </div>
        </>
    )
}