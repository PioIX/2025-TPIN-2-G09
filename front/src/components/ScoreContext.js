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
        const completedScores = Object.values(scores).filter(score => score !== null)

        if(completedScores.length === 0) return 0

        const total = completedScores.reduce((sum, score) => sum + score, 0)
        const average = Math.round(total / completedScores.length)

        return average
    }

    const getStageScore = (stage) => {
        return scores[stage]
    }

    const isStageCompleted = (stage) => {
        return scores[stage] !== null
    }

    const resetAllScores = () => {
        setScores({
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
        setScores(prev => ({
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
            resetStageScore
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