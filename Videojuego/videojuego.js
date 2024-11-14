window.onload = function(){

    const canvas = document.getElementById("miCanvas");
    const ctx = canvas.getContext("2d");
    const fondo = new Image();
    const tronco = new Image();
    fondo.src = "Assets/Images/Fondo_prueba.avif";
    tronco.src = "Assets/Images/Tronco.png";
    let troncos = [];                                               //Inicializo array de troncos

    fondo.onload = function() {
        ctx.drawImage(fondo, 0, 0, 600, 700); 
    };

    tronco.onload = function(){
        ctx.drawImage(tronco, 80, 350, 100, 700);
    }

    function iniciarPartida() {                                     //Función al iniciar la partida
        botonIniciar.style.visibility = "hidden";
        pantallaOpacidad.style.visibility = "hidden";
    }

    function finPartida(){                                          //Función fin de partida sin usar aún
        botonIniciar.style.visibility = "shown";
    }
    pantallaOpacidad = document.getElementById("overlay");
    botonIniciar = document.getElementById("Iniciarpartida");
    botonIniciar.onclick = iniciarPartida;
}