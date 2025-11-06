"use client"

import { createContext, useContext, useState } from 'react'

const ScoreContext = createContext()

export function ScoreProvider({ children }) {
    const [score, setScore] = useState(0)
    const [validationDetails, setValidationDetails] = useState(null)

    const updateScore = (newScore, validation) => {
        setScore(newScore)
        setValidationDetails(validation)
        console.log('Score actualizado:', newScore)
        console.log('Detalles de validación:', validation)
    }

    const resetScore = () => {
        setScore(0)
        setValidationDetails(null)
    }

    return (
        <ScoreContext.Provider value={{ 
            score, 
            validationDetails,
            updateScore, 
            resetScore 
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