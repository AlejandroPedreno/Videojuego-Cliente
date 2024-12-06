window.onload = function () {
    //VARIABLES GLOBALES
    const canvas = document.getElementById("miCanvas");
    const ctx = canvas.getContext("2d");

    const fondo = new Image();
    const spriteCastor = new Image();
    const tronco = new Image();

    fondo.src = "Assets/Images/Fondo_prueba.avif";
    spriteCastor.src = "Assets/Images/sprite-castor.png";
    tronco.src = "Assets/Images/Tronco.png";

    const troncos = [];

    let vidas = 3;
    let puntuación = 0;
    let juegoIniciado = false;
    let x = 100;                  // Posición inicial del castor
    let y = 570;
    let posicion = 0;
    let castor;


    // Parámetros del tronco generado por el jugador
    let linea = { x: 0, y: 600, height: 0, angle: 0, creciendo: false, cayendo: false };

    // Parámetros del castor
    function Castor(x_, y_) {
        this.x = x_;
        this.y = y_;
        this.width = 45;
        this.height = 40;
        this.cruzando = false;  // Indica si el castor está cruzando la línea
        this.construyendo = false;  // Indica si el castor está construyendo la línea
        this.animacionCastor = [
            [3, 14], [52, 14], [105, 14],     //Posicion normal
            [0, 65], [32, 65],
            [0, 95], [32, 95],
            [0, 32], [32, 32]];
    }

    tronco.width = 30;
    tronco.height = 50;

    //REFERENCIAS A HTML
    const pantallaOpacidad = document.getElementById("overlay");
    const botonIniciar = document.getElementById("Iniciarpartida");

    botonIniciar.onclick = iniciarPartida;

    fondo.onload = function () {
        dibujarFondo();
    };

    //FUNCIONES
    function iniciarPartida() {
        juegoIniciado = true;
        botonIniciar.style.visibility = "hidden";
        pantallaOpacidad.style.visibility = "hidden";
        crearPlataformas();
        linea.x = troncos[0].x + troncos[0].width;
        gameLoop();
    }

    function gameLoop() {
        if (!juegoIniciado) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dibujarFondo();
        dibujarPlataformas();
        dibujarLinea();
        /*    if(castor.cruzando == true){
            
            }else if(castor.construyendo == true){
                
            }else{*/
        dibujarCastor();
        //       }
        moverCastor();
        dibujarPuntuación();
        dibujarVidas();

        requestAnimationFrame(gameLoop);
    }

    function finPartida() {
        juegoIniciado = false;
        botonIniciar.style.visibility = "visible";
        pantallaOpacidad.style.visibility = "visible";
        troncos.length = 0;
        linea.height = 0;
        vidas = 3;
    }

    //DIBUJAR
    function dibujarFondo() {
        ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
    }

    function dibujarPuntuación() {
        ctx.font = "18px Arial";
        ctx.fillStyle = "#000";
        ctx.fillText("Puntuación: " + puntuación, 10, 20);
    }

    function dibujarVidas() {
        ctx.font = "18px Arial";
        ctx.fillStyle = "lightblue";
        ctx.fillRect(499, 2, 85, 25);
        for (let i = 0; i < vidas; i++) {
            ctx.fillText("❤️", 500 + i * 30, 20);
        }
    }

    function dibujarPlataformas() {

        troncos.forEach((plataforma) => {

            ctx.drawImage(
                tronco,
                plataforma.x,
                plataforma.y,
                plataforma.width,
                plataforma.height
            );
        });
    }

    function dibujarLinea() {
        if (linea.creciendo) {
            linea.height += 4;
        }
        const primerTronco = troncos[0];
        linea.x = (primerTronco.x + primerTronco.width / 2) + 10;
        linea.y = primerTronco.y + 4;

        ctx.save();
        ctx.translate(linea.x, linea.y);
        if (linea.cayendo) {
            ctx.rotate(linea.angle);

        }

        ctx.drawImage(
            tronco,
            -tronco.width / 2,
            -linea.height,
            tronco.width,
            linea.height
        );
        ctx.restore();
    }

    function dibujarCastor() {
        ctx.drawImage(castor.imagen,
            castor.animacionCastor[posicion][0],
            castor.animacionCastor[posicion][1],
            castor.width,
            castor.height,
            castor.x,
            castor.y+3,
            castor.width,
            castor.height);
    }

    function animaciónEstática() {
        posicion = (posicion + 1) % 3;        posicion = (posicion + 1) % 3;
        if (posicion == 0) {
        castor.width = 46;
        castor.height = 40;
        }else if (posicion == 1) {
        castor.width = 49;
        castor.height = 40;
        }else if (posicion == 2) {
        castor.width = 45;
        castor.height = 39;
        }
    }

        id = setInterval(animaciónEstática, 1000 / 6);

        function dibujarCaminando() {


        }

        function dibujarConstruyendo() {

        }

        //MOVIMIENTO
        function moverCastor() {
            if (castor.cruzando) {
                const distanciaRecorrida = 5;
                castor.x += distanciaRecorrida;
                if (castor.x >= troncos[1].x + troncos[1].width / 2 - castor.width / 2) {
                    castor.cruzando = false;
                    moverPlataformas(distanciaRecorrida);
                }
            }
        }

        function moverPlataformas(distanciaRecorrida) {
            // Mover todos los troncos hacia la izquierda por la distancia recorrida
            troncos.forEach(tronco => {
                tronco.x -= distanciaRecorrida;
            });


            troncos.shift();

            console.log(canvas.width);
            // Generar un nuevo tronco al final del array
            let ancho = Math.random() * 100 + 50;
            let xPos = troncos[troncos.length - 1].x + troncos[troncos.length - 1].width + Math.random() * 100 + 50;
            troncos.push({ x: xPos, y: 600, width: ancho, height: 200 });

            // Reposicionar el castor en el centro del primer tronco
            castor.x = troncos[0].x + troncos[0].width / 2 - castor.width / 2;

            // Reiniciar la línea
            reiniciarLinea();
        }

        //OTRAS FUNCIONES
        function verificarCruce() {
            const plataformaSiguiente = troncos[1];
            if (colisionTroncoPlataforma) {
                permitirPasoCastor();
            } else {
                vidas--;
                if (vidas <= 0) finPartida();
                else reiniciarLinea();
            }
        }

        function reiniciarLinea() {
            linea.height = 0;
            linea.angle = 0;
            linea.creciendo = false;
            linea.cayendo = false;
        }

        function permitirPasoCastor() {
            castor.cruzando = true;
            puntuación++;

            // Espera a que termine de cruzar antes de mover el escenario
            setTimeout(() => {
                moverEscenario();
            }, 500); // Ajusta el tiempo según la duración del cruce
        }


        function crearPlataformas() {
            for (let i = 0; i < 10; i++) {
                let ancho = Math.random() * 100 + 50; // Anchura aleatoria
                let distanciaMinima = 120; // Distancia mínima entre plataformas
                let distanciaMaxima = 200; // Distancia máxima entre plataformas
                let xPos =
                    i === 0
                        ? 50 // Primera plataforma siempre cerca
                        : troncos[troncos.length - 1].x + troncos[troncos.length - 1].width + Math.random() * (distanciaMaxima - distanciaMinima) + distanciaMinima;

                troncos.push({ x: xPos, y: 600, width: ancho, height: 200 });
            }

            // Castor sobre la primera plataforma
            castor.x = troncos[0].x + troncos[0].width / 2 - castor.width / 2; // Centrado sobre la primera plataforma
            castor.y = troncos[0].y - castor.height; // Justo encima de la plataforma
        }


        function moverEscenario() {
            const velocidad = 5;
            const distancia = castor.x - 100;
            const intervalo = setInterval(() => {

                troncos.forEach(tronco => {
                    tronco.x -= velocidad;
                });

                // Mueve también la línea
                linea.x -= velocidad;

                // Actualiza la posición del castor para simular desplazamiento del entorno
                castor.x -= velocidad;

                // Si el castor llega a su posición inicial, detén el desplazamiento
                if (castor.x <= 100) {
                    castor.x = 100; // Asegura que esté exactamente en la posición inicial
                    clearInterval(intervalo); // Detiene la animación
                }
            }, 16); // Aproximadamente 60 fps
        }


        //EVENTOS
        canvas.addEventListener("mousedown", () => {
            if (juegoIniciado && !linea.cayendo) {
                linea.creciendo = true;
            }
        });

        canvas.addEventListener("mouseup", () => {
            if (juegoIniciado && linea.creciendo) {
                linea.creciendo = false;
                linea.cayendo = true;
                linea.angle = Math.PI / 2;                // Rotar 90°

                setTimeout(() => {
                    verificarCruce();
                }, 500);
            }
        });

        //COLISIONES
        function colisionTroncoPlataforma() {
            const troncoSuperior = linea.y - linea.height;
            const troncoDerecha = linea.x;

            const plataforma = troncos[1]; // Siguiente plataforma
            const plataformaIzquierda = plataforma.x;
            const plataformaDerecha = plataforma.x + plataforma.width;

            return (troncoSuperior >= plataforma.y &&
                troncoDerecha >= plataformaIzquierda &&
                troncoDerecha <= plataformaDerecha);
        }




        imagen = new Image();
        imagen.src = "Assets/Images/sprite-castor.png";
        Castor.prototype.imagen = imagen;

        castor = new Castor(x, y);

    };
