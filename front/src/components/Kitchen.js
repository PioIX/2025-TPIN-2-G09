"use client"

import { useState, useRef, useEffect} from "react"
import styles from "./Kitchen.module.css"
import { useRouter } from "next/navigation"
import { useTimer } from "./TimerContext"

//SECCIÓN DE LA COCINA
export default function Kitchen({onGoToOven}) {
    const { percentage, formatTime } = useTimer();
    const ingredientsBox = [
        {id:1, name:"Salsa", image:"/imagesIngredients/tomato.png", drawMode: "image", size: 160},
        {id:2, name:"Queso", image:"/imagesIngredients/cheese.png", drawMode: "image", size: 140},
        {id:3, name:"Pepperoni", image:"/imagesIngredients/pepperoni.png", drawMode: "click", size: 50},
        {id:4, name:"Champiñones", image:"/imagesIngredients/mushroom.png", drawMode: "click", size: 50},
        {id:5, name:"Aceituna", image:"/imagesIngredients/olive.png", drawMode: "click", size: 50},
        {id:6, name:"Albahaca", image:"/imagesIngredients/pepper.png", drawMode: "click", size: 70},
        {id:7, name:"Cebolla", image:"/imagesIngredients/onion.png", drawMode: "click", size: 80}
    ]

    const [visibleBuns, setVisibleBuns] = useState([true, true, true, true, true, true, true, true])
    const [activePizza, setActivePizza] = useState(false)
    const [paintingImage, setPaintingImage] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState(null)
    const [savedPizzaImage, setSavedPizzaImage] = useState(null)
    const router = useRouter()

    const canvasRef = useRef(null)
    const imageRef = useRef(null)
    const pizzaBunImageRef = useRef(null)
    const pizzaCenterRef = useRef({ x: 0, y: 0})
    const pizzaRadiusRef = useRef(200)

    //Poner imagen al seleccionar ingrediente
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


    //Configurar canva cuando aparece la pizza
    useEffect(() => {
        if (activePizza && canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = 500
            canvas.height = 500
            pizzaCenterRef.current = { x: 250, y: 250 }
            pizzaRadiusRef.current = 250

            const pizzaBunImg = new Image()
            pizzaBunImg.onload = () => {
                pizzaBunImageRef.current = pizzaBunImg
                const ctx=canvas.getContext('2d')
                ctx.drawImage(pizzaBunImg, 0, 0, canvas.width, canvas.height)
            }
            pizzaBunImg.src = "/imagesIngredients/pizzaBun.png"
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

    const handleGoToOven = () => {
        const canvas = canvasRef.current;
        if(!canvas) {
            console.log("No hay canvas");
            return;
        }

        try{
            const pngData = canvas.toDataURL('image/png');
            setSavedPizzaImage(pngData);
            console.log("Pizza guardada exitosamente");
            console.log("Llamando a onGoToOven con la imagen");

            // Llamar a la función del padre para cambiar a Oven
            if(onGoToOven) {
                onGoToOven(pngData);
            } else {
                console.error("onGoToOven no está definida");
            }
        } catch(error){
            console.error("Error al guardar la pizza: ", error);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.percent}>
                        {percentage}%
                
                    </div>
                    <div className={styles.order}>
                
                    </div>
                    <div className={styles.time}>{formatTime()}</div>
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
                                <canvas ref={canvasRef} className={styles.pizzaCanvas} onMouseDown={startPaintImage} onMouseMove={paintImageMove} onMouseUp={finishPaintImage} onMouseLeave={finishPaintImage}></canvas>
                            </>
                        )}
                    </div>
                    <div className={styles.btns}>
                        <button className={styles.bake} onClick={handleGoToOven}>Hornear</button>
                    </div>
                </div>
            </div>
            {savedPizzaImage && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid green' }}>
                    <h3>Pizza guardada:</h3>
                    <img src={savedPizzaImage} alt="Pizza guardada" style={{ maxWidth: '200px', border: '1px solid black' }}></img>
                </div>
            )}
        </>
    )
}