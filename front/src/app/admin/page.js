"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useConnection } from "@/hooks/useConnection";

export default function AdminPage() {
  const { url } = useConnection();
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
    es_admin: false
  });
  const [mensaje, setMensaje] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  const avatares = ["Ana", "Juan", "Luca", "Sol"];

  useEffect(() => {
    cargarPlayers();
  }, []);

  const showModal = (message) => {
    setMensaje(message);
    setMostrarMensaje(true);
    setTimeout(() => setMostrarMensaje(false), 3000);
  };

  const cargarPlayers = async () => {
    try {
      const response = await fetch(url + "/admin/players");
      const result = await response.json();
      if (result.success) {
        setPlayers(result.players);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      showModal("Error al cargar los usuarios");
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player.id_player);
    setFormData({
      username: player.username,
      email: player.email,
      password: player.password,
      avatar: player.avatar,
      es_admin: player.es_admin === 1
    });
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      avatar: "",
      es_admin: false
    });
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(url + `/admin/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          es_admin: formData.es_admin ? 1 : 0
        })
      });
      const result = await response.json();
      
      if (result.success) {
        showModal("Usuario actualizado correctamente");
        cargarPlayers();
        handleCancelEdit();
      } else {
        showModal("Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      showModal("Error de conexión al actualizar");
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem("playerId");
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Panel de Administración</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </div>

      {mostrarMensaje && (
        <div className={styles.mensaje}>{mensaje}</div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Contraseña</th>
              <th>Avatar</th>
              <th>Admin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id_player}>
                {editingPlayer === player.id_player ? (
                  <>
                    <td>{player.id_player}</td>
                    <td>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <select
                        value={formData.avatar}
                        onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        className={styles.select}
                      >
                        {avatares.map((av) => (
                          <option key={av} value={av}>{av}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={formData.es_admin}
                        onChange={(e) => setFormData({...formData, es_admin: e.target.checked})}
                        className={styles.checkbox}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleUpdate(player.id_player)} className={styles.btnSave}>
                        Guardar
                      </button>
                      <button onClick={handleCancelEdit} className={styles.btnCancel}>
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{player.id_player}</td>
                    <td>{player.username}</td>
                    <td>{player.email}</td>
                    <td>{"•".repeat(8)}</td>
                    <td>
                      <img 
                        src={`/imagesAvatar/${player.avatar}.png`} 
                        alt={player.avatar}
                        className={styles.avatarImg}
                      />
                    </td>
                    <td>{player.es_admin ? "Sí" : "No"}</td>
                    <td>
                      <button onClick={() => handleEdit(player)} className={styles.btnEdit}>
                        Editar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}