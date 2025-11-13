"use client"

import styles from "./Deliver.module.css"
import {useRef, useEffect, useState } from "react";
import { useTimer } from '../contexts/TimerContext';
import { useMoney } from '../contexts/MoneyContext'
import { useScore } from '../contexts/ScoreContext'

export default function Deliver({ onNextCustomer, currentCustomer, totalCustomers, orderText }) {
    const { percentage, resetTimer } = useTimer();
    const { calculateTotalScore, validationDetails } = useScore();
    const [characterImage, setCharacterImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showBox, setShowBox] = useState(true);
    const [showThanks, setShowThanks] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const customerName = localStorage.getItem('currentCustomerName');
    const { money } = useMoney()
    
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                if (customerName) {
                    setCharacterImage(`/imagesCustomers/${customerName}.png`);
                }
            } catch (error) {
                console.error('Error al cargar el customer:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [customerName])

    const canvasRef = useRef(null)
    const [imagesLoaded, setImagesLoaded] = useState({
        background: false,
        character: false,
        box: false
    })

    const imagesRef = useRef({
        background: null,
        character: null,
        box: null
    })

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

        if (characterImage) {
            const charImg = new Image();
            charImg.onload = () => {
                imagesRef.current.character = charImg;
                setImagesLoaded(prev => ({ ...prev, character: true }));
            };
            charImg.onerror = () => {
                console.error('Error cargando personaje');
                setImagesLoaded(prev => ({ ...prev, character: false }));
            };
            charImg.src = characterImage;
        }

        //Imagen de la caja
        const boxImg = new Image();
        boxImg.onload = () => {
            imagesRef.current.box = boxImg;
            setImagesLoaded(prev => ({ ...prev, box: true }));
        };
        boxImg.onerror = () => {
            console.error('Error cargando caja de pizza');
            setImagesLoaded(prev => ({ ...prev, box: false }));
        };
        boxImg.src = '/imagesElements/box.png';

        return () => {
            imagesRef.current.background = null;
            imagesRef.current.character = null;
            imagesRef.current.box = null;
        };
    }, [characterImage]);

    const drawScene = (ctx) => {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (imagesRef.current.background && imagesLoaded.background) {
            ctx.drawImage(imagesRef.current.background, 0, 0, window.innerWidth, window.innerHeight);
        }

        if (imagesRef.current.character && imagesLoaded.character) {
            const scaleX = window.innerWidth / 550;
            const scaleY = window.innerHeight / 400;
            
            const charX = 50 * scaleX;
            const charY = 91 * scaleY;
            const charWidth = 150 * scaleX;
            const charHeight = 280 * scaleY;
            
            ctx.drawImage(imagesRef.current.character, charX, charY, charWidth, charHeight);
        }

        // Dibujar la caja de pizza si está visible
        if (showBox && imagesRef.current.box && imagesLoaded.box) {
            const scaleX = window.innerWidth / 550;
            const scaleY = window.innerHeight / 400;
            
            const boxX = 210 * scaleX; // Posición X de la caja
            const boxY = 305 * scaleY; // Posición Y de la caja
            const boxWidth = 120 * scaleX; // Ancho de la caja
            const boxHeight = 120 * scaleY; // Alto de la caja
            
            ctx.drawImage(imagesRef.current.box, boxX, boxY, boxWidth, boxHeight);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        drawScene(ctx);
    }, [imagesLoaded, showBox]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            if (!canvas) return;
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                drawScene(ctx);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [imagesLoaded, showBox]);

    const getCustomerFeedBack = () => {
        console.log('Detalles de validación completos:', validationDetails)

        const kitchenValidation = validationDetails.kitchen
        const ovenValidation = validationDetails.oven
        const cutValidation = validationDetails.cut

        const hasMissingIngredient = kitchenValidation.errors.some(error =>
            error.includes('Falta el ingrediente')
        ) || false

        const ingredientsCorrect = !hasMissingIngredient;

        const cookingPerfect = ovenValidation?.state === 'perfect';
        const cookingRaw = ovenValidation?.state === 'raw';
        const cookingBurnt = ovenValidation?.state === 'burnt';
        const cookingWrong = cookingRaw || cookingBurnt;

        const cutsCorrect = cutValidation?.totalCuts === 4 && cutValidation?.isValid;
        const cutsWrong = cutValidation?.totalCuts !== 4 || !cutValidation?.isValid;

        //todo bien
        if (ingredientsCorrect && cookingPerfect && cutsCorrect) {
            return 'Todo en su punto justo. ¡Una pizza excelente!';
        }

        //todo mal
        if (hasMissingIngredient && cookingWrong && cutsWrong) {
            return 'Esto es un desastre completo. ¿Seguro que esto es una pizza?';
        }

        //ingredientes bien, cocción mal, cortes mal
        if (ingredientsCorrect && cookingWrong && cutsWrong) {
            return 'Los ingredientes están bien, pero la cocción y los cortes fallaron.';
        }

        //ingredientes mal, cocción bien, cortes mal
        if (hasMissingIngredient && cookingPerfect && cutsWrong) {
            return 'La cocción está perfecta, pero faltan ingredientes y los cortes están mal.';
        }

        //ingredientes mal, cocción mal, cortes bien
        if (hasMissingIngredient && cookingWrong && cutsCorrect) {
            return 'Los cortes están bien, pero faltan ingredientes y la cocción está mal.';
        }

        //ingredientes bien, cocción bien, cortes mal
        if (ingredientsCorrect && cookingPerfect && cutsWrong) {
            return 'Ingredientes y cocción perfectos, pero los cortes arruinan la presentación.';
        }

        //ingredientes bien, cortes bien, cocción mal
        if (ingredientsCorrect && cutsCorrect && cookingWrong) {
            if (cookingRaw) {
                return 'Ingredientes y cortes perfectos, pero está cruda. No puedo comerla así.';
            }
            if (cookingBurnt) {
                return 'Ingredientes y cortes perfectos, pero está quemada. Qué lástima.';
            }
        }

        //cocción bien, cortes bien, ingredientes mal
        if (hasMissingIngredient && cookingPerfect && cutsCorrect) {
            return 'Cocción y cortes perfectos, pero falta un ingrediente importante.';
        }

        //casos individuales específicos
        /*
        if (hasMissingIngredient && !cookingWrong && !cutsWrong) {
            return 'Falta un ingrediente importante. Así no se disfruta igual.';
        }

        if (cookingRaw && !hasMissingIngredient && !cutsWrong) {
            return 'Parece que olvidaste cocinarla del todo.';
        }

        if (cookingBurnt && !hasMissingIngredient && !cutsWrong) {
            return 'Crujiente está bien… pero esto parece carbón.';
        }

        if (cutValidation?.totalCuts === 0) {
            return 'No la cortaron, imposible de compartir así.';
        }

        if (cutsWrong && !hasMissingIngredient && !cookingWrong) {
            return 'Mal cortada, arruina la presentación.';
        }*/

        return 'Podría estar mejor, pero es aceptable.'
    }

    const handleCanvasClick = (e) => {
        if (!showBox) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calcular las dimensiones y posición de la caja
        const scaleX = window.innerWidth / 550;
        const scaleY = window.innerHeight / 400;
        
        const boxX = 210 * scaleX;
        const boxY = 295 * scaleY;
        const boxWidth = 120 * scaleX;
        const boxHeight = 120 * scaleY;

        // Verificar si el click está dentro de la caja
        if (x >= boxX && x <= boxX + boxWidth && y >= boxY && y <= boxY + boxHeight) {
            setShowBox(false);

            const message = getCustomerFeedBack();
            setDialogMessage(message);

            console.log('Feedback del cliente:', message);
            console.log('Score total:', calculateTotalScore());
            
            setTimeout(() => {
                setShowThanks(true);
                setTimeout(() => {
                    setShowNextButton(true);
                }, 1000);
            }, 300);
        }
    };

    const handleNextCustomer = () => {
        // Limpiar la orden del localStorage al ir al siguiente cliente
        localStorage.removeItem('currentOrderText');
        resetTimer();
        if (onNextCustomer) {
            onNextCustomer();
        }
    };

    return (
        <div className={styles.orderContainer}>
            <div className={styles.header}>
                <div className={styles.percent}>
                    {percentage}%
                </div>
                 <div className={styles.money}>${money}</div>
            </div>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                onClick={handleCanvasClick}
                style={{ cursor: showBox ? 'pointer' : 'default' }}
            />
            
            {showThanks && (
                <div className={styles.dialogContainer}>
                    <div className={styles.dialogBubble}>
                        <p className={styles.dialogText}>
                            {dialogMessage}
                        </p>
                    </div>
                </div>
            )}

            {showNextButton && (
                <div className={styles.nextButtonContainer}>
                    <button 
                        className={styles.nextButton}
                        onClick={handleNextCustomer}
                    >
                        {currentCustomer < totalCustomers 
                            ? `Siguiente cliente`
                            : '¡Terminar juego!'
                        }
                    </button>
                </div>
            )}
        </div>
    );
}