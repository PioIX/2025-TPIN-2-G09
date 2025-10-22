"use client"

import styles from "./Deliver.module.css"
import { useEffect, useState } from "react";

export default function Deliver(props) {
    const [customerId, setCustomerId] = useState("");

    useEffect(() => {
        const savedId = localStorage.getItem("customerId");
        setCustomerId(savedId);
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
        <div>
            {customerId ? `Customer ID: ${customerId}`:"Cargando..."}
        </div>

        </>
    );
}