window.onload = function(){

    const canvas = document.getElementById("miCanvas");
    const ctx = canvas.getContext("2d");
    const fondo = new Image();
    const tronco = new Image();
    fondo.src = "Assets/Images/Fondo_prueba.avif";
    tronco.src = "Assets/Images/Tronco.png";
    let troncos = [];                                               //Inicializo array de troncos
    let vidas = 3;
    let puntuación = 0;

    pantallaOpacidad = document.getElementById("overlay");
    botonIniciar = document.getElementById("Iniciarpartida");
    botonIniciar.onclick = iniciarPartida;

    fondo.onload = function() {
        ctx.drawImage(fondo, 0, 0, 600, 700); 
        dibujarPuntuación();
        dibujarVidas();
    };

    tronco.onload = function(){
        ctx.drawImage(tronco, 80, 350, 100, 700);
    }

    function iniciarPartida() {                                     //Función al iniciar la partida
        botonIniciar.style.visibility = "hidden";
        pantallaOpacidad.style.visibility = "hidden";
    }

    function finPartida(){                                          //Función fin de partida sin usar aún
        botonIniciar.style.visibility = "visible";
    }

    function dibujarPuntuación(){
        ctx.font = "18px Arial";
        ctx.fillText("Puntuación: " + puntuación, 10, 20);
        ctx.fillStyle = "#000000";
    }

    function dibujarVidas(){
        ctx.font = "18px Arial";
        for(let i = 0; i < vidas; i++){
            ctx.fillText("❤️", 500 + i*30, 20);
        }
        ctx.fillStyle = "#000000";
    }

    if(vidas == 0){
        finPartida();
    }
    dibujarPuntuación();
}
