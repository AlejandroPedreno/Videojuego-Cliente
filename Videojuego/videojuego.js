window.onload = function () {
    //VARIABLES GLOBALES
    const canvas = document.getElementById("miCanvas");
    const ctx = canvas.getContext("2d");

    const fondo = new Image();
    const spriteCastor = new Image();
    const tronco = new Image();

    const troncos = [];

    fondo.src = "Assets/Images/Fondo_prueba.avif";
    spriteCastor.src = "Assets/Images/sprite-castor.png";
    tronco.src = "Assets/Images/Tronco.png";

    let vidas = 3;
    let puntuación = 0;
    let juegoIniciado = false;
    let x = 100;                  // Posición inicial del castor
    let y = 570;
    let posicion = 0;
    let castor;
    let intervaloEstático = false;
    let intervaloCaminando = false;
    let intervaloConstruyendo = false;
    let idIntervaloEstático;
    let idIntervaloCaminando;
    let idIntervaloConstruyendo;
    let velocidadAngular = 0;
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Parámetros del tronco generado por el jugador
    let linea = { x: 0, y: 600, height: 0, angle: 0, creciendo: false, cayendo: false };

    // Parámetros del castor
    function Castor(x_, y_) {
        this.x = x_;
        this.y = y_;
        this.width = 45;
        this.height = 40;
        this.cruzando = false;  // Indica si el castor está cruzando la línea
        this.animacionCastorNormal = [
            [3, 14], [52, 14], [105, 14]     //Posicion normal
        ];
        this.animacionCastorCaminando = [
            [3, 73], [55, 75], [110, 71], [159, 70], [206, 73], [257, 75], [309, 71], [362, 70]   //Posicion caminando
        ];
        this.animacionCastorConstruyendo = [
            [153, 16], [3, 200], [53, 204], [3, 200]    //Posicion construyendo
        ];
    }

    tronco.width = 30;
    tronco.height = 50;


    //REFERENCIAS A HTML

    const pantallaOpacidad = document.getElementById("overlay");
    const botonIniciar = document.getElementById("Iniciarpartida");
    const sonidoPasos = document.getElementById("Pasos");
    const sonidoFondo = document.getElementById("SonidoFondo");
    const sonidoConstruyendo = document.getElementById("SonidoConstruyendo");

    sonidoPasos.playbackRate = 2;
    sonidoFondo.loop = true;
    sonidoFondo.volume = 0.3;
    sonidoConstruyendo.playbackRate = 0.65;
    sonidoConstruyendo.volume = 0.5;

    botonIniciar.onclick = iniciarPartida;

    fondo.onload = function () {
        dibujarFondo();
    };

    function iniciarSonido(sonido) {
        sonido.currentTime = 0;
        sonido.play();
    }

    function detenerSonido(sonido) {
        sonido.pause();
        sonido.currentTime = 0;
    }


    //FUNCIONES

    function iniciarPartida() {                    //Inicia la partida  
        iniciarSonido(sonidoFondo);

        juegoIniciado = true;
        botonIniciar.style.visibility = "hidden";
        pantallaOpacidad.style.visibility = "hidden";
        crearPlataformas();
        linea.x = troncos[0].x + troncos[0].width;
        gameLoop();
    }

    function gameLoop() {                   //Bucle principal del juego
        if (!juegoIniciado) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dibujarFondo();
        dibujarPlataformas();
        dibujarLinea();
        if (linea.creciendo && !castor.cruzando) {
            dibujarConstruyendo();
        } else if (castor.cruzando && !linea.creciendo) {
            dibujarCaminando();
        } else {
            dibujarCastor();
        }

        moverCastor();
        dibujarPuntuación();
        dibujarVidas();
        requestAnimationFrame(gameLoop);
    }

    function finPartida() {                            //Finaliza la partida                                
        detenerSonido(sonidoFondo);
        botonIniciar.style.visibility = "visible";
        pantallaOpacidad.style.visibility = "visible";

        troncos.length = 0;

        linea.height = 0;
        linea.angle = 0;
        linea.creciendo = false;
        linea.cayendo = false;

        vidas = 3;
        actualizarLeaderboard(puntuación);
        puntuación = 0;

        castor.cruzando = false;
        castor.x = 100;
        castor.y = 570;

        clearInterval(idIntervaloEstático);
        clearInterval(idIntervaloCaminando);
        clearInterval(idIntervaloConstruyendo);
        intervaloEstático = false;
        intervaloCaminando = false;
        intervaloConstruyendo = false;
    }

    function actualizarLeaderboard(nuevaPuntuacion) {                   //Actualiza el marcador         
        leaderboard.push(nuevaPuntuacion);

        leaderboard.sort((a, b) => b - a);

        leaderboard = leaderboard.slice(0, 5);

        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

        mostrarLeaderboard();
    }

    function mostrarLeaderboard() {                                          //Muestra el marcador            
        const leaderboardUl = document.getElementById("leaderboard");
        leaderboardUl.innerHTML = "";

        leaderboard.forEach((score) => {
            const li = document.createElement("li");
            if (score != 1) {
                li.textContent = `${score} puntos`;
            } else {
                li.textContent = `${score} punto`;
            }
            leaderboardUl.appendChild(li);
        });

    }


    //DIBUJAR

    function dibujarFondo() {                                   //Dibuja el fondo del juego
        ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
    }

    function dibujarPuntuación() {                              //Dibuja la puntuación del jugador


        ctx.fillStyle = "lightgrey";
        ctx.fillRect(15, 15, 166, 26);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(15, 15, 166, 26);

        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Puntuación: " + puntuación, 18, 36);

    }

    function dibujarVidas() {                        //Dibuja las vidas del jugador     
        ctx.font = "18px Arial";
        ctx.fillStyle = "lightgrey";
        ctx.fillRect(999, 15, 85, 25);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(999, 15, 85, 25);

        for (let i = 0; i < vidas; i++) {
            ctx.fillText("❤️", 1000 + i * 30, 33);
        }
    }

    function dibujarPlataformas() {                     //Dibuja las plataformas

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

    function animarCaida() {                        //Animación de caída del tronco generado por el jugador
        const factorAceleracion = 1.05;
        if (linea.angle < Math.PI / 2) {
            velocidadAngular *= factorAceleracion;
            linea.angle += velocidadAngular;
            requestAnimationFrame(animarCaida);
        } else {
            linea.angle = Math.PI / 2;
            verificarCruce();
        }
    }

    velocidadAngular += 0.01 * Math.pow(linea.angle, 2);            //Aumenta la velocidad de caída del tronco

    function dibujarLinea() {                       //Dibuja la linea que genera el jugador
        if (linea.creciendo) {

            colisionTroncoTecho();
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

    //ANIMACIONES

    //Valores según la longitud de cada sprite

    function animacionEstática() {
        posicion = (posicion + 1) % castor.animacionCastorNormal.length;
    }

    function animacionCaminando() {
        posicion = (posicion + 1) % castor.animacionCastorCaminando.length;
    }

    function animacionConstruyendo() {
        posicion = (posicion + 1) % castor.animacionCastorConstruyendo.length;
    }

    function iniciarAnimaciónEstática() {               //Inicia la animación del castor en su posición normal
        if (!intervaloEstático) {
            if (idIntervaloCaminando) {
                clearInterval(idIntervaloCaminando);
            }
            if (idIntervaloConstruyendo) {
                clearInterval(idIntervaloConstruyendo);
            }
            intervaloEstático = true;
            intervaloCaminando = false;
            intervaloConstruyendo = false;
            idIntervaloEstático = setInterval(animacionEstática, 1000 / 6);
        }
    }

    function iniciarAnimaciónCaminando() {              //Inicia la animación del castor caminando
        if (!intervaloCaminando) {
            if (idIntervaloEstático) {
                clearInterval(idIntervaloEstático);
            }
            if (idIntervaloConstruyendo) {
                clearInterval(idIntervaloConstruyendo);
            }
            intervaloCaminando = true;
            intervaloEstático = false;
            intervaloConstruyendo = false;
            idIntervaloCaminando = setInterval(animacionCaminando, 1000 / 24);
        }
    }

    function iniciarAnimaciónConstruyendo() {               //Inicia la animación del castor construyendo
        if (!intervaloConstruyendo) {
            if (idIntervaloEstático) {
                clearInterval(idIntervaloEstático);
            }
            if (idIntervaloCaminando) {
                clearInterval(idIntervaloCaminando);
            }
            intervaloConstruyendo = true;
            intervaloCaminando = false;
            intervaloEstático = false;
            idIntervaloConstruyendo = setInterval(animacionConstruyendo, 1000 / 10);
        }
    }

    function dibujarCastor() {                      //Dibuja al castor moviéndose en su posición normal
        iniciarAnimaciónEstática();
        if (posicion > 2) {
            posicion = 0;
        }

        if (posicion == 0) {
            castor.width = 46;
            castor.height = 40;
        } else if (posicion == 1) {
            castor.width = 49;
            castor.height = 40;
        } else if (posicion == 2) {
            castor.width = 45;
            castor.height = 39;
        }
        ctx.drawImage(castor.imagen,
            castor.animacionCastorNormal[posicion][0],
            castor.animacionCastorNormal[posicion][1],
            castor.width,
            castor.height,
            castor.x,
            castor.y + 3,
            castor.width,
            castor.height);

    }
    function dibujarCaminando() {                           //Dibuja al castor caminando
        iniciarAnimaciónCaminando();
        if (posicion == 0) {
            castor.width = 49;
            castor.height = 40;
        } else if (posicion == 1) {
            castor.width = 51;
            castor.height = 38;
        } else if (posicion == 2) {
            castor.width = 45;
            castor.height = 42;
        } if (posicion == 3) {
            castor.width = 43;
            castor.height = 43;
        } else if (posicion == 4) {
            castor.width = 47;
            castor.height = 40;
        } else if (posicion == 5) {
            castor.width = 49;
            castor.height = 38;
        } if (posicion == 6) {
            castor.width = 49;
            castor.height = 42;
        } else if (posicion == 7) {
            castor.width = 47;
            castor.height = 43;
        }
        if (posicion <= 7) {
            ctx.drawImage(castor.imagen,
                castor.animacionCastorCaminando[posicion][0],
                castor.animacionCastorCaminando[posicion][1],
                castor.width,
                castor.height,
                castor.x,
                castor.y + 3,
                castor.width,
                castor.height);
        }
    }

    function dibujarConstruyendo() {                    //Dibuja al castor construyendo
        iniciarAnimaciónConstruyendo();
        if (posicion == 0) {
            castor.width = 44;
            castor.height = 38;
        } else if (posicion == 1) {
            castor.width = 47;
            castor.height = 33;
        } else if (posicion == 2) {
            castor.width = 50;
            castor.height = 29;
        } else if (posicion == 3) {
            castor.width = 47;
            castor.height = 33;
        }
        if (posicion <= 3) {
            ctx.drawImage(castor.imagen,
                castor.animacionCastorConstruyendo[posicion][0],
                castor.animacionCastorConstruyendo[posicion][1],
                castor.width,
                castor.height,
                castor.x,
                castor.y + 3,
                castor.width,
                castor.height);
        }
    }

    //MOVIMIENTO
    function moverCastor() {
        if (castor.cruzando) {
            if (sonidoPasos.paused) {
                iniciarSonido(sonidoPasos);
            }

            const distanciaRecorrida = 5;
            castor.x += distanciaRecorrida;
            if (castor.x >= troncos[1].x + troncos[1].width / 2 - castor.width / 2) {
                castor.cruzando = false;
                moverPlataformas(distanciaRecorrida);
                detenerSonido(sonidoPasos);
            }
        }
    }

    function moverPlataformas(distanciaRecorrida) {
        // Mover todos los troncos hacia la izquierda por la distancia recorrida y elimina el primer tronco
        troncos.forEach(tronco => {
            tronco.x -= distanciaRecorrida;
        });
        troncos.shift();

        // Genera un nuevo tronco al final del array
        let ancho = Math.random() * 100 + 50;
        let xPos = troncos[troncos.length - 1].x + troncos[troncos.length - 1].width + Math.random() * 100 + 50;
        troncos.push({ x: xPos, y: 600, width: ancho, height: 200 });
        
        castor.x = troncos[0].x + troncos[0].width / 2 - castor.width / 2;

        reiniciarLinea();
    }


    //OTRAS FUNCIONES

    function verificarCruce() {                             //Comprueba si el tronco generado cae encima de la siguiente plataforma
        let vericidad = colisionTroncoPlataforma();
        if (vericidad == true) {
            console.log(colisionTroncoPlataforma());
            permitirPasoCastor();
        } else {
            vidas--;
            if (vidas <= 0) finPartida();
            else reiniciarLinea();
        }
    }

    function reiniciarLinea() {         //La linea que genera el jugador vuelve a su posición inicial
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
        }, 500);
    }

    function crearPlataformas() {
        for (let i = 0; i < 10; i++) {
            let ancho = Math.random() * 100 + 50;
            let distanciaMinima = 120;
            let distanciaMaxima = 200;
            let lastTronco = troncos[troncos.length - 1];
            let distanciaAleatoria = Math.random() * (distanciaMaxima - distanciaMinima) + distanciaMinima;
            let xPos;           // Posición x de la primera pltaforma   

            if (i === 0) {
                xPos = 50;
            } else {
                xPos = lastTronco.x + lastTronco.width + distanciaAleatoria;
            }
            
            troncos.push({ x: xPos, y: 600, width: ancho, height: 200 });
        }

        // Castor sobre la primera plataforma
        castor.x = troncos[0].x + troncos[0].width / 2 - castor.width / 2;
        castor.y = troncos[0].y - castor.height; 
    }

    function moverEscenario() {
        const velocidad = 5;
        const distancia = castor.x - 100;
        const intervalo = setInterval(() => {

            // Mueve las plataformas hacia la izquierda

            troncos.forEach(tronco => {
                tronco.x -= velocidad;
            });

            // Mueve el tronco hacia la izquierda
            linea.x -= velocidad;

            // Mueve el castor hacia la izquierda
            castor.x -= velocidad;

            // Si el castor llega a su posición inicial deja de moverse el escenario
            if (castor.x <= 100) {
                castor.x = 100;
                clearInterval(intervalo);
            }
        }, 16);
    }


    //EVENTOS
    canvas.addEventListener("mousedown", () => {            //Cuando se pulsa el ratón se genera un tronco hacia arriba
        if (juegoIniciado && !linea.cayendo) {
            iniciarSonido(sonidoConstruyendo);
            linea.creciendo = true;
        }
    });

    canvas.addEventListener("mouseup", () => {              //Cuando se deja de pulsar el ratón el tronco deja de crecer y cae hacia la derecha
        if (juegoIniciado && linea.creciendo) {
            detenerSonido(sonidoConstruyendo);
            linea.creciendo = false;
            linea.cayendo = true;
            velocidadAngular = Math.PI / 160;
            requestAnimationFrame(animarCaida);
        }
    });


    //COLISIONES

    function colisionTroncoPlataforma() {
        const troncoSuperior = linea.height;
        const plataformaInicial = linea.x + linea.height * Math.cos(linea.angle);
        console.log(troncoSuperior);
        const plataformaIzquierda = troncos[1].x + (0.2767 * troncos[1].width);             //He sacado el 27,67% en GIMP, dejando fuera la parte del tronco no visible
        const plataformaDerecha = troncos[1].x + (0.8 * troncos[1].width);                  //He sacado el 80% en GIMP, dejando fuera la parte del tronco no visible
        const plataformaArriba = troncos[1].y;
        console.log(plataformaIzquierda);
        console.log(plataformaInicial);
        console.log(plataformaIzquierda - plataformaInicial);
        if (troncoSuperior >= (plataformaIzquierda - plataformaInicial) && troncoSuperior <= (plataformaDerecha - plataformaInicial)) {
            return true;
        } else {
            return false;
        }
    }
    function colisionTroncoTecho() {
        if (linea.y - linea.height <= 0) {
            linea.creciendo = false;
            linea.cayendo = true;

            velocidadAngular = Math.PI / 160;
            requestAnimationFrame(animarCaida);
        }
    }


    //INICIALIZACIÓN

    imagen = new Image();
    imagen.src = "Assets/Images/sprite-castor.png";
    Castor.prototype.imagen = imagen;
    castor = new Castor(x, y);
    mostrarLeaderboard();
};