var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');

const session = require("express-session"); // Para el manejo de las variables de sesión

const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicializo express
var port = process.env.PORT || 4000; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const server = app.listen(port, function () {
    console.log(`Server running in http://localhost:${port}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

const sessionMiddleware = session({
    secret: "supersarasa",
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

app.get('/', function (req, res) {
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});

app.post('/loginUser', async function (req, res) {
    console.log("Resultado de búsqueda:", req.body);
    try {
        const result = await realizarQuery(`
            SELECT * FROM Players WHERE email = "${req.body.email}" AND password = "${req.body.password}";
        `);
        if (result.length > 0) {
            res.send({ validar: true, id: result[0].id_player })
        } else {
            res.send({ validar: false })
        }
    } catch (error) {
        console.log("Error al buscar usuario:", error);
        res.status(500).send({ error: "No se pudo buscar el usuario" });
    }
});

app.post('/registerUser', async function (req, res) {
    console.log(req.body)
    try {
        const existingPlayer = await realizarQuery(`
            SELECT * FROM Players WHERE email = "${req.body.email}";
        `);
        if (existingPlayer.length > 0) {
            res.send({ res: false, message: "Ya existe un usuario con este email" });
            return;
        }
        const insertResult = await realizarQuery(`
            INSERT INTO PLayers (username, email, password, avatar)
            VALUES ("${req.body.username}", "${req.body.email}", "${req.body.password}", "${req.body.avatar}");
        `);
        console.log("Usuario registrado:", insertResult);
        res.send({ res: true, message: "Usuario registrado correctamente" });
    } catch (error) {
        console.log("Error al ingresar", error)
    }
})

app.get('/customersOrder', async function (req, res) {
    try {
        // Obtener un cliente aleatorio de la base de datos
        const result = await realizarQuery(
            `SELECT name, text FROM Customers ORDER BY RAND() LIMIT 1`
        );
        
        // Si no hay clientes en la base de datos
        if (result.length === 0) {
            return res.status(404).json({
                error: 'No hay clientes disponibles'
            });
        }
        
        // Enviar la respuesta con el texto
        res.json({
            id_customer: result[0].id_customer || '',
            customerName: result[0].name || '',
            orderText: result[0].text || ''
        });
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({
            error: 'Error al obtener el pedido'
        });
    }
});


io.on("connection", (socket) => {
    const req = socket.request;
    console.log('Usuario conectado:', socket.id);

    // CREAR SALA
    socket.on("createRoom", async (data) => {
        try {
            const { id_user } = data;

            // Generar código único (6 caracteres)
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Crear la sala en la base
            const queryRoom = `
                INSERT INTO Games (code, idHost)
                VALUES ('${code}', ${id_user})
            `;
            const result = await realizarQuery(queryRoom);

            // Obtener el id_game insertado
            const id_game = result.insertId;

            // Insertar al host en PlayersGame
            const queryPlayer = `
                INSERT INTO PlayersGame (id_player, id_game, id_result)
                VALUES (${id_user}, ${id_game}, NULL)
            `;
            await realizarQuery(queryPlayer);

            // Unir al socket a la sala
            socket.join(code);

            console.log(`✅ Sala creada: ${code} por host ${id_user}`);
            socket.emit("roomCreated", { code, id_game });

            // Obtener jugadores de la sala (por ahora solo el host)
            const jugadores = await realizarQuery(`
                SELECT 
                    p.id_player AS id_user, 
                    p.username, 
                    p.avatar AS image,
                    CASE WHEN p.id_player = g.idHost THEN 1 ELSE 0 END AS esHost
                FROM PlayersGame pg
                JOIN Players p ON pg.id_player = p.id_player
                JOIN Games g ON pg.id_game = g.id_game
                WHERE pg.id_game = ${id_game}
                ORDER BY esHost DESC, p.id_player ASC
            `);

            console.log("📤 Enviando jugadores:", JSON.stringify(jugadores, null, 2));

            // Enviar a todos en la sala
            io.to(code).emit("updatePlayers", jugadores);

        } catch (err) {
            console.error("❌ Error al crear sala:", err);
            socket.emit("errorRoom", "No se pudo crear la sala");
        }
    });

    // UNIRSE A SALA
    socket.on("joinRoom", async (data) => {
        try {
            const { code, id_user } = data;

            // Verificar que la sala existe
            const sala = await realizarQuery(`
                SELECT id_game, idHost FROM Games WHERE code = '${code}'
            `);

            if (sala.length === 0) {
                socket.emit("errorRoom", "La sala no existe");
                return;
            }

            const id_game = sala[0].id_game;

            // Verificar que no haya más de 2 jugadores
            const jugadoresActuales = await realizarQuery(`
                SELECT COUNT(*) as total FROM PlayersGame WHERE id_game = ${id_game}
            `);

            if (jugadoresActuales[0].total >= 2) {
                socket.emit("errorRoom", "La sala está llena");
                return;
            }

            // Verificar que el jugador no esté ya en la sala
            const yaEnSala = await realizarQuery(`
                SELECT * FROM PlayersGame 
                WHERE id_game = ${id_game} AND id_player = ${id_user}
            `);

            if (yaEnSala.length > 0) {
                socket.emit("errorRoom", "Ya estás en esta sala");
                return;
            }

            // Insertar al jugador en la sala
            const queryPlayer = `
                INSERT INTO PlayersGame (id_player, id_game, id_result)
                VALUES (${id_user}, ${id_game}, NULL)
            `;
            await realizarQuery(queryPlayer);

            // Unir al socket a la sala
            socket.join(code);

            console.log(`✅ Jugador ${id_user} se unió a sala ${code}`);
            socket.emit("roomJoined", { code, id_game });

            // Obtener todos los jugadores actualizados
            const jugadores = await realizarQuery(`
                SELECT 
                    p.id_player AS id_user, 
                    p.username, 
                    p.avatar AS image,
                    CASE WHEN p.id_player = g.idHost THEN 1 ELSE 0 END AS esHost
                FROM PlayersGame pg
                JOIN Players p ON pg.id_player = p.id_player
                JOIN Games g ON pg.id_game = g.id_game
                WHERE pg.id_game = ${id_game}
                ORDER BY esHost DESC, p.id_player ASC
            `);

            // Notificar a todos en la sala
            io.to(code).emit("updatePlayers", jugadores);

        } catch (err) {
            console.error("❌ Error al unirse a sala:", err);
            socket.emit("errorRoom", "No se pudo unir a la sala");
        }
    });

    // INICIAR JUEGO
    socket.on("startGame", async (data) => {
        try {
            const { code } = data;

            console.log(`🎮 Iniciando juego en sala ${code}`);

            // Verificar que hay 2 jugadores
            const sala = await realizarQuery(`
                SELECT id_game FROM Games WHERE code = '${code}'
            `);

            if (sala.length === 0) {
                socket.emit("errorRoom", "Sala no encontrada");
                return;
            }

            const id_game = sala[0].id_game;

            const jugadores = await realizarQuery(`
                SELECT COUNT(*) as total FROM PlayersGame WHERE id_game = ${id_game}
            `);

            if (jugadores[0].total < 2) {
                socket.emit("errorRoom", "Se necesitan 2 jugadores para iniciar");
                return;
            }

            // Notificar a todos en la sala que el juego comienza
            io.to(code).emit("gameStart", { code });

        } catch (err) {
            console.error("❌ Error al iniciar juego:", err);
            socket.emit("errorRoom", "No se pudo iniciar el juego");
        }
    });

    // DESCONEXIÓN
    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });
});