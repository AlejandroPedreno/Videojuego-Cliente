window.onload = function(){

    const canvas = document.getElementById("miCanvas");
    const ctx = canvas.getContext("2d");
    const fondo = new Image();
    const tronco = new Image();
    const spriteCastor = new Image();
    spriteCastor.src= "Assets/Images/sprite-castor.png";
    fondo.src = "Assets/Images/Fondo_prueba.avif";
    tronco.src = "Assets/Images/Tronco.png";
    const troncos = [];                                               //Inicializo array de troncos
    let vidas = 3;
    let puntuación = 0;
    let valorClick = 0;                                             //Valor según el tiempo que se mantenga pulsado el click izquierdo 
    let miCastor;
    const TOPEDERECHA = 600;
    let x = 100;                                                    //Posicion inicial
    let y = 300;
    let id;

    pantallaOpacidad = document.getElementById("overlay");
    botonIniciar = document.getElementById("Iniciarpartida");
    botonIniciar.onclick = iniciarPartida;

    fondo.onload = function() {
        ctx.drawImage(fondo, 0, 0, 600, 700); 
        dibujarPuntuación();
        dibujarVidas();
    };

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
        this.animacionCastor = [[0,0],[64,0]];
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


    function activaMovimiento(evt) {                            //Controles del juego

        switch (evt.keyCode) {
		
			// Left arrow.
			case 37: 
			  xIzquierda = true;
			  break;

			// Right arrow.
			case 39:
			  xDerecha = true;
			  break;
		 
			  // Arriba
			case 38:
			  yUp = true;
			  break;

			  // Abajo.
			case 40:
			  yDown = true;
			  break;	
              
              // Espacio
            case 32:
              space = true;
              break;
		}
	}

    function desactivaMovimiento(evt){

        switch (evt.keyCode) {

			// Left arrow
			case 37: 
			  xIzquierda = false;
			  break;

			// Right arrow 
			case 39:
			  xDerecha = false;
			  break;
			  
			  // Arriba
			case 38:
			  yUp = false;
			  break;

			  // Abajo.
			case 40:
			  yDown = false;
			  break;        		
            // Espacio
            case 32:
              space = false;
              break;  
        }
	}

    function pintaRectangulo() {
		
		// borramos el canvas
		ctx.clearRect(0, 0, 500, 500);

        ctx.drawImage(fondo, 0, 0, 600, 700); 

        dibujarPuntuación();
        dibujarVidas();

		
		if (xDerecha) {
			
			miCastor.generaPosicionDerecha();  
		}
		
		if (xIzquierda)  {
			
			miCastor.generaPosicionIzquierda();
		}	  
		
		if (yUp)  {
			
			miCastor.generaPosicionArriba();
		}
		
		if (yDown)  {
			
			miCastor.generaPosicionAbajo();
		}
					  
 		// Pintamos el comecocos
		ctx.drawImage(miCastor.spriteCastor, // Imagen completa con todos los Castor (Sprite)
					  miCastor.animacionCastor[posicion][0],    // Posicion X del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
					  miCastor.animacionCastor[posicion][1],	  // Posicion Y del sprite donde se encuentra el comecocos que voy a recortar del sprite para dibujar
					  miCastor.tamañoX, 		  // Tamaño X del Castor que voy a recortar para dibujar
					  miCastor.tamañoY,	      // Tamaño Y del Castor que voy a recortar para dibujar
					  miCastor.x,      // Posicion x de pantalla donde voy a dibujar el comecocos recortado
					  miCastor.y,	  // Posicion y de pantalla donde voy a dibujar el comecocos recortado
					  miCastor.tamañoX,		  // Tamaño X del Castor que voy a dibujar
					  miCastor.tamañoY);       // Tamaño Y del Castor que voy a dibujar
                    }


    Castor.prototype.spriteCastor = spriteCastor;
    miCastor = new Castor()
    id= setInterval(pintaRectangulo, 1000/50);	
}

