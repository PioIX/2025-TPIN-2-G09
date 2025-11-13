"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConnection } from "@/hooks/useConnection";
import styles from "./admin.module.css";

export default function AdminPage() {
  const { url } = useConnection();
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Estados del formulario de edición
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
    es_admin: false
  });

  const avatares = ["Ana", "Juan", "Luca", "Sol"];

  useEffect(() => {
    // Verificar si es admin
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.push("/menu");
      return;
    }
    cargarPlayers();
  }, []);

  const cargarPlayers = async () => {
    try {
      const response = await fetch(url + "/getAllPlayers");
      const data = await response.json();
      if (data.res) {
        setPlayers(data.players);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar jugadores:", error);
      mostrarMensaje("Error al cargar los jugadores", "error");
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const abrirModalEditar = (player) => {
    setEditingPlayer(player);
    setFormData({
      username: player.username,
      email: player.email,
      password: "",
      avatar: player.avatar,
      es_admin: player.es_admin
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingPlayer(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      avatar: "",
      es_admin: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const actualizarPlayer = async () => {
    if (!formData.username || !formData.email || !formData.avatar) {
      mostrarMensaje("Completa todos los campos obligatorios", "error");
      return;
    }

    try {
      const datosActualizar = {
        id_player: editingPlayer.id_player,
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar,
        es_admin: formData.es_admin
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password) {
        datosActualizar.password = formData.password;
      }

      const response = await fetch(url + "/updatePlayer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosActualizar)
      });

      const result = await response.json();

      if (result.res) {
        mostrarMensaje("Jugador actualizado correctamente", "success");
        cargarPlayers();
        cerrarModal();
      } else {
        mostrarMensaje(result.message || "Error al actualizar", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error al actualizar el jugador", "error");
    }
  };

  const eliminarPlayer = async (id_player) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este jugador?")) {
      return;
    }

    try {
      const response = await fetch(url + "/deletePlayer", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_player })
      });

      const result = await response.json();

      if (result.res) {
        mostrarMensaje("Jugador eliminado correctamente", "success");
        cargarPlayers();
      } else {
        mostrarMensaje(result.message || "Error al eliminar", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error al eliminar el jugador", "error");
    }
  };

  const cerrarSesion = () => {
    sessionStorage.clear();
    router.push("/");
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Panel de Administrador</h1>
        <button onClick={cerrarSesion} className={styles.btnCerrarSesion}>
          Cerrar Sesión
        </button>
      </header>

      {mensaje.texto && (
        <div className={`${styles.mensaje} ${styles[mensaje.tipo]}`}>
          {mensaje.texto}
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Avatar</th>
              <th>Admin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id_player}>
                <td>{player.id_player}</td>
                <td>{player.username}</td>
                <td>{player.email}</td>
                <td>
                  <img 
                    src={`/imagesAvatar/${player.avatar}.png`} 
                    alt={player.avatar}
                    className={styles.avatarSmall}
                  />
                </td>
                <td>{player.es_admin ? "Sí" : "No"}</td>
                <td>
                  <button 
                    onClick={() => abrirModalEditar(player)}
                    className={styles.btnEditar}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => eliminarPlayer(player.id_player)}
                    className={styles.btnEliminar}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Editar Jugador</h2>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nueva Contraseña (dejar vacío para mantener):</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nueva contraseña"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Avatar:</label>
                <select
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  {avatares.map((av) => (
                    <option key={av} value={av}>{av}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="es_admin"
                    checked={formData.es_admin}
                    onChange={handleInputChange}
                  />
                  Es Administrador
                </label>
              </div>

              <div className={styles.modalButtons}>
                <button 
                  type="button" 
                  onClick={actualizarPlayer}
                  className={styles.btnGuardar}
                >
                  Guardar
                </button>
                <button 
                  type="button" 
                  onClick={cerrarModal}
                  className={styles.btnCancelar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}