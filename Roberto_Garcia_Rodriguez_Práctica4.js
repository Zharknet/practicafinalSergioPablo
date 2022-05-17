import { WORDS } from "./words.js";

window.onload = () =>{
    let refresh = document.getElementById('refresh');
    refresh.addEventListener('click', _ => {

        //document.getElementById("mimg").src= "portrait2.jpg";
        //document.getElementById("inicio").style.display = "flex"
        localStorage.setItem("replay","true");

    
        setTimeout(()=> {
            location.reload().window;
        }, 10)

        }
    
    )

    const NUMERO_DE_INTENTOS = 6;
    let intentosRestantes = NUMERO_DE_INTENTOS;
    let intentoActual = [];
    let siguienteLetra = 0;
    let palabras = WORDS 
    //console.log(palabras)
    let palabraCorrecta = palabras[Math.floor(Math.random()*palabras.length)]
    //console.log(palabraCorrecta)
    var cont_enter = 0;

    
    function iniciar(){
            document.getElementById("inicio").style.display = "none"
            document.getElementById("refresh").style.display = "flex"
            
    }
    
    //Funcion la cual carga las casillas donde se introducen las letras
    function iniciarTablero() {
        let board = document.getElementById("cajas");
        document.getElementById("mimg").src= "portrait.jpg";

        if(localStorage.getItem("replay") == "true"){
            iniciar();
            cont_enter ++;
            localStorage.setItem("replay","false");
        }
        
        for (let i = 0; i < NUMERO_DE_INTENTOS; i++) {
            let row = document.createElement("div")
            row.className = "letter-row"
            
            for (let j = 0; j < 5; j++) {
                let box = document.createElement("div")
                box.className = "letter-box"
                row.appendChild(box)
            }
    
            board.appendChild(row)
        }
    }
    
    //cambia el color de las teclas del teclado en pantalla
    function sombrearTeclado(letter, color) {
        for (const elem of document.getElementsByClassName("boton-teclado")) {
            if (elem.textContent === letter) {
                let oldColor = elem.style.backgroundColor
                if (oldColor === 'green') {
                    return
                } 
    
                if (oldColor === 'yellow' && color !== 'green') {
                    return
                }
    
                elem.style.backgroundColor = color
                break
            }
        }
    }

    //permite borrar la letra introducida en una casilla
    function borrarLetra () {
        let row = document.getElementsByClassName("letter-row")[6 - intentosRestantes]
        let box = row.children[siguienteLetra - 1]
        box.textContent = ""
        box.classList.remove("filled-box")
        intentoActual.pop()
        siguienteLetra -= 1
    }

    //comprueba si las letras introducidas aparecen en la palabra a descubrir
    function comprobarIntento () {
        let row = document.getElementsByClassName("letter-row")[6 - intentosRestantes]
        let guessString = ''
        let rightGuess = Array.from(palabraCorrecta)
    
        for (const val of intentoActual) {
            guessString += val
        }
    
        if (guessString.length != 5) {
            toastr.error("LETRAS INSUFICIENTES!")
            return
        }
    
        if (!WORDS.includes(guessString)) {
            toastr.error("NO ESTA EN LA LISTA!")
            return
        }
    
        
        for (let i = 0; i < 5; i++) {
            let letterColor = ''
            let box = row.children[i]
            let letter = intentoActual[i]
            
            let letterPosition = rightGuess.indexOf(intentoActual[i])
            // comprobar si se encuentra en la posicion
            if (letterPosition === -1) {
                letterColor = 'grey'
            } else {
                // la letra se encuentra en la palabra, comprobamos si esta en la posicion correcta
                if (intentoActual[i] === rightGuess[i]) {
                    // posicion correcta pintamos el div de verde 
                    letterColor = 'green'
                } else {
                    // posicion incorrecta pintamos de amarillo
                    letterColor = 'yellow'
                }
    
                rightGuess[letterPosition] = "#"
            }
    
            let delay = 250 * i
            setTimeout(()=> {
                //animacion de giro de la caja
                animateCSS(box, 'flipInX')
                //animacion de sombreado de caja
                box.style.backgroundColor = letterColor
                sombrearTeclado(letter, letterColor)
            }, delay)
        }
    
        if (guessString === palabraCorrecta) {
            toastr.success("HAS ACERTADO! SE ACABO!")
            toastr.info("PULSA EL BOTON PARA VOLVER A JUGAR")
            intentosRestantes = 0
            
            return
        } else {
            intentosRestantes -= 1;
            intentoActual = [];
            siguienteLetra = 0;
    
            if (intentosRestantes === 0) {
                toastr.error("TE HAS QUEDADO SIN INTENTOS! MAS SUERTE LA PROXIMA!")
                toastr.info(`LA PALABRA ERA: "${palabraCorrecta}"`)
                document.getElementById("respuesta").innerHTML = `LA RESPUESTA ERA : "${palabraCorrecta}"`
            }
        }
    }

    //introduce la letra tecleada en la casilla
    function insertarLetra (pressedKey) {
        if (siguienteLetra === 5) {
            return
        }
        pressedKey = pressedKey.toLowerCase()
    
        let row = document.getElementsByClassName("letter-row")[6 - intentosRestantes]
        let box = row.children[siguienteLetra]
        animateCSS(box, "pulse")
        box.textContent = pressedKey
        box.classList.add("filled-box")
        intentoActual.push(pressedKey)
        siguienteLetra += 1
    }

    //concurrencia para que se ejecute la animacion por medio de una promesa y asegurar su finalizacion
    const animateCSS = (element, animation, prefix = 'animate__') =>
      new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        // const node = document.querySelector(element);
        const node = element
        node.style.setProperty('--animate-duration', '0.3s');
        
        node.classList.add(`${prefix}animated`, animationName);
    
        
        function handleAnimationEnd(event) {
          event.stopPropagation();
          node.classList.remove(`${prefix}animated`, animationName);
          resolve('Animation ended');
        }
    
        node.addEventListener('animationend', handleAnimationEnd, {once: true});
    });

    //listener que registra las diferentes acciones del usuario con el teclado, como borrar letras, enviar la palabra introducida o insertar la letra
    document.addEventListener("keyup", (e) => {
        

        if (intentosRestantes === 0) {
            return
        }
    
        let pressedKey = String(e.key)
        if (pressedKey === "Backspace" && siguienteLetra !== 0) {
            borrarLetra()
            return
        }
    
        if (pressedKey === "Enter") {
            if(cont_enter == 0){
                iniciar()
                cont_enter ++;
            }else{
                comprobarIntento()
            }
            return
        }
    
        let found = pressedKey.match(/[a-zA-Z]/g)
        if (!found || found.length > 1) {
            return
        } else {
            insertarLetra(pressedKey)
        }
    })

    //registra la letra introducida por medio del teclado virtual que se muestra en el navegador en la casilla correspondiente
    document.getElementById("teclado").addEventListener("click", (e) => {
        const target = e.target
        
        if (!target.classList.contains("boton-teclado")) {
            return
        }
        let key = target.textContent
    
        if (key === "Del") {
            key = "Backspace"
        } 
    
        document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
    })
    iniciarTablero();
    
}

