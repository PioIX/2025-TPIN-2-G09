"use client"

import { useEffect, useState, useRef } from "react"
import styles from "./Cut.module.css"
import clsx from "clsx"

//SECCIÓN DE CORTAR
export default function Cut({ pizzaImage, pizzaFilter, onGoToDeliver }) {
    const [cursorStyle, setCursorStyle] = useState(false)
    const [visibleKnife, setVisibleKnife] = useState(true)
    const [showDoneButton, setShowDoneButton] = useState(false)
    const [pizzaClicked, setPizzaClicked] = useState(false)
    const [savedLines, setSavedLines] = useState([])
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
        try {
            if (onGoToDeliver) {
                onGoToDeliver();
            } else {
                console.error("onGoToDeliver no está definida");
            }
        } catch (error) {
            console.error("Error al cambiar de página: ", error);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        savedLines.forEach(line => {
            ctx.beginPath()
            ctx.moveTo(line.startX, line.startY)
            ctx.lineTo(line.endX, line.endY)
            ctx.strokeStyle = '#c29b61'
            ctx.lineWidth = 3
            ctx.stroke()
        })
    }, [savedLines])

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return
        const ctx = canvas.getContext('2d')

        const resizeCanvas = () => {
            const rect = container.getBoundingClientRect()  //esto obtiene las dimensiones y posición del contenedor
            const extraSize = 80
            canvas.width = rect.width + (extraSize * 2)
            canvas.height = rect.height + (extraSize * 2)

            savedLines.forEach(line => {
                ctx.beginPath()
                ctx.moveTo(line.startX, line.startY)
                ctx.lineTo(line.endX, line.endY)
                ctx.strokeStyle = '#c29b61'
                ctx.lineWidth = 3
                ctx.stroke()
            })
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas) //cambios en el tamaño de la pantalla para reajustar

        const handleMouseMove = (e) => {
            if (!cursorStyle) return
            //obtener la posición del mouse
            //el e.clientX y e.clientY es para la posición del mouse en toda la pantalla
            //el rect.left y rect.top es para la posición del canvas en la pantalla

            if (!pizzaClicked) {
                const rect = canvas.getBoundingClientRect()
                const mouseX = e.clientX - rect.left
                const mouseY = e.clientY - rect.top

                ctx.clearRect(0, 0, canvas.width, canvas.height)
                //para calcular el centro y que quede el punto fijo

                savedLines.forEach(line => {
                    ctx.beginPath()
                    ctx.moveTo(line.startX, line.startY)
                    ctx.lineTo(line.endX, line.endY)
                    ctx.strokeStyle = '#c29b61'
                    ctx.lineWidth = 3
                    ctx.stroke()
                })

                const centerX = canvas.width / 2
                const centerY = canvas.height / 2

                const angle = Math.atan2(mouseY - centerY, mouseX - centerX) //calcula el ángulo en radianes desde el origen hasta el punto x y

                //calcula la distancia más larga posible en el canvas
                //.sqrt es para raíz cuadrada
                const maxLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2)

                const endX = centerX + Math.cos(angle) * maxLength //cos es para lo horizontal
                const endY = centerY + Math.sin(angle) * maxLength //sin es para lo vertical
                const startX = centerX - Math.cos(angle) * maxLength //estas dos partes (start) crean el otro lado de la línea
                const startY = centerY - Math.sin(angle) * maxLength

                ctx.beginPath() //para iniciar un nuevo trazo
                ctx.moveTo(startX, startY)
                ctx.lineTo(endX, endY)
                ctx.strokeStyle = 'black'
                ctx.lineWidth = 3
                ctx.stroke() //ejecuta el dibujo
            }
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('resize', resizeCanvas)
        }
    }, [cursorStyle, savedLines])

    function handlePizzaClick(e) {
        if(!cursorStyle) return
    
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        const angle = Math.atan2(mouseY - centerY, mouseX - centerX)

        const maxLength = Math.sqrt(canvas.width*25 + canvas.height*25)

        const endX = (centerX + Math.cos(angle) * maxLength)
        const endY = centerY + Math.sin(angle) * maxLength
        const startX = centerX - Math.cos(angle) * maxLength
        const startY = centerY - Math.sin(angle) * maxLength

        ctx.beginPath() //para iniciar un nuevo trazo
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = '#c29b61'
        ctx.lineWidth = 3
        ctx.stroke()

        setSavedLines(prev => [...prev, {
            startX,
            startY,
            endX,
            endY
        }])
        
        console.log("Línea guardada en posición:", { startX, startY, endX, endY })
        console.log("Total de líneas:", savedLines.length + 1)
    }

    return (
        <>
            <div className={clsx(styles.container, { [styles.cursorKnife]: cursorStyle == true })}>
                <div className={styles.header}>
                    <div className={styles.percent}>

                    </div>
                    <div className={styles.order}>

                    </div>
                    <div className={styles.time}>

                    </div>
                </div>
                <div className={styles.table}>
                    <div className={styles.pizzaCanvas} ref={containerRef} style={{ position: 'relative' }} onClick={handlePizzaClick}>
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
                        style={{ visibility: visibleKnife ? 'visible' : 'hidden' }}
                    >
                        <img className={styles.knife} src="/imagesElements/knife.png" />
                    </button>
                    <button
                        className={styles.doneButton}
                        onClick={resetCursor}
                        style={{ visibility: showDoneButton ? 'visible' : 'hidden' }}
                    >
                        Listo
                    </button>
                </div>
                <div className={styles.boxes}>
                    <img className={styles.box} src="/imagesElements/boxes.png" />
                </div>
                <div className={styles.btns}>
                    <button className={styles.deliver} onClick={handleGoToDeliver}>Entregar</button>
                </div>
            </div>
        </>
    )
}