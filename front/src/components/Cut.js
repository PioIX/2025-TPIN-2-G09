"use client"

import { useEffect, useState, useRef } from "react"
import styles from "./Cut.module.css"
import clsx from "clsx"
import { useTimer } from './TimerContext'
import { useScore } from './ScoreContext'
import { useMoney } from './MoneyContext'

//SECCIÓN DE CORTAR
export default function Cut({ pizzaImage, pizzaFilter, onGoToDeliver, orderText }) {
    const { percentage, stopTimer } = useTimer();
    const { updateStageScore } = useScore()
    const [cursorStyle, setCursorStyle] = useState(false)
    const [visibleKnife, setVisibleKnife] = useState(true)
    const [showDoneButton, setShowDoneButton] = useState(false)
    const [pizzaClicked, setPizzaClicked] = useState(false)
    const [savedLines, setSavedLines] = useState([])
    const [isSliding, setIsSliding] = useState(false)
    const [hidePizza, setHidePizza] = useState(true)
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const { money } = useMoney()

    const idealLines = [
        { angle: 0 },
        { angle: Math.PI / 4 }, //45°
        { angle: Math.PI / 2 }, //90°
        { angle: 3 * Math.PI / 4 } //135°
    ]

    const knifeCursor = () => {
        setCursorStyle(true)
        setVisibleKnife(false)
        setShowDoneButton(true)
    }

    const calculateLineAngle = (startX, startY, endX, endY) => {
        let angle = Math.atan2(endY - startY, endX - startX)
        angle = angle % Math.PI
        if (angle < 0) angle += Math.PI
        return angle
    }

    const findClosestIdealAngle = (lineAngle, usedAngles) => {
        let minDiff = Infinity
        let closestIndex = -1

        idealLines.forEach((ideal, index) => {
            if (!usedAngles.has(index)) {
                let diff = Math.abs(lineAngle - ideal.angle)
                let diffOpposite = Math.abs(lineAngle - (ideal.angle + Math.PI))
                diff = Math.min(diff, diffOpposite)

                if (diff < minDiff) {
                    minDiff = diff
                    closestIndex = index
                }
            }
        })

        return { index: closestIndex, diff: minDiff }
    }

    const validateCuts = () => {
        if (savedLines.length === 0) {
            return {
                isValid: false,
                score: 0,
                message: 'No se realizaron cortes'
            }
        }

        let score = 100
        const usedIdealAngles = new Set()
        const maxPointsPerLine = 100 / Math.max(savedLines.length, idealLines.length)
        const errors = []

        savedLines.forEach((line, index) => {
            const canvas = canvasRef.current
            if (!canvas) return

            const centerX = canvas.width / 2
            const centerY = canvas.height / 2

            // para calcular el ángulo de la línea cortada
            const lineAngle = calculateLineAngle(
                line.startX - centerX,
                line.startY - centerY,
                line.endX - centerX,
                line.endY - centerY
            )

            // para encontrar el ángulo ideal más cercano
            const { index: idealIndex, diff } = findClosestIdealAngle(lineAngle, usedIdealAngles)

            if (idealIndex !== -1) {
                usedIdealAngles.add(idealIndex)

                let scorePercentage
                if (diff <= 0.1) {
                    scorePercentage = 1.0
                } else if (diff <= 0.3) {
                    scorePercentage = 0.7 + (0.3 * (0.3 - diff) / 0.2)
                } else if (diff <= 0.5) {
                    scorePercentage = 0.3 + (0.4 * (0.5 - diff) / 0.2)
                } else {
                    scorePercentage = Math.max(0, 0.3 * (0.8 - diff) / 0.3)
                }

                const lineScore = maxPointsPerLine * scorePercentage
                score = Math.min(score, score - (maxPointsPerLine - lineScore))

                const degrees = (diff * 180 / Math.PI).toFixed(1)
                if (diff > 0.3) {
                    errors.push(`Corte ${index + 1}: desviación de ${degrees}°`)
                }
            }
        })

        if (savedLines.length < idealLines.length) {
            const missingLines = idealLines.length - savedLines.length
            score -= missingLines * 15
            errors.push(`Faltan ${missingLines} corte(s)`)
        } else if (savedLines.length > idealLines.length) {
            const extraLines = savedLines.length - idealLines.length
            score -= extraLines * 10
            errors.push(`${extraLines} corte(s) de más`)
        }

        score = Math.max(0, Math.round(score))

        return {
            isValid: errors.length === 0,
            score: score,
            errors: errors,
            totalCuts: savedLines.length,
            expectedCuts: idealLines.length,
            message: errors.length === 0
                ? '¡Cortes perfectos!'
                : `Cortes con errores: ${errors.join(', ')}`
        }
    }

    const resetCursor = () => {
        setShowDoneButton(false)
        setCursorStyle(false)
        setHidePizza(false)

        stopTimer(); //Detiene el temporizador al apretar el boton verde Listo!!!!
        
        // Limpiar el canvas y las líneas guardadas
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
        setSavedLines([]) // Limpia todas las líneas guardadas


        const validation = validateCuts()
        console.log('Resultado de validación de cortes:', validation)
        console.log('Líneas guardadas:', savedLines)

        updateStageScore('cut', validation.score, validation)

        setTimeout(() => {
            setIsSliding(false)
            setCursorStyle(false)
            setVisibleKnife(false)
            setShowDoneButton(false)
        }, 1200) // es la duracion de la animación
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
        if (!cursorStyle) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        const angle = Math.atan2(mouseY - centerY, mouseX - centerX)

        const maxLength = Math.sqrt(canvas.width * 25 + canvas.height * 25)

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
                        {percentage}%

                    </div>
                    <div className={styles.order}>
                        {orderText || ''}
                    </div>
                    <div className={styles.money}>${money}</div>
                </div>
                <div className={styles.table}>
                    <div className={clsx(styles.pizzaCanvas, { [styles.slideOut]: isSliding })}
                        ref={containerRef} style={{ position: 'relative' }} onClick={handlePizzaClick}>
                        <img
                            className={pizzaImage}
                            src={pizzaImage}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                display: hidePizza ? 'block' : 'none',
                                filter: pizzaFilter || 'none',
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
                                pointerEvents: cursorStyle ? 'auto' : 'none',
                                display: showDoneButton ? 'block' : 'none'
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
                    <img className={styles.box} src={!hidePizza ? "/imagesElements/boxClose.jpeg" : "/imagesElements/boxes.png"} />
                    <button className={styles.deliver} onClick={handleGoToDeliver}>Entregar</button>
                </div>
            </div>
        </>
    )
}