"use client"

import { useState } from "react"
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

    const handleIngredientClick = (ingredient) => {
        console.log(`Ingrediente ${ingredient.name} clickeado`)
        //Poner la lógica de cuando agarramos el ingrediente
    }

    const handleBunClick = (index) => {
        console.log(`Bollo ${index + 1} clickeado`)
        
        const newVisibleBuns = [...visibleBuns]
        newVisibleBuns[index] = false
        setVisibleBuns(newVisibleBuns)

        setActivePizza(true)
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.ingredientsBox}>
                    {ingredientsBox.map((ingredientBox) => (
                        <button key={ingredientBox.id} className={styles.ingredientBtn} onClick={() => handleIngredientClick(ingredientBox)} title={ingredientBox.name}>ç
                            <img src={ingredientBox.image} alt={ingredientBox.name}></img>
                        </button>
                    ))}
                </div>
                <div className={styles.mainArea}>
                    <div className={styles.buns-container}>
                        {[...Array(8)].map((_, index) => (
                            <button key={index} className={`${styles.bunBtn} ${!visibleBuns[index] ? styles.hidden : ''}`} onClick={() => handleBunClick(index)} style={{ visibility: visibleBuns[index] ? 'visible' : 'hidden'}}>{/*PONER IMAGEN DE BOLLOS*/}</button>
                        ))}
                    </div>
                </div>
                <div className={styles.pizza}>
                    {activePizza && (
                        <div className={styles.pizzaBase}>

                        </div>
                    )}
                </div>
            </div>
        </>
    )
}