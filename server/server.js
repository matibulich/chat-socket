import express from "express";

import logger from "morgan"; //logger
import path from "path";
import { createClient } from "@libsql/client"; //turso base sql
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = process.env.PORT || 3000;

const server = createServer(app); //crea el servidor http
const io = new Server(server, { connectionStateRecovery: {} }); //crea el socket server

//db de turso(SQL) config.

const db = createClient({
  url: "libsql://promoted-comet-matibulich.turso.io",
  authToken: process.env.DB_TOKEN,
});
//CREACION DE TABLA
await db.execute(`CREATE TABLE IF NOT EXISTS mensajes(
    id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, user TEXT
    )`);

io.on("connection", async (socket) => {
  console.log("Usuario conectado");

  const usuario = socket.handshake.auth.user;

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });

  socket.on("chat message", async ({msg, user}) => {
    let resultado;
    try {
      resultado = await db.execute({
        sql: `INSERT INTO mensajes (content, user) VALUES (:msg, :user)`, //(:msg) remplazado por el valor verdadero del mensaje
        args: { msg, user:usuario },
      });
      // console.log("Mensaje insertado en la base de datos");
    } catch (error) {
      console.error(error);
      return;
    }

    io.emit("chat message",{ msg, user:usuario});
 
    //recupera los mensajes sin conexion
    
  });

  if (!socket.recovered) {
    try {
     const resultados = await db.execute({
       sql: "SELECT id , content, user FROM mensajes WHERE id > ?",
       args: [socket.handshake.auth.serverOffset ?? 0],
     });

     resultados.rows.forEach((row) => {
       socket.emit("chat message",{msg:row.content, user: row.user, id: row.id.toString()});
     });
   } catch (error) {
     console.error(error);
     return;
   }
 }

});

app.use(logger("dev"));

//carpeta de archivos estaticos
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

server.listen(port, () => {
  //Le pasamos que escuche el server en vez de app
  console.log(`Servidor corriendo en el puerto http://localhost:${port}`);
});
