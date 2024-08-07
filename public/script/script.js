import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';


let usuario = localStorage.getItem('usuario');

if (!usuario) {
    // Si no hay usuario en el localStorage, pide el nombre al usuario
    usuario = prompt("Ingrese su usuario");
    // Guarda el nombre de usuario en el localStorage
    localStorage.setItem('usuario', usuario);
}

const socket = io({
    auth: {
        user: usuario,
        serverOffset: 0
    }
});

const form = document.getElementById("form");
const input = document.getElementById("input");
const mensajes = document.getElementById("mensajes");

socket.on("chat message", ({ msg, user, id }) => {
    const items = `<li>
    <small>${user}</small>
     ${msg} 
     </li>`;
    mensajes.insertAdjacentHTML("beforeend", items); //inserta el mensaje en una posición específica, relativa al elemento que llama, "beforeend" debe ser insertado justo antes del final del elemento
    socket.auth.serverOffset = id;
    // Baja hasta el último mensaje
    mensajes.scrollTop = mensajes.scrollHeight;
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (input.value) {
        socket.emit("chat message", { msg: input.value, user: usuario });
        input.value = " ";
    }
});



