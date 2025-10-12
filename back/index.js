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

app.get('/players', async function (req, res) {
    let respuesta;
    if (req.query.id_user != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Players WHERE id_player=${req.query.id_player}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Players");
    }
    res.send(respuesta);
});

app.get('/games', async function (req, res) {
    let respuesta;
    if (req.query.id_user != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Games WHERE id_game=${req.query.id_game}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Games");
    }
    res.send(respuesta);
});

app.get('/customers', async function (req, res) {
    let respuesta;
    if (req.query.id_user != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Customers WHERE id_customer=${req.query.id_customer}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Customers");
    }
    res.send(respuesta);
});

app.get('/playersxgame', async function (req, res) {
    let respuesta;
    if (req.query.id_user != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM PlayersxGame WHERE id_playerxgame=${req.query.id_playerxgame}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM PlayersxGame");
    }
    res.send(respuesta);
});

app.get('/results', async function (req, res) {
    let respuesta;
    if (req.query.id_user != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Results WHERE id_result=${req.query.id_result}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Results");
    }
    res.send(respuesta);
});

app.post('/players', async function (req, res) {
    console.log(req.body);
    try {
        if (req.body.avatar == undefined || req.body.avatar == "") {
            req.body.avatar = null;
        }
        const player = await realizarQuery(`
            INSERT INTO Players (username, email, password, avatar) VALUES
            ('${req.body.username}', '${req.body.email}', '${req.body.password}', '${req.body.avatar}');
        `);
    } catch (error) {
        console.error(error);
    }
});

app.post('/customers', async function (req, res) {
    console.log(req.body);
    try {
        if (req.body.avatar_costumer == undefined || req.body.avatar_costumer == "") {
            req.body.avatar_costumer = null;
        }
        const customer = await realizarQuery(`
            INSERT INTO Customers (name, avatar_costumer, day) VALUES
            ('${req.body.name}', '${req.body.avatar_costumer}', '${req.body.day}');
        `);
    } catch (error) {
        console.error(error);
    }
});


app.post('/games', async function (req, res) {
    console.log(req.body);
    try {
        const game = await realizarQuery(`
            INSERT INTO Games (day) VALUES
            ('${req.body.day}');
        `);
    } catch (error) {
        console.error(error);
    }
});

app.post('/playersxgame', async function (req, res) {
    console.log(req.body);
    try {
        const playerxgame = await realizarQuery(`
            INSERT INTO PlayersxGame (id_player, id_game) VALUES
            ('${req.body.id_player}', '${req.body.id_game}');
        `);
    } catch (error) {
        console.error(error);
    }
});

app.post('/results', async function (req, res) {
    console.log(req.body);
    try {
        const result = await realizarQuery(`
            INSERT INTO Results (id_game, id_player, money, points, time ) VALUES
            ('${req.body.id_game}', '${req.body.id_player}', '${req.body.money}', '${req.body.points}', '${req.body.time}');
        `);
    } catch (error) {
        console.error(error);
    }
});


app.post('/loginUser', async function (req, res) {
    console.log("Resultado de búsqueda:", req.body);
    try {
        const result = await realizarQuery(`
            SELECT * FROM Players WHERE email = "${req.body.email}" AND password = "${req.body.password}";
        `);
        if(result.length > 0){
            res.send({validar: true, id: result[0].id_player})
        } else {
            res.send({validar: false})
        }
    } catch (error) {
        console.log("Error al buscar usuario:", error);
        res.status(500).send({error: "No se pudo buscar el usuario"});
    }
});

app.post('/registerUser', async function (req,res) {
    console.log(req.body)
    try{
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
    } catch(error){
        console.log("Error al ingresar",error)
    }
})

io.on("connection", (socket) => {
    const req = socket.request;
    console.log('Usuario conectado:', socket.id);

    socket.on('joinRoom', data => {
        console.log("🚀 ~ io.on ~ req.session.room:", req.session.room)
        if (req.session.room != undefined && req.session.room.length > 0){
            socket.leave(req.session.room);
        }
        req.session.room = data.room;
        socket.join(req.session.room);

        console.log("Usuario se unió a sala:", req.session.room);

        // También unirse a la sala específica del chat
        socket.join(data.room);
        console.log("Usuario también en sala específica:", data.room);

        // Notificar a todos en la sala
        io.to(req.session.room).emit('chat-messages', {
            user: req.session.user,
            room: req.session.room,
            joined: true
        });
    });

    socket.on('pingAll', data => {
        console.log("PING ALL: ", data);
        io.emit('pingAll', { event: "Ping to all", message: data });
    });

    socket.on('sendMessage', (data) => {
		io.to(req.session.room).emit("newMessage", { 
            room: req.session.room, 
            message: data 
        });

        realizarQuery(`
            INSERT INTO Messages (photo, date, id_user, content, id_chat) VALUES
                (${data.photo != undefined ? "" : null},'${data.date}',${data.userId},'${data.content}', '${data.chatId}');
        `);
        const existingRelation = realizarQuery(`
            SELECT * FROM UsersxChat WHERE id_user = ${data.userId} AND id_chat = ${data.chatId}
        `);
        if (existingRelation.length === 0) {
            realizarQuery(`
                INSERT INTO UsersxChat (id_user, id_chat) VALUES
                (${data.userId}, ${data.chatId});
            `);
        }

	});

    socket.on('disconnect', () => {
        console.log("Usuario desconectado:", socket.id);
    })
});