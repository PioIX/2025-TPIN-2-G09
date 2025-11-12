"use client"
import styles from "./Input.module.css"

export default function Input({page, ...props}) {
    return (
        <>
           <input className={styles.input} type={props.type} onChange={props.onChange} placeholder={props.placeholder} value={props.value} onKeyDown={props.onKeyDown}></input>
        </>
    )
}