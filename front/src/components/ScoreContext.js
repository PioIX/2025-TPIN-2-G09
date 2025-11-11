"use client"

import { createContext, useContext, useState } from 'react'

const ScoreContext = createContext()

export function ScoreProvider({ children }) {
    const [score, setScore] = useState({
        kitchen: null,
        oven: null,
        cut: null
    })

    const [validationDetails, setValidationDetails] = useState({
        kitchen: null,
        oven: null,
        cut: null
    })

    // Función para calcular el puntaje del horno basado en el tiempo de cocción
    const calculateOvenScore = (cookingTime) => {
        // Tiempo ideal: 10-12 segundos = 100 puntos
        if (cookingTime >= 10 && cookingTime <= 12) {
            return 100;
        }
        
        // Si está fuera del rango ideal, calculamos el puntaje según la distancia
        if (cookingTime < 10) {
            // Cruda: 5-9 segundos
            // 9 segundos = 80 puntos, 5 segundos = 0 puntos
            const distance = 10 - cookingTime;
            const maxDistance = 5; // distancia máxima (10 - 5)
            return Math.max(0, 80 - (distance / maxDistance) * 80);
        } else {
            // Quemada: 13-20 segundos
            // 13 segundos = 80 puntos, 20 segundos = 0 puntos
            const distance = cookingTime - 12;
            const maxDistance = 8; // distancia máxima (20 - 12)
            return Math.max(0, 80 - (distance / maxDistance) * 80);
        }
    }

    // Función para determinar el estado de cocción
    const getCookingState = (cookingTime) => {
        if (cookingTime < 8) {
            return 'raw';
        } else if (cookingTime >= 8 && cookingTime <= 12) {
            return 'perfect';
        } else {
            return 'burnt';
        }
    }

    const updateStageScore = (stage, newScore, validation = null) => {
        setScore(prev => ({
            ...prev,
            [stage]: newScore
        }))

        if(validation){
            setValidationDetails(prev => ({
                ...prev,
                [stage]: validation
            }))
        }

        console.log(`Score de ${stage} actualizado:`, newScore)
        console.log(`Detalles de validación de ${stage}:`, validation)
    }

    const calculateTotalScore = () => {
        const completedScores = Object.values(score).filter(s => s !== null)

        if(completedScores.length === 0) return 0

        const total = completedScores.reduce((sum, s) => sum + s, 0)
        const average = Math.round(total / completedScores.length)

        return average
    }

    const getStageScore = (stage) => {
        return score[stage]
    }

    const isStageCompleted = (stage) => {
        return score[stage] !== null
    }

    const resetAllScores = () => {
        setScore({
            kitchen: null,
            oven: null,
            cut: null
        })
        setValidationDetails({
            kitchen: null,
            oven: null,
            cut: null
        })
    }

    const resetStageScore = (stage) => {
        setScore(prev => ({
            ...prev,
            [stage]: null
        }))
        setValidationDetails(prev => ({
            ...prev,
            [stage]: null
        }))
    }

    return (
        <ScoreContext.Provider value={{ 
            score, 
            validationDetails,
            updateStageScore,
            calculateTotalScore,
            getStageScore,
            isStageCompleted,
            resetAllScores,
            resetStageScore,
            calculateOvenScore,
            getCookingState
        }}>
            {children}
        </ScoreContext.Provider>
    )
}

export function useScore() {
    const context = useContext(ScoreContext)
    if (!context) {
        throw new Error('useScore debe usarse dentro de ScoreProvider')
    }
    return context
}