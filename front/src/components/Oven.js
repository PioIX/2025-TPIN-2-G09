"use client"

import { useState, useRef, useEffect} from "react"
import styles from "./Kitchen.module.css"
import { useRouter } from "next/navigation"

export default function Kitchen(){
    const ingredientsBox = [
        {id:1, name:"Salsa", image:"/imagesIngredients/tomato.png", drawMode: "image", size: 100},
        {id:2, name:"Queso", image:"/imagesIngredients/cheese.png", drawMode: "image", size: 120},
        {id:3, name:"Pepperoni", image:"/imagesIngredients/pepperoni.png", drawMode: "click", size: 40},
        {id:4, name:"Champiñones", image:"/imagesIngredients/mushroom.png", drawMode: "click", size: 40},
        {id:5, name:"Aceituna", image:"/imagesIngredients/olive.png", drawMode: "click", size: 40},
        {id:6, name:"Albahaca", image:"/imagesIngredients/pepper.png", drawMode: "click", size: 50},
        {id:7, name:"Cebolla", image:"/imagesIngredients/onion.png", drawMode: "click", size: 60}
    ]

    const [visibleBuns, setVisibleBuns] = useState([true, true, true, true, true, true, true, true])
    const [activePizza, setActivePizza] = useState(false)
    const [paintingImage, setPaintingImage] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState(null)
    const [ovenOpen, setOvenOpen] = useState(false)
    const [pizzaInOven, setPizzaInOven] = useState(false)
    const router = useRouter()

    const canvasRef = useRef(null)
    const imageRef = useRef(null)
    const pizzaCenterRef = useRef({ x: 0, y: 0})
    const pizzaRadiusRef = useRef(200)

    useEffect(() => {
        if (selectedIngredient) {
            const img = new Image()
            img.onload = () => {
                imageRef.current = img
            }
            img.onerror = () => {
                console.error(`Error cargando imagen: ${selectedIngredient.image}`)
            }
            img.src = selectedIngredient.image
        }
    }, [selectedIngredient])

    useEffect(() => {
        if (activePizza && canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = 400
            canvas.height = 400
            pizzaCenterRef.current = { x: 200, y: 200 }
            pizzaRadiusRef.current = 200
        }
    }, [activePizza])

    const handleIngredientClick = (ingredient) => {
        console.log(`Ingrediente ${ingredient.name} clickeado`)
        setSelectedIngredient(ingredient)
        setPaintingImage(false)
    }

    const handleBunClick = (index) => {
        console.log(`Bollo ${index + 1} clickeado`)
        
        const newVisibleBuns = [...visibleBuns]
        newVisibleBuns[index] = false
        setVisibleBuns(newVisibleBuns)
        setActivePizza(true)
    }

    const isPointInCircle = (x, y, centerX, centerY, radius) => {
        const dx = x - centerX
        const dy = y - centerY
        return (dx * dx + dy * dy) <= (radius * radius)
    }

    const paintImage = (e, isDrawing) => {
        if (isDrawing === false) return
        
        const canvas = canvasRef.current
        if (!canvas || !imageRef.current) return

        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const size = selectedIngredient.size

        if (isPointInCircle(x, y, pizzaCenterRef.current.x, pizzaCenterRef.current.y, pizzaRadiusRef.current)) {
            ctx.drawImage(imageRef.current, x - size / 2, y - size / 2, size, size)
        }
    }

    const startPaintImage = (e) => {
        if (!selectedIngredient || !canvasRef.current) return

        if(selectedIngredient.drawMode === "click"){
            paintImageClick(e)
        } else if(selectedIngredient.drawMode === "image"){
            setPaintingImage(true)
            paintImage(e)
        }
    }

    const paintImageMove = (e) => {
        if (selectedIngredient?.drawMode === "image"){
            paintImage(e, paintingImage)
        }
    }

    const paintImageClick = (e) => {
        if (!selectedIngredient || !canvasRef.current || !imageRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const size = selectedIngredient.size

        if (isPointInCircle(x, y, pizzaCenterRef.current.x, pizzaCenterRef.current.y, pizzaRadiusRef.current)) {
            ctx.drawImage(imageRef.current, x - size / 2, y - size / 2, size, size)
        }
    }

    const finishPaintImage = () => {
        setPaintingImage(false)
    }

    const bakePage = () => {
        if (activePizza) {
            setPizzaInOven(true)
            setActivePizza(false)
            setOvenOpen(false)
            // Simular tiempo de cocción
            setTimeout(() => {
                alert("¡Pizza lista!")
                setPizzaInOven(false)
                setOvenOpen(true)
            }, 5000)
        }
    }

    const deliverPage = () => {
        router.push('/')
    }

    const toggleOven = () => {
        setOvenOpen(!ovenOpen)
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.percent}></div>
                    <div className={styles.order}></div>
                    <div className={styles.time}></div>
                </div>
                <div className={styles.ingredientsBox}>
                    {ingredientsBox.map((ingredientBox) => (
                        <button key={ingredientBox.id} className={styles.ingredientBtn} onClick={() => handleIngredientClick(ingredientBox)} title={ingredientBox.name}>
                            <img src={ingredientBox.image} alt={ingredientBox.name}></img>
                        </button>
                    ))}
                </div>
                <div className={styles.mainArea}>
                    <div className={styles.bunsContainer}>
                        {[...Array(8)].map((_, index) => (
                            <button key={index} className={`${styles.bunBtn} ${!visibleBuns[index] ? styles.hidden : ''}`} onClick={() => handleBunClick(index)} style={{ visibility: visibleBuns[index] ? 'visible' : 'hidden'}}></button>
                        ))}
                    </div>
                    <div className={styles.pizza}>
                        {activePizza && (
                            <>
                                <img src="/imagesIngredients/pizzaBun.png" className={styles.pizzaImage}></img>
                                <canvas ref={canvasRef} className={styles.pizzaCanvas} onMouseDown={startPaintImage} onMouseMove={paintImageMove} onMouseUp={finishPaintImage} onMouseLeave={finishPaintImage}></canvas>
                            </>
                        )}
                    </div>
                    
                    {/* Componente del horno integrado */}
                    <div className={styles.ovenContainer}>
                        <div className={styles.oven}>
                            {/* Puerta del horno */}
                            <div 
                                className={`${styles.ovenDoor} ${ovenOpen ? styles.open : ''}`}
                                onClick={toggleOven}
                            >
                                <img 
                                    src="/imagesIngredients/Horno.png" 
                                    alt="Horno" 
                                    className={styles.ovenImage}
                                />
                                {/* Ventana del horno */}
                                <div className={styles.ovenWindow}>
                                    {pizzaInOven && <div className={styles.pizzaInside}></div>}
                                </div>
                            </div>
                            
                            {/* Indicador de temperatura/cocción */}
                            {pizzaInOven && !ovenOpen && (
                                <div className={styles.cookingIndicator}>
                                    <div className={styles.flame}></div>
                                    <span>Cocinando...</span>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            className={styles.toggleBtn}
                            onClick={toggleOven}
                        >
                            {ovenOpen ? "Cerrar Horno" : "Abrir Horno"}
                        </button>
                    </div>
                    
                    <div className={styles.btns}>
                        <button className={styles.bake} onClick={bakePage}>Hornear</button>
                        <button className={styles.deliver} onClick={deliverPage}>Entregar</button>
                    </div>
                </div>
            </div>
        </>
    )
}