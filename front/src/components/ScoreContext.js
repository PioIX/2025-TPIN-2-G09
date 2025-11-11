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

    const calculateOvenScore = (cookingTime) => {
        if (cookingTime >= 10 && cookingTime <= 12) {
            return 100;
        }
        
        if (cookingTime < 10) {
            const distance = 10 - cookingTime;
            const maxDistance = 5; 
            return Math.max(0, 80 - (distance / maxDistance) * 80);
        } else {
            const distance = cookingTime - 12;
            const maxDistance = 8;
            return Math.max(0, 80 - (distance / maxDistance) * 80);
        }
    }

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

    const applyTimeoutPenalty = () => {
        console.log('Estado actual del score:', score)

        const currentTotal = calculateTotalScore()
        const penalizedScore = Math.max(0, currentTotal - 70)

        console.log('Score antes de penalización:', currentTotal)
        console.log('Score después de penalización:', penalizedScore)

        setScore(prev => {
            const newScore = {...prev}
            Object.keys(newScore).forEach(stage => {
                if (newScore[stage] === null) {
                    console.log(`Etapa ${stage} estaba incompleta, asignando 0`)
                    newScore[stage] = 0
                }
            })

            return newScore
        })

        setValidationDetails(prev => ({
            ...prev,
            timeout: {
                penalty:70,
                scoreBefore: currentTotal,
                scoreAfter: penalizedScore,
                timestamp: new Date().toISOString()
            }
        }))

        return penalizedScore
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
            getCookingState,
            applyTimeoutPenalty
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