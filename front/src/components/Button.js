"use client"

import styles from "./Button.module.css"

export default function Button(props) {
    return (
        <>
            <button className={styles.btn} onClick={props.onClick} >{props.text}</button>

        </>
    )
}