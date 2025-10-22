"use client"

import styles from "./Deliver.module.css"
import { useEffect, useState } from "react";

export default function Deliver(props) {
    const [customer, setCustomer] = useState("");

    useEffect(() => {
        const savedCustomer = localStorage.getItem("customerId");
        setCustomer(savedCustomer);
    }, []);

    useEffect(() => {
    const bgImg = new Image();
    bgImg.onload = () => {
      imagesRef.current.background = bgImg;
      setImagesLoaded(prev => ({ ...prev, background: true }));
    };
    bgImg.onerror = () => {
      console.error('Error cargando fondo');
      setImagesLoaded(prev => ({ ...prev, background: false }));
    };
    bgImg.src = '/imagesFondos/FondoPizzeria.png';
    }, []);

    return (
        <>
        <div className={styles.orderContainer}>
            <div className={styles.header}>
                    <div className={styles.percent}>
                
                    </div>
                    <div className={styles.order}>
                
                    </div>
                    <div className={styles.time}>
                
                    </div>
            </div>

        </div>
        <div>
            {customer ? `Customer ID: ${customer}`:"Cargando..."}
        </div>

        </>
    );
}