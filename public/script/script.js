import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';
const socket = io({
    auth:{
        serverOffset:0
    }
})

const form = document.getElementById("form")
const input = document.getElementById("input")
const mensajes = document.getElementById("mensajes")

const usuario = prompt("Ingrese su usuario")

socket.on("chat message", ({msg, user, id})=>{
    const items = `<li>
    <small>${user}</small>
     ${msg} 
     </li>`
    mensajes.insertAdjacentHTML("beforeend", items)//inserta el mensaje en una posicion especifica, relativa al elemento que llama, "beforeend" debe ser insertado justo antes del final del elemento
    socket.auth.serverOffset = id
    //baja hasta el ultimo mensaje
    mensajes.scrollTop = mensajes.scrollHeight
})


form.addEventListener("submit", (e)=>{
    e.preventDefault()

    if(input.value){
        socket.emit("chat message", { msg:input.value, user:usuario} )
        input.value=" "
    }
})

