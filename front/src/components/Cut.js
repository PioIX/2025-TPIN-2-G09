"use client"

import { useState } from "react"
import styles from "./Cut.module.css"
import clsx from "clsx"

//SECCIÓN DE CORTAR
export default function Cut({pizzaImage}){
    const [cursorStyle, setCursorStyle] = useState(false)

    const knifeCursor = () => {
        setCursorStyle(true)
        
    }


    return(
        <>
            <div  className={clsx(styles.container, {[styles.cursorKnife]: cursorStyle == true})}>
                <div className={styles.header}>
                    <div className={styles.percent}>
                
                    </div>
                    <div className={styles.order}>
                
                    </div>
                    <div className={styles.time}>
                
                    </div>
                </div>
                <div className={styles.table}>
                    <div className={styles.pizzaCanvas} >
                        <img className={pizzaImage} src={pizzaImage}></img>
                    </div>
                    <button className={styles.knifeCursor} onClick={knifeCursor}>
                        <img className={styles.knife} src="/imagesElements/knife.png"></img>
                    </button>
                </div>
                <div className={styles.boxes}>
                    <img className={styles.box} src="/imagesElements/boxes.png"></img>
                </div>
            </div>
        </>
    )
}