"use client"

import { useState, useRef, useEffect} from "react"
import styles from "./Kitchen.module.css"
import { useRouter } from "next/navigation"
import { useTimer } from "./TimerContext"

//SECCIÓN DE LA COCINA
export default function Kitchen({onGoToOven}) {
    const { percentage} = useTimer();
    const ingredientsBox = [
        {id:1, name:"tomato", image:"/imagesIngredients/tomato.png", drawMode: "image", size: 160},
        {id:2, name:"cheese", image:"/imagesIngredients/cheese.png", drawMode: "image", size: 140},
        {id:3, name:"pepperoni", image:"/imagesIngredients/pepperoni.png", drawMode: "click", size: 50},
        {id:4, name:"mushroom", image:"/imagesIngredients/mushroom.png", drawMode: "click", size: 50},
        {id:5, name:"olive", image:"/imagesIngredients/olive.png", drawMode: "click", size: 50},
        {id:6, name:"pepper", image:"/imagesIngredients/pepper.png", drawMode: "click", size: 70},
        {id:7, name:"onion", image:"/imagesIngredients/onion.png", drawMode: "click", size: 80}
    ]

    const [visibleBuns, setVisibleBuns] = useState([true, true, true, true, true, true, true, true])
    const [activePizza, setActivePizza] = useState(false)
    const [paintingImage, setPaintingImage] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState(null)
    const [savedPizzaImage, setSavedPizzaImage] = useState(null)

    //para validar la pizza
    const [pizzaValidation, setPizzaValidation] = useState(null)
    const [ingredientClicks, setIngredientClicks] = useState({})
    const [ingredientsUsed, setIngredientsUsed] = useState({})
    const [validationResult, setValidationResult] = useState(null)

    const router = useRouter()

    const canvasRef = useRef(null)
    const imageRef = useRef(null)
    const pizzaBunImageRef = useRef(null)
    const pizzaCenterRef = useRef({ x: 0, y: 0})
    const pizzaRadiusRef = useRef(200)

    useEffect(() => {
        const fetchPizzaValidation = async () => {
            try {
                const pizzaId = localStorage.getItem('currentPizzaId')
                console.log('Pizza ID desde localStorage:', pizzaId)

                if(!pizzaId) {
                    console.error('No se encontró ID de pizza')
                    return
                }

                console.log('Haciendo fetch a:', `http://localhost:4000/pizzaValidation/${pizzaId}`)
                const response = await fetch(`http://localhost:4000/pizzaValidation/${pizzaId}`)

                console.log('Status de respuesta:', response.status)
                console.log('Response OK?:', response.ok)

                if(!response.ok){
                    console.log('Error del servidor')
                }

                const data = await response.json()
                setPizzaValidation(data)
                console.log('Datos de validación cargados:', data)
            } catch(error){
                console.error('Error al cargar validación:', error)
                console.error('Tipo de error:', error.name)
            }
        }
        fetchPizzaValidation()
    }, [])

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

    const registerIngredientUsage = (ingredientName) => {
        setIngredientsUsed(prev => ({
            ...prev,
            [ingredientName] : true
        }))
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
            registerIngredientUsage(selectedIngredient.name)
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
            console.log(x, y, pizzaCenterRef.current.x, pizzaCenterRef.current.y)
            ctx.drawImage(imageRef.current, x - size / 2, y - size / 2, size, size)

            const ingredientName = selectedIngredient.name

            registerIngredientUsage(ingredientName)

            setIngredientClicks(prev => ({
                ...prev,
                [ingredientName]: (prev[ingredientName] || 0) + 1
            }))
        }
    }

    const finishPaintImage = () => {
        setPaintingImage(false)
    }

    const validatePizza = () => {
        if(!pizzaValidation) {
            console.error('No hay datos de validación')
            return {
                isValid: false,
                message: 'No se pudieron cargar los datos de validación'
            }
        }

        const {ingredients, quantities} = pizzaValidation
        const errors = []
        let score = 100

        console.log('Ingredientes esperados:', ingredients)
        console.log('Cantidades esperadas:', quantities)
        console.log('Ingredientes usados:', ingredientsUsed)
        console.log('Clicks registrados:', ingredientClicks)

        if (!ingredientsUsed[ingredients.ing1]) {
            errors.push(`Falta el ingrediente: ${ingredients.ing1}`)
            score -= 33
        } else {
            // para validar la cantidad solo para ingredientes
            const ingredient = ingredientsBox.find(ing => ing.name === ingredients.ing1)
            if (ingredient?.drawMode === "click") {
                const clicks = ingredientClicks[ingredients.ing1] || 0
                const expectedQuantity = quantities.quantityIng1
                
                if (Math.abs(clicks - expectedQuantity) > 2) {
                    errors.push(`${ingredients.ing1}: cantidad incorrecta (esperado ~${expectedQuantity}, obtenido ${clicks})`)
                    score -= 10
                }
            }
        }

        if (!ingredientsUsed[ingredients.ing2]) {
            errors.push(`Falta el ingrediente: ${ingredients.ing2}`)
            score -= 33
        } else {
            const ingredient = ingredientsBox.find(ing => ing.name === ingredients.ing2)
            if (ingredient?.drawMode === "click") {
                const clicks = ingredientClicks[ingredients.ing2] || 0
                const expectedQuantity = quantities.quantityIng2
                
                if (Math.abs(clicks - expectedQuantity) > 2) {
                    errors.push(`${ingredients.ing2}: cantidad incorrecta (esperado ~${expectedQuantity}, obtenido ${clicks})`)
                    score -= 10
                }
            }
        }

        if (!ingredientsUsed[ingredients.ing3]) {
            errors.push(`Falta el ingrediente: ${ingredients.ing3}`)
            score -= 33
        } else {
            const ingredient = ingredientsBox.find(ing => ing.name === ingredients.ing3)
            if (ingredient?.drawMode === "click") {
                const clicks = ingredientClicks[ingredients.ing3] || 0
                const expectedQuantity = quantities.quantityIng3
                
                if (Math.abs(clicks - expectedQuantity) > 2) {
                    errors.push(`${ingredients.ing3}: cantidad incorrecta (esperado ~${expectedQuantity}, obtenido ${clicks})`)
                    score -= 10
                }
            }
        }

        Object.keys(ingredientClicks).forEach(ingredientName => {
            if (ingredientName !== ingredients.ing1 && 
                ingredientName !== ingredients.ing2 && 
                ingredientName !== ingredients.ing3 &&
                ingredientClicks[ingredientName] > 0) {
                errors.push(`Ingrediente extra: ${ingredientName}`)
                score -= 15;
            }
        });


        score = Math.max(0, score) 
        console.log("Puntaje: ", score)

        return {
            isValid: errors.length === 0,
            score: score,
            errors: errors,
            message: errors.length === 0 
                ? '¡Pizza perfecta!' 
                : `Pizza con errores`
        }
    }

    const handleGoToOven = () => {
        const canvas = canvasRef.current;
        if(!canvas) {
            console.log("No hay canvas");
            return;
        }

        try{
            const validation = validatePizza();
            setValidationResult(validation);
            
            console.log('Resultado de validación:', validation);
            console.log('Ingredientes usados:', ingredientsUsed);
            console.log('Clicks de ingredientes:', ingredientClicks);

            const pngData = canvas.toDataURL('image/png');
            setSavedPizzaImage(pngData);
            console.log("Pizza guardada exitosamente");
            console.log("Llamando a onGoToOven con la imagen");

            if(onGoToOven) {
                onGoToOven(pngData, validation);
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