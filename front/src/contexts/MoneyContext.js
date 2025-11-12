"use client"

import { createContext, useContext, useState } from 'react'

const MoneyContext = createContext()

export function MoneyProvider({ children }) {
    const [money, setMoney] = useState(100) 

    const addMoney = (amount) => {
        setMoney(prev => prev + amount)
        console.log(`Dinero añadido: $${amount}. Total: $${money + amount}`)
    }

    const resetMoney = () => {
        setMoney(100)
        console.log('Dinero reiniciado a $100')
    }

    return (
        <MoneyContext.Provider value={{ 
            money,
            addMoney,
            resetMoney
        }}>
            {children}
        </MoneyContext.Provider>
    )
}

export function useMoney() {
    const context = useContext(MoneyContext)
    if (!context) {
        throw new Error('useMoney debe usarse dentro de MoneyProvider')
    }
    return context
}