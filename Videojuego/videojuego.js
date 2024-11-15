window.onload = function(){

    const canvas = document.getElementById("miCanvas");
    const ctx = canvas.getContext("2d");
    const fondo = new Image();
    const tronco = new Image();
    fondo.src = "Assets/Images/Fondo_prueba.avif";
    tronco.src = "Assets/Images/Tronco.png";
    const troncos = [];                                               //Inicializo array de troncos
    let vidas = 3;
    let puntuación = 0;
    let valorClick = 0;                                             //Valor según el tiempo que se mantenga pulsado el click izquierdo 
    let miCastor;
    const TOPEDERECHA = 600;

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
        ctx.fillStyle = "lightblue";
        ctx.fillRect(499, 2, 85, 25);
        for(let i = 0; i < vidas; i++){
            ctx.fillText("❤️", 500 + i*30, 20);

        }
    }

    if(vidas == 0){
        finPartida();
    }

    function Castor (x_, y_) {
	
        this.x = x_;
        this.y = y_;
        this.animacionCastor = [[0,0],[32,0]];
        this.velocidad = 1.4;
        this.tamañoX   = 30;
        this.tamañoY   = 30;	  
      
      }

    Castor.prototype.generaPosicionDerecha = function() {

		this.x = this.x + this.velocidad;
		
		if (this.x > TOPEDERECHA) {

			this.x = TOPEDERECHA;   	
		}		

	}
	

	Castor.prototype.generaPosicionIzquierda = function() {
		
		this.x = this.x - this.velocidad;

		if (this.x < 0) {

			this.x = 0;	   
		}

	}
}

