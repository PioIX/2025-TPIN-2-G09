# 2025-TPIN-2G09

Es el proyecto final compuesto por las materias:
- Seminario
- EFSI
- Proyecto de Producción
- Desarrollo de aplicaciones Web

## ¿En qué consiste el juego?
El juego se centra en la experiencia de gestionar una pizzería virtual en pleno funcionamiento, donde el jugador asume el rol de pizzero y administrador del local. La dinámica principal consiste en preparar pizzas siguiendo con precisión los pedidos de los distintos clientes, cada uno con sus gustos, tiempos de espera y niveles de exigencia. Para avanzar, el usuario crea un perfil propio, que le permite guardar su progreso, registrar su puntaje acumulado y seguir su evolución a lo largo de las distintas jornadas laborales.

Durante el juego, los jugadores deben seleccionar cuidadosamente los ingredientes adecuados, controlar los tiempos de cocción en el horno, cortar y entregar las pizzas en el momento justo. A medida que completan pedidos con éxito y reciben buenas propinas, van ganando dinero, lo que les permite desbloquear nuevos ingredientes, mejorar el equipamiento de la cocina y afrontar niveles con una mayor cantidad de clientes y pedidos más complejos. Esto agrega un elemento de desafío progresivo y estrategia.

Cada día de trabajo culmina con un informe de rendimiento, donde se muestran los resultados obtenidos: cantidad de pizzas completadas, errores cometidos, dinero ganado y bonificaciones. Además, se presenta un ranking comparativo en el que el jugador puede ver su puntaje frente al de otros participantes del juego, fomentando la competencia sana, la superación personal y las ganas de perfeccionar sus habilidades culinarias y de gestión.

Con esta combinación de preparación, administración, progreso y competencia, el juego busca crear una experiencia divertida, dinámica y motivadora, que invite al jugador a mejorar constantemente y a llevar su pizzería al máximo nivel.
<ins> Pantalla de inicio <ins>
- Al abrir la aplicación, el usuario se encuentra con una interfaz inicial donde puede registrarse creando un nombre de usuario, correo electrónico, contraseña y avatar, o bien iniciar sesión si ya tiene cuenta.
- Esto permite que cada jugador tenga un perfil propio, guarde su progreso y acumule puntaje en el ranking global.
<img width="1419" height="775" alt="image" src="https://github.com/user-attachments/assets/b55e9090-5855-442f-b2bb-9fad9d5c878f" />
<img width="1103" height="826" alt="image" src="https://github.com/user-attachments/assets/95f31b59-43d2-4829-b95e-8650172e8a4d" />

<ins> Menú Principal <ins>
- Una vez logueado, el jugador accede al menú donde puede:
   - Iniciar partida
   - Reglas del juego
 <img width="1897" height="876" alt="image" src="https://github.com/user-attachments/assets/7068c306-5191-49a4-bdd1-e54ee5e30b42" />

<ins> Juego principal (simulación de la pizzería)<ins>
- Los clientes entran al local y piden una pizza con determinados ingredientes.
<img width="1919" height="877" alt="image" src="https://github.com/user-attachments/assets/568172cc-5079-4304-96db-a7b20c16b0ee" />

- El jugador debe seleccionar la masa, la salsa, el queso y los toppings correctos.
<img width="1919" height="877" alt="image" src="https://github.com/user-attachments/assets/2d603782-da22-4700-b8d3-08b9ad17fd1c" />

- Luego hornea la pizza y la corta.
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/50524467-f175-4d4b-b46f-4018c1b59b83" />
<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/ad16d1de-cfb7-4f37-a3bf-7ea665adb93f" />

- Entrega la pizza al cliente y si está correcta, recibe dinero y puntos de satisfacción, si está mal, gana menos dinero y baja de posición en el ranking.
- <img width="1919" height="876" alt="image" src="https://github.com/user-attachments/assets/5ec0ed4f-851c-4d37-8499-f0bb3665eba7" />


## Listado de tareas

<ins>Diseño e implementación del login y registro <ins>
- Crear pantallas de inicio con formulario de registro e inicio de sesión.
- Configurar autenticación y validaciones.
- Conexión con la base de datos para guardar usuarios.

<ins>Desarrollo del menú principal<ins>
- Diseño de interfaz.
- Implementar navegación entre pantallas (menú → juego → ranking → perfil).

<ins>Implementación del juego principal (pizzería)<ins>
- Creación de clases y objetos (clientes, pizzas, ingredientes).
- Mecánica de armado de pizzas y validación de pedidos.
- Sistema de puntaje y dinero.

<ins>Sistema de progreso y desbloqueo de ingredientes<ins>
- Guardar progreso en la base de datos.
- Incrementar dificultad con más clientes/menos tiempo.

<ins>Ranking global y semanal<ins>
- Implementar comparación de puntajes en tiempo real con WebSockets.
- Mostrar posición personal y tabla general.

<ins>Gestión del perfil del usuario<ins>
- Ver estadísticas personales, logros, dinero acumulado.
- CRUD completo de usuario (editar datos, eliminar cuenta).

<ins>Infraestructura y trabajo colaborativo<ins>
- Uso de repositorio en GitHub con GitFlow.
- Creación de issues y asignación de tareas.
- Documentación del proceso.

## División de responsabilidades

<ins>Martu<ins>
- Frontend - Interfaz gráfica
  - Diseño de pantallas (login, registro, menú, perfil, ranking).
  - Componentes en React/Next.js.
  - Estética y usabilidad del juego.
    
<ins>Juli<ins>
- Lógica del juego y sistema de progreso
  - Clases y objetos (clientes, pizzas, ingredientes).
  - Mecánica de armado de pizzas, validación de pedidos.
  - Sistema de puntaje, dinero y desbloqueos.

<ins>Sofi<ins>
- Backend y conexión con la base de datos
  - Configuración DB y API REST.
  - Autenticación de usuarios (CRUD).
  - Implementación de ranking (WebSockets para tiempo real).

