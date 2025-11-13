"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/Input";
import Button from "../../components/Button";
import styles from "./page.module.css";
import Popup from "reactjs-popup";
import { useConnection } from "@/hooks/useConnection";

export default function RegistroYLogin() {
  const {url} = useConnection()
  const [modo, setModo] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false); 
  const [textoMensaje, setTextoMensaje] = useState(""); 
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const avatares = [
    {nombre : "Ana", ruta: "/imagesAvatar/Ana.png"},
    {nombre : "Juan", ruta: "/imagesAvatar/Juan.png"},
    {nombre : "Luca", ruta: "/imagesAvatar/Luca.png"},
    {nombre : "Sol", ruta: "/imagesAvatar/Sol.png"}
  ]
  
  const showModal = (title, message) => {
    setTextoMensaje(`${title}: ${message}`);
    setMostrarMensaje(true);
  };

  const abrirPopupAvatar = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const seleccionarAvatar = (rutaAvatar) => {
    const nombreAvatar = rutaAvatar.split('/').pop().split('.')[0]
    setAvatar(nombreAvatar);
    closePopup();
    showModal("Avatar seleccionado", "Avatar elegido correctamente");
  };

  async function ingresar() {
    if(!email || !password) {
      showModal("Error", "Debes completar todos los campos")
      return
    }
    const datosLogin = {
      email: email, 
      password: password,
    }
    try {
      console.log(datosLogin)
      const response = await fetch(url + "/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin),
      })
      const result = await response.json()
      console.log("Respuesta del servidor:", result)
      if (result.validar === true) {
        sessionStorage.setItem("playerId", result.id)
        
        
        if (result.es_admin === 1 || result.es_admin === true) {
          router.push("/admin");
        } else {
          router.push("/menu");
        }
      } else {
        showModal("Error", result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  async function registrar() {
    if (!username || !email || !password || !confirmPassword) {
      showModal("Error", "Debes completar todos los campos")
      return
    }

    if (password !== confirmPassword) {
      showModal("Error", "Las contraseñas no coinciden")
      return
    }

    if (!avatar){
      showModal("Error", "Debes seleccionar un avatar")
      return
    }

    const datosRegistro = {
      username,
      email,
      password,
      avatar: avatar, 
    };

    console.log("Datos a enviar:", datosRegistro)

    try {
      const response = await fetch(url + "/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosRegistro),
      });

      console.log("Status de la respuesta:", response.status)

      const result = await response.json();
      console.log("Resultado completo:", result);

      if (result.res === true) {
        showModal("Éxito", "¡Usuario registrado correctamente!");
        setTimeout(() => setModo("login"), 1000);
      } else {
        showModal("Error", result.message || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.error("Error completo:", error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.pizzaIcon}></div>
      <div className={styles.tabsContainer}>
        <button className={`${styles.tab} ${modo === "login" ? styles.tabActive : ""}`} onClick={() => setModo("login")}>LOGIN</button>
        <button className={`${styles.tab} ${modo === "registro" ? styles.tabActive : ""}`} onClick={() => setModo("registro")}>REGISTRO</button>
      </div>
      <div className={styles.formContainer}>
        {modo === "login" ? (
          <>
            <Input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} page="login"></Input>
            <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} page="login"></Input>
            <Button onClick={ingresar} text="Ingresar"></Button>
          </>
        ) : (
          <>
            <Input type="text" placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} page="login"></Input>
            <Input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} page="login"></Input>
            <button className={styles.btnAvatar} onClick={abrirPopupAvatar}>{avatar ? "Avatar seleccionado" : "Seleccionar avatar"}</button>
            <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} page="login"></Input>
            <Input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} page="login"></Input>
            <Button onClick={registrar} text="Registrarse"></Button>
          </>
        )}
      </div>
    
      {mostrarMensaje && (
        <div className={styles.mensaje}>
          {textoMensaje}
        </div>
      )}

      <Popup 
          open={isPopupOpen}
          onClose={closePopup}
          modal
          nested
          closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <h2 className={styles.modalTitle}>Selecciona tu Avatar</h2>
          <div className={styles.avatarGrid}>
            {avatares.map((av, index) => (
              <button key={index} onClick={() => seleccionarAvatar(av.ruta)} className={styles.avatarButton}>
                <img src={av.ruta} alt={av.nombre} className={styles.avatarImage}/>
              </button>
            ))}
          </div>
          <button onClick={closePopup} className={styles.closeButton}>Cancelar</button>
        </div>
      </Popup>
    </div>
  )
}