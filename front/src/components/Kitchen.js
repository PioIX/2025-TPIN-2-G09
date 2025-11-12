"use client"

import { useState, useRef, useEffect} from "react"
import styles from "./Kitchen.module.css"
import { useScore } from "../contexts/ScoreContext.js"
import { useRouter } from "next/navigation"
import { useTimer } from "../contexts/TimerContext"
import { useMoney } from '../contexts/MoneyContext'
import { useConnection } from "@/hooks/useConnection"

//SECCIÓN DE LA COCINA
export default function Kitchen({onGoToOven, orderText}) {
    const {url} = useConnection()
    const { percentage} = useTimer();
    const { money } = useMoney()
    const { updateStageScore } = useScore()
    const ingredientsBox = [
        {id:1, name:"tomato", image:"/imagesIngredients/tomato.png", bowl:"/imagesIngredients/tomatoBowl.png", drawMode: "image", size: 160},
        {id:2, name:"cheese", image:"/imagesIngredients/cheese.png", bowl:"/imagesIngredients/cheeseBowl.png", drawMode: "image", size: 140},
        {id:3, name:"pepperoni", image:"/imagesIngredients/pepperoni.png", bowl:"/imagesIngredients/pepperoniBowl.png", drawMode: "click", size: 50},
        {id:4, name:"mushroom", image:"/imagesIngredients/mushroom.png", bowl:"/imagesIngredients/mushroomBowl.png", drawMode: "click", size: 50},
        {id:5, name:"olive", image:"/imagesIngredients/olive.png", bowl:"/imagesIngredients/oliveBowl.png", drawMode: "click", size: 50},
        {id:6, name:"pepper", image:"/imagesIngredients/pepper.png", bowl:"/imagesIngredients/pepperBowl.png", drawMode: "click", size: 50},
        {id:7, name:"onion", image:"/imagesIngredients/onion.png", bowl:"/imagesIngredients/onionBowl.png", drawMode: "click", size: 60}
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
    const [ingredientCoordinates, setIngredientCoordinates] = useState([])

    const router = useRouter()

    const canvasRef = useRef(null)
    const imageRef = useRef(null)
    const pizzaBunImageRef = useRef(null)
    const pizzaCenterRef = useRef({ x: 0, y: 0})
    const pizzaRadiusRef = useRef(200)
    
    const idealCoords = [
        { x: 380, y: 250 },
        { x: 342, y: 170 },
        { x: 250, y: 130 },
        { x: 158, y: 170 },
        { x: 120, y: 250 },
        { x: 158, y: 330 },
        { x: 250, y: 370 },
        { x: 342, y: 330 },
    ]

    useEffect(() => {
        const fetchPizzaValidation = async () => {
            try {
                const pizzaId = localStorage.getItem('currentPizzaId')
                console.log('Pizza ID desde localStorage:', pizzaId)

                if(!pizzaId) {
                    console.error('No se encontró ID de pizza')
                    return
                }

                const response = await fetch(url + `/pizzaValidation/${pizzaId}`)

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

    //poner imagen al seleccionar ingrediente
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


    //configurar canva cuando aparece la pizza
    useEffect(() => {
        if (activePizza && canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = 400
            canvas.height = 400
            pizzaCenterRef.current = { x: 200, y: 200 }
            pizzaRadiusRef.current = 200

            const pizzaBunImg = new Image()
            pizzaBunImg.onload = () => {
                pizzaBunImageRef.current = pizzaBunImg
                const ctx=canvas.getContext('2d')
                ctx.drawImage(pizzaBunImg, 0, 0, canvas.width, canvas.height)
            }
            pizzaBunImg.src = "/imagesIngredients/pizzaBun.png"
        }
    }, [activePizza])

    const calculateDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    }

    const findClosestIdealCoord = (x, y, usedIndices) => {
        let minDistance = Infinity
        let closestIndex = -1

        idealCoords.forEach((coord, index) => {
            if(!usedIndices.has(index)){
                const distance = calculateDistance(x, y, coord.x, coord.y)
                if (distance < minDistance){
                    minDistance = distance
                    closestIndex = index
                }
            }
        })

        return {index: closestIndex, distance: minDistance}
    }

    const calculateLocationScore = (placedCoords) => {
        if (placedCoords.length === 0) return 0 // Si no hay ingredientes para validar posición
        
        const usedIdealIndices = new Set()
        let totalScore = 0
        const maxPointsPerIngredient = 100 / placedCoords.length

        placedCoords.forEach((placed) => {
            const { distance, index } = findClosestIdealCoord(
                placed.x,
                placed.y,
                usedIdealIndices
            )

            if (index !== -1) {
                usedIdealIndices.add(index)

                // Sistema de puntuación por distancia:
                // 0-20px: 100% | 20-50px: 70-100% | 50-100px: 30-70% | >100px: 0-30%
                let scorePercentage
                if (distance <= 20) {
                    scorePercentage = 1.0
                } else if (distance <= 50) {
                    scorePercentage = 0.7 + (0.3 * (50 - distance) / 30)
                } else if (distance <= 100) {
                    scorePercentage = 0.3 + (0.4 * (100 - distance) / 50)
                } else {
                    scorePercentage = Math.max(0, 0.3 * (150 - distance) / 50)
                }

                totalScore += maxPointsPerIngredient * scorePercentage
            }
        })

        return Math.round(totalScore)
    }
    

    const handleIngredientClick = (ingredient) => {
        setSelectedIngredient(ingredient)
        setPaintingImage(false)
    }

    const handleBunClick = (index) => {
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
            //console.log(x, y, pizzaCenterRef.current.x, pizzaCenterRef.current.y)
            ctx.drawImage(imageRef.current, x - size / 2, y - size / 2, size, size)

            const ingredientName = selectedIngredient.name

            registerIngredientUsage(ingredientName)

            setIngredientClicks(prev => ({
                ...prev,
                [ingredientName]: (prev[ingredientName] || 0) + 1
            }))

            if(selectedIngredient.drawMode === "click"){
                setIngredientCoordinates(prev => [...prev, {
                    x,
                    y,
                    ingredient: ingredientName
                }])
            }
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


        if(!ingredientsUsed['tomato']){
            errors.push('Falta el ingrediente obligatorio: tomato')
            score -= 30
        }

        if(!ingredientsUsed['cheese']){
            errors.push('Falta el ingrediente obligatorio: cheese')
            score -= 30
        }

        const validIngredients = []
        const validQuantities = []

        if(ingredients.ing1 !== null){
            validIngredients.push(ingredients.ing1)
            validQuantities.push(quantities.quantityIng1)
        }

        if(ingredients.ing2 !== null){
            validIngredients.push(ingredients.ing2)
            validQuantities.push(quantities.quantityIng2)
        }

        if(ingredients.ing3 !== null){
            validIngredients.push(ingredients.ing3)
            validQuantities.push(quantities.quantityIng3)
        }


        validIngredients.forEach((ingredientName, index) => {
            if (!ingredientsUsed[ingredientName]) {
                errors.push(`Falta el ingrediente: ${ingredientName}`)
                score -= 50
            } else {
                const ingredient = ingredientsBox.find(ing => ing.name === ingredientName)
                if (ingredient?.drawMode === "click") {
                    const clicks = ingredientClicks[ingredientName] || 0
                    const expectedQuantity = validQuantities[index]
                    
                    if (expectedQuantity !== null && Math.abs(clicks - expectedQuantity) > 2) {
                        errors.push(`${ingredientName}: cantidad incorrecta (esperado ~${expectedQuantity}, obtenido ${clicks})`)
                        score -= 20
                    }
                }
            }
        })

        Object.keys(ingredientClicks).forEach(ingredientName => {
            if (!validIngredients.includes(ingredientName) && 
                ingredientName !== 'tomato' && 
                ingredientName !== 'cheese' &&
                ingredientClicks[ingredientName] > 0) {
                errors.push(`Ingrediente extra no solicitado: ${ingredientName}`)
                score -= 25
            }
        })

        score = Math.max(0, score) 

        const locationScore = calculateLocationScore(ingredientCoordinates)
        //console.log("Puntaje de ubicación:", locationScore)
        //console.log("Coordenadas colocadas:", ingredientCoordinates)

        const finalScore = Math.round(score * 0.7 + locationScore * 0.3)

        //console.log("Puntaje ingredientes:", score)
        //console.log("Puntaje ubicación:", locationScore)
        console.log("Puntaje final:", finalScore)

        return {
            isValid: errors.length === 0,
            score: score,
            ingredientScore: score,
            locationScore: locationScore,
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

            const finalScore = Math.round(
                validation.ingredientScore * 0.7 + validation.locationScore * 0.3
            )
            
            updateStageScore('kitchen', finalScore, validation)

            
            console.log('Resultado de validación:', validation);
            console.log('Ingredientes usados:', ingredientsUsed);
            console.log('Clicks de ingredientes:', ingredientClicks);

            const pngData = canvas.toDataURL('image/png');
            setSavedPizzaImage(pngData);
            console.log("Pizza guardada exitosamente");
            //console.log("Llamando a onGoToOven con la imagen");

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
                        {orderText || ''}
                    </div>
                    <div className={styles.money}>${money}</div>
                </div>
                <div className={styles.ingredientsBox}>
                    {ingredientsBox.map((ingredientBox) => (
                        <button key={ingredientBox.id} className={styles.ingredientBtn} onClick={() => handleIngredientClick(ingredientBox)} title={ingredientBox.name}>
                            <img src={ingredientBox.bowl} alt={ingredientBox.name}></img>
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