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
        origin: [
            "http://localhost:3000", 
            "http://localhost:3001",
            "http://192.168.0.8:3000",
            "http://192.168.0.175:3000"
        ],
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
            INSERT INTO Players (username, email, password, avatar)
            VALUES ("${req.body.username}", "${req.body.email}", "${req.body.password}", "${req.body.avatar}");
        `);
        console.log("Usuario registrado:", insertResult);
        res.send({ res: true, message: "Usuario registrado correctamente" });
    } catch (error) {
        console.log("Error al ingresar", error)
        res.status(500).send({
            res: false,
            message: "Error al registrar usuario: " + error.message
        })
    }
})

app.get('/customersOrder', async function (req, res) {
    try {
        const result = await realizarQuery(
            `SELECT * FROM Customers ORDER BY RAND() LIMIT 8`
        );
        
        if (result.length === 0) {
            return res.status(404).json({
                error: 'No hay clientes disponibles'
            });
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({
            error: 'Error al obtener el pedido'
        });
    }
});

app.get('/pizzaValidation/:id_pizza', async function (req, res) {
    try {
        const { id_pizza } = req.params
        console.log('Buscando pizza con ID:', id_pizza)

        const result = await realizarQuery(
            `SELECT 
                p.ing1, p.ing2, p.ing3,
                q.quantityIng1, q.quantityIng2, q.quantityIng3
            FROM Pizzas p
            LEFT JOIN QualityPizza q ON p.id_pizza = q.id_pizza
            WHERE p.id_pizza = ${id_pizza}`
        )

        console.log('Resultado de la query:', result)

        if (!result || !Array.isArray(result) || result.length === 0) {
            return res.status(404).json({
                error: 'Pizza no encontrada'
            })
        }

        const data = result[0]

        res.json({
            ingredients: {
                ing1: data.ing1 || null,
                ing2: data.ing2 || null,
                ing3: data.ing3 || null
            },
            quantities: {
                quantityIng1: data.quantityIng1 ?? null,
                quantityIng2: data.quantityIng2 ?? null,
                quantityIng3: data.quantityIng3 ?? null
            },
        })
    } catch (error) {
        console.error('Error completo:', error)
        console.error('Stack trace:', error.stack)
        res.status(500).json({
            error: 'Error al obtener datos de validación',
            detalles: error.message // Útil solo en desarrollo
        })
    }
})


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

    socket.on("pingall", (data) => {
        const { message } = data;
        console.log(`📶 Ping recibido: ${message}`);
        io.emit("pongall", { message: "Pong desde el servidor!" });
    });

    // DESCONEXIÓN
    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });

    // Ahora sí tu handler de gameFinished
    socket.on("gameFinished", async (data) => {
    try {
        console.log("🏁 gameFinished recibido:", data);
        const { playerId, roomCode, totalTime, totalScore, customerTimes, customerScores } = data;

        console.log(`🏁 Jugador ${playerId} terminó en sala ${roomCode}`);
        console.log(`⏱️ Tiempo total: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
        console.log(`⭐ Score total: ${totalScore} puntos`);
        console.log(`📊 Tiempos por cliente:`, customerTimes);
        console.log(`🎯 Scores por cliente:`, customerScores);

        // Obtener el id_game de la sala
        const sala = await realizarQuery(`
            SELECT id_game FROM Games WHERE code = '${roomCode}'
        `);

        if (sala.length === 0) {
            console.error(`❌ Sala ${roomCode} no encontrada`);
            socket.emit("errorGame", "Sala no encontrada");
            return;
        }

        const id_game = sala[0].id_game;
        console.log("✅ id_game obtenido:", id_game);
        // Calcular money basado en el score (puedes ajustar esta lógica)
        // Opción 1: El score es el money directamente
        const money = totalScore;
        
        // Opción 2: Combinar score y tiempo
        // const timeBonus = Math.max(0, 1000 - Math.floor(totalTime / 1000));
        // const money = totalScore + timeBonus;

        // ✅ Convertir milisegundos a formato TIME (HH:MM:SS)
        const totalSeconds = Math.floor(totalTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // ✅ Insertar resultado en ResultxPlayer incluyendo el score
        const insertResult = `
            INSERT INTO ResultxPlayer (time, money, score, id_player, id_game)
            VALUES ('${timeFormatted}', ${money}, ${totalScore}, '${playerId}', ${id_game})
        `;
        const result = await realizarQuery(insertResult);

        console.log(`✅ Resultado guardado para jugador ${playerId}:`);
        console.log(`   - Time: ${timeFormatted} (${totalTime}ms)`);
        console.log(`   - Score: ${totalScore}`);
        console.log(`   - Money: ${money}`);
        console.log(`   - ID Result: ${result.insertId}`);

        // ✅ Notificar al otro jugador con el score incluido
        io.to(roomCode).emit("oponenteTermino", {
            playerId: playerId,
            totalTime: totalTime,
            totalScore: totalScore,
            money: money,
            customerTimes: customerTimes,
            customerScores: customerScores
        });

        console.log(`📤 Notificación enviada a sala ${roomCode}`);

        // Verificar si ambos jugadores terminaron
        const resultados = await realizarQuery(`
            SELECT COUNT(*) as total 
            FROM ResultxPlayer 
            WHERE id_game = ${id_game}
        `);

        if (resultados[0].total === 2) {
            console.log(`🎮 Ambos jugadores terminaron. Determinando ganador...`);

            // ✅ Obtener ambos resultados ordenados por SCORE (mayor a menor)
            // En caso de empate en score, usa el tiempo como desempate
            const finalResults = await realizarQuery(`
                SELECT 
                    r.id_player,
                    r.time,
                    r.money,
                    r.score,
                    p.username
                FROM ResultxPlayer r
                JOIN Players p ON r.id_player = p.id_player
                WHERE r.id_game = ${id_game}
                ORDER BY r.score DESC, r.time ASC
            `);

            const winner = finalResults[0]; // El que tiene mayor score
            const loser = finalResults[1];

            const isTie = winner.score === loser.score && winner.time === loser.time;

            console.log(`🏆 GANADOR: ${winner.username}`);
            console.log(`   - Score: ${winner.score}`);
            console.log(`   - Tiempo: ${winner.time}ms`);
            console.log(`   - Money: ${winner.money}`);
            console.log(`📊 PERDEDOR: ${loser.username}`);
            console.log(`   - Score: ${loser.score}`);
            console.log(`   - Tiempo: ${loser.time}ms`);
            console.log(`   - Money: ${loser.money}`);

            // ✅ Notificar a ambos jugadores el resultado final con score
            io.to(roomCode).emit('finalResults', {
                winner: {
                    id: winner.id_player,
                    username: winner.username,
                    time: winner.time,
                    score: winner.score,
                    money: winner.money
                },
                loser: {
                    id: loser.id_player,
                    username: loser.username,
                    time: loser.time,
                    score: loser.score,
                    money: loser.money
                },
                isTie: isTie
            });

            console.log(`🎊 Resultados finales enviados a sala ${roomCode}`);
        }

    } catch (err) {
        console.error("❌ Error al procesar gameFinished:", err);
        socket.emit("errorGame", "No se pudo guardar el resultado");
    }
});
});