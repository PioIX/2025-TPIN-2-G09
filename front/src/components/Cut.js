"use client"

import { useState } from "react"
import styles from "./Cut.module.css"
import clsx from "clsx"

//SECCIÓN DE CORTAR
export default function Cut({pizzaImage, onGoToDeliver}){
    const [cursorStyle, setCursorStyle] = useState(false)
    const [visibleKnife, setVisibleKnife] = useState(true)
    const [showDoneButton, setShowDoneButton] = useState(false)

    const knifeCursor = () => {
        setCursorStyle(true)
        setVisibleKnife(false)
        setShowDoneButton(true)
    }

    const resetCursor = () => {
        setCursorStyle(false)
        setVisibleKnife(false)
        setShowDoneButton(false)
    }

    const handleGoToDeliver = () => {
        try{
            if(onGoToDeliver) {
                onGoToDeliver();
            } else {
                console.error("onGoToDeliver no está definida");
            }
        } catch(error){
            console.error("Error al cambiar de página: ", error);
        }
    };

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
                    <button className={`${styles.knifeCursor} ${!visibleKnife ? styles.hidden : ''}`} onClick={knifeCursor} style={{ visibility: visibleKnife ? 'visible' : 'hidden'}}>
                        <img className={styles.knife} src="/imagesElements/knife.png"></img>
                    </button>
                    <button className={styles.doneButton} onClick={resetCursor} style={{ visibility: showDoneButton ? 'visible' : 'hidden'}}>
                        Listo
                    </button>
                </div>
                <div className={styles.boxes}>
                    <img className={styles.box} src="/imagesElements/boxes.png"></img>
                </div>
                <div className={styles.btns}>
                    <button className={styles.deliver} onClick={handleGoToDeliver}>Entregar</button>
                </div>
            </div>
        </>
    )
}