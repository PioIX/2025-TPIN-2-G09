"use client"

import { useState, useRef, useEffect} from "react"
import styles from "./Kitchen.module.css"

//SECCIÓN DE LA COCINA
export default function Kitchen(){
    const ingredients = [
        {id:1, name:"Salsa", image:"/imagesIngredients/tomato.png"},
        {id:2, name:"Queso", image:"/imagesIngredients/cheese.png"},
        {id:3, name:"Pepperoni", image:"/imagesIngredients/pepperoni.png"},
        {id:4, name:"Champiñones", image:"/imagesIngredients/mushroom.png"},
        {id:5, name:"Aceituna", image:"/imagesIngredients/olive.png"},
        {id:6, name:"Albahaca", image:"/imagesIngredients/pepper.png"},
        {id:7, name:"Cebolla", image:"/imagesIngredients/onion.png"}
    ]

    const ingredientsBox = [
        {id:1, name:"Salsa", image:"/imagesIngredientsBox/tomato.png"},
        {id:2, name:"Queso", image:"/imagesIngredientsBox/cheese.png"},
        {id:3, name:"Pepperoni", image:"/imagesIngredientsBox/pepperoni.png"},
        {id:4, name:"Champiñones", image:"/imagesIngredientsBox/mushroom.png"},
        {id:5, name:"Aceituna", image:"/imagesIngredientsBox/olive.png"},
        {id:6, name:"Albahaca", image:"/imagesIngredientsBox/pepper.png"},
        {id:7, name:"Cebolla", image:"/imagesIngredientsBox/onion.png"}
    ]

    const [visibleBuns, setVisibleBuns] = useState([true, true, true, true, true, true, true, true])
    const [activePizza, setActivePizza] = useState(false)
    const [paintingImage, setPaintingImage] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState(null)

    const canvasRef = useRef(null)
    const imageRef = useRef(null)
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
            canvas.width = 400
            canvas.height = 400
            pizzaCenterRef.current = { x: 200, y: 200 }
            pizzaRadiusRef.current = 200
        }
    }, [activePizza])


    const handleIngredientClick = (ingredient) => {
        console.log(`Ingrediente ${ingredient.name} clickeado`)
        setSelectedIngredient(ingredient)
        //Poner la lógica de cuando agarramos el ingrediente
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

        // Verificar si está dentro del círculo
        if (isPointInCircle(x, y, pizzaCenterRef.current.x, pizzaCenterRef.current.y, pizzaRadiusRef.current)) {
            ctx.drawImage(imageRef.current, x - 15, y - 15, 30, 30)
        }
    }

    const startPaintImage = (e) => {
        if (!selectedIngredient || !canvasRef.current) return
        setPaintingImage(true)
        paintImage(e)
    }

    const paintImageMove = (e) => {
        paintImage(e, paintingImage)
    }

    const finishPaintImage = () => {
        setPaintingImage(false)
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.percent}>
                
                    </div>
                    <div className={styles.order}>
                
                    </div>
                    <div className={styles.time}>
                
                    </div>
                </div>
                <div className={styles.ingredients}>
                    {ingredients.map((ingredient) => (
                        <button key={ingredient.id} className={styles.ingredientBtn} onClick={() => handleIngredientClick(ingredient)} title={ingredient.name}>ç
                            <img src={ingredient.image} alt={ingredient.name}></img>
                <div className={styles.ingredientsBox}>
                    {ingredientsBox.map((ingredientBox) => (
                        <button key={ingredientBox.id} className={styles.ingredientBtn} onClick={() => handleIngredientClick(ingredientBox)} title={ingredientBox.name}>ç
                            <img src={ingredientBox.image} alt={ingredientBox.name}></img>
                        </button>
                    ))}
                </div>
                <div className={styles.mainArea}>
                    <div className={styles.bunsContainer}>
                        {[...Array(8)].map((_, index) => (
                            <button key={index} className={`${styles.bunBtn} ${!visibleBuns[index] ? styles.hidden : ''}`} onClick={() => handleBunClick(index)} style={{ visibility: visibleBuns[index] ? 'visible' : 'hidden'}}>{/*PONER IMAGEN DE BOLLOS*/}</button>
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
                </div>
            </div>
        </>
    )
}