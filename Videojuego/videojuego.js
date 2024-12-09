window.onload = function () {

    //VARIABLES GLOBALES

    // Elementos del DOM

    const canvas = document.getElementById("miCanvas");
    const ctx = canvas.getContext("2d");

    const pantallaOpacidad = document.getElementById("overlay");
    const botonIniciar = document.getElementById("Iniciarpartida");
    const sonidoPasos = document.getElementById("Pasos");
    const sonidoFondo = document.getElementById("SonidoFondo");
    const sonidoConstruyendo = document.getElementById("SonidoConstruyendo");
    const sonidoExplosion = document.getElementById("SonidoExplosion");
    const sonidoSalto = document.getElementById("SonidoSalto");
    const sonidoVidaExtra = document.getElementById("SonidoVida");

    // Configuración de sonidos
    sonidoPasos.playbackRate = 2;
    sonidoFondo.loop = true;
    sonidoFondo.volume = 0.3;
    sonidoConstruyendo.playbackRate = 0.65;
    sonidoConstruyendo.volume = 0.5;
    sonidoSalto.volume = 0.2;

    // Imágenes del juego
    const fondo = new Image();
    const spriteCastor = new Image();
    const tronco = new Image();

    fondo.src = "Assets/Images/Fondo_prueba.avif";
    spriteCastor.src = "Assets/Images/sprite-castor.png";
    tronco.src = "Assets/Images/Tronco.png";

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Anchura y altura de la imagen del tronco que genera el jugador
    tronco.width = 30;
    tronco.height = 50;

    // Parámetros del juego
    let vidas = 3;
    let puntuación = 0;
    let juegoIniciado = false;

    //Intervalos de animación del castor
    let intervaloEstático = false;
    let intervaloCaminando = false;
    let intervaloConstruyendo = false;
    let intervaloSaltando = false;
    let idIntervaloEstático;
    let idIntervaloCaminando;
    let idIntervaloConstruyendo;
    let idIntervaloSaltando;

    let idIntervaloBomba;              
    let idIntervaloVidasExtra;

    let velocidadAngular = 0;    // Velocidad de caída del tronco
    let linea = { x: 0, y: 600, height: 0, angle: 0, creciendo: false, cayendo: false };    // Parámetros del tronco que genera el jugador

    const troncos = [];         //Array donde se almacenan todas las plataformas

    //Variables del castor
    let castor;
    let x = 100;
    let y = 570;
    let posicion = 0;

    // Parámetros de la bomba
    let bomba;
    let probabilidadBomba = 0;
    let x_Bomba = 0;
    let y_Bomba = 0;
    let posicionBomba = 0;
    let posicionExplosion = 0;
    let anchoCanvas = 0;
    let altoCanvas = 0;
    const bombas = [];                  //Array donde se almacenan todas las bombas

    //Variables de las vidas extra
    let x_VidasExtra = 110;
    let y_VidasExtra = 450;
    let vidasExtra;
    let probabilidadVidasExtra = 0.1;
    let posicionSpriteVidasExtra = 0;
    const vidasExtraArray = [];         //Array donde se almacenan todas las vidas extra

    //Variables de salto
    let velocidadSalto = 15;
    let gravedad = 1;
    let cooldown = 1100;                //Tiempo de espera entre saltos
    let puedeSaltar = true;

    //CLASES

    // Clase Castor
    function Castor(x_, y_) {
        this.x = x_;
        this.y = y_;
        this.width = 45;
        this.height = 40;
        this.cruzando = false;  // Indica si el castor está cruzando la línea
        this.saltando = false;
        this.animacionCastorNormal = [
            [3, 14], [52, 14], [105, 14]     //Posicion normal
        ];
        this.animacionCastorCaminando = [
            [3, 73], [55, 75], [110, 71], [159, 70], [206, 73], [257, 75], [309, 71], [362, 70]   //Posicion caminando
        ];
        this.animacionCastorConstruyendo = [
            [153, 16], [3, 200], [53, 204], [3, 200]    //Posicion construyendo
        ];
        this.animacionCastorSaltando = [
            [3, 133], [52, 128], [86, 128], [125, 131], [176, 128], [228, 128], [264, 140], [312, 135]     //h:47 w:46 ; h:52 w:31 ; h:48 w:36 ; h:33 w:48 ; h:43 w:48 ; h:53 w:33; h:41 w:45; h:38 w:48
        ]
    }

    // Clase Bomba
    function Bomba(x_, y_) {
        this.x = x_;
        this.y = y_;
        this.width = 12;
        this.height = 12;
        this.animacionBomba = [
            [33, 99], [134, 95]
        ];
        this.animacionExplosion = [
            [33, 99], [134, 95], [235, 68], [383, 50], [571, 30], [820, 70]
        ];

        this.explotando = false;
        this.cuadroActual = 0;
        this.ultimoTiempo = Date.now();
        this.sonidoReproducido = false;
    }

    // Clase Vidas Extra
    function VidasExtra(x_, y_) {
        this.x = x_;
        this.y = y_;
        this.width = 25;
        this.height = 25;
        this.spriteVidasExtra = [
            [17, 25], [186, 27], [354, 25], [522, 25], [691, 25], [57, 188], [198, 187], [354, 187], [509, 187], [665, 188] //w: 115 h: 110
        ];
    }


    //FUNCIONES

    // Bucle principal del juego
    function gameLoop() {
        if (!juegoIniciado) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dibujarFondo();
        dibujarPlataformas();
        dibujarLinea();
        dibujarBomba();
        dibujarVidasExtra();
        verificarColisionBombas();
        verificarColisionVidasExtra();
        if (castor.saltando) {
            if (sonidoSalto.paused) {
                iniciarSonido(sonidoSalto);
            }
            realizarSalto();
            dibujarSaltando();
        } else if (linea.creciendo && !castor.cruzando) {
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

    //Funcion para iniciar la partida
    function iniciarPartida() {
        iniciarSonido(sonidoFondo);

        juegoIniciado = true;
        botonIniciar.style.visibility = "hidden";
        pantallaOpacidad.style.visibility = "hidden";
        crearPlataformas();
        linea.x = troncos[0].x + troncos[0].width;
        gameLoop();
    }

    //Función para finalizar la partida
    function finPartida() {
        detenerSonido(sonidoFondo);
        botonIniciar.style.visibility = "visible";
        pantallaOpacidad.style.visibility = "visible";

        troncos.length = 0;
        bombas.length = 0;
        vidasExtraArray.length = 0;

        probabilidadBomba = 0.3;

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
        clearInterval(idIntervaloSaltando);
        intervaloEstático = false;
        intervaloCaminando = false;
        intervaloConstruyendo = false;
        intervaloSaltando = false;
    }

    //Funciones de reproducción del sonido
    function iniciarSonido(sonido) {
        sonido.currentTime = 0;
        sonido.play();
    }

    function detenerSonido(sonido) {
        sonido.pause();
        sonido.currentTime = 0;
    }

    //Funciones de la tabla de puntuaciones

    //Actualiza el marcador
    function actualizarLeaderboard(nuevaPuntuacion) {
        leaderboard.push(nuevaPuntuacion);

        leaderboard.sort((a, b) => b - a);

        leaderboard = leaderboard.slice(0, 10);

        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

        mostrarLeaderboard();
    }

    //Muestra el marcador
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


    //Animación de caída del tronco generado por el jugador
    function animarCaida() {
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

    function verificarCruce() {                             //Comprueba si el tronco generado cae encima de la siguiente plataforma
        let vericidad = colisionTroncoPlataforma();
        if (vericidad == true) {
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

    //Funcion que es llamada cuando se le permite el paso al castor
    function permitirPasoCastor() {
        castor.cruzando = true;
        puntuación++;

        // Espera a que termine de cruzar antes de mover el escenario
        setTimeout(() => {
            moverEscenario();
        }, 750);
    }

    //FUNCIONES DIBUJAR
    //Dibuja el fondo del juego
    function dibujarFondo() {
        ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);
    }

    //Dibuja la puntuación actual del jugador
    function dibujarPuntuación() {
        let incremento = 0;                                     //Aumenta el tamaño de la barra de puntuación según la puntuación para evitar que se salga del marco
        if (puntuación >= 100) {
            incremento = 28;
        } else if (puntuación >= 10) {
            incremento = 12;
        }
        ctx.fillStyle = "lightgreen";                            //Rectangulo del fondo
        ctx.fillRect(50, 55, 240 + incremento, 60);

        ctx.strokeStyle = "black";                              //Borde del rectangulo
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 55, 240 + incremento, 60);

        ctx.font = "28px Arial";                                 //Texto de la puntuación                        
        ctx.fillStyle = "black";
        ctx.fillText("PUNTUACIÓN: " + puntuación, 60, 95);

    }

    //Dibuja las vidas actuales del jugador
    function dibujarVidas() {
        ctx.font = "50px Arial";
        ctx.fillStyle = "lightgreen";
        ctx.fillRect(845, 55, 200, 60);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(845, 55, 200, 60);

        for (let i = 0; i < vidas; i++) {
            ctx.fillText("❤️", 850 + i * 60, 100);
        }
    }

    //Dibuja las plataformas
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

    //Dibuja la linea que genera el jugador
    function dibujarLinea() {
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

    //Funcion para dibujar las bombas
    function dibujarBomba() {
        bombas.forEach((bomba, index) => {
            if (!bomba.explotando) {                                         // Dibuja bomba normal
                if (posicionBomba == 0) {                                    //Según la posición del sprite, tiene un tamaño u otro
                    anchoCanvas = 66;
                    altoCanvas = 63;
                    if (puntuación < 10) {
                        bomba.width = 20;
                        bomba.height = 20;
                    } else if (puntuación > 10 && puntuación < 20) {
                        bomba.width = 25;
                        bomba.height = 25;
                    } else {
                        bomba.width = 30;
                        bomba.height = 30;
                    }
                } else if (posicionBomba == 1) {
                    anchoCanvas = 75;
                    altoCanvas = 70;
                    if (puntuación < 10) {
                        bomba.width = 22;
                        bomba.height = 22;
                    } else if (puntuación > 10 && puntuación < 20) {
                        bomba.width = 27;
                        bomba.height = 27;
                    } else {
                        bomba.width = 33;
                        bomba.height = 33;
                    }
                }
                ctx.drawImage(
                    bomba.imagen,
                    bomba.animacionBomba[posicionBomba][0],
                    bomba.animacionBomba[posicionBomba][1],
                    anchoCanvas,
                    altoCanvas,
                    bomba.x,
                    bomba.y - bomba.height,
                    bomba.width,
                    bomba.height
                );
            } else {                                                            //Animacion de bomba explotando
                if (bomba.cuadroActual === 0 && !bomba.sonidoReproducido) {
                    iniciarSonido(sonidoExplosion);
                    bomba.sonidoReproducido = true;
                }
                let cuadro = bomba.cuadroActual;
                let anchoCanvas = 200;
                let altoCanvas = 200;

                ctx.drawImage(
                    bomba.imagen,
                    bomba.animacionExplosion[cuadro][0],
                    bomba.animacionExplosion[cuadro][1],
                    anchoCanvas,
                    altoCanvas,
                    bomba.x,
                    bomba.y - bomba.height,
                    bomba.width,
                    bomba.height
                );

                if (Date.now() - bomba.ultimoTiempo > 150) {        // Velocidad en la que cambia el sprite de la explosión de la bomba
                    bomba.cuadroActual++;
                    bomba.ultimoTiempo = Date.now();
                }

                if (bomba.cuadroActual >= bomba.animacionExplosion.length) {       // Elimina la bomba del array cuando termina la animación
                    vidas--;
                    bombas.splice(index, 1);
                    if (vidas <= 0) finPartida();
                }
            }
        });
    }

    //Funcion para dibujar las vidas extra
    function dibujarVidasExtra() {
        vidasExtraArray.forEach((vidasExtra, index) => {
            anchoCanvas = 115;
            altoCanvas = 110;
            vidasExtra.width = 20;
            vidasExtra.height = 20;
            vidasExtra.y = 450;
            ctx.drawImage(
                vidasExtra.imagen,
                vidasExtra.spriteVidasExtra[posicionSpriteVidasExtra][0],
                vidasExtra.spriteVidasExtra[posicionSpriteVidasExtra][1],
                anchoCanvas,
                altoCanvas,
                vidasExtra.x,
                vidasExtra.y,
                vidasExtra.width,
                vidasExtra.height
            );
        }
        )
    };


    //FUNCIONES DE MOVIMIENTO
    //Funcion que desplaza al castor
    function moverCastor() {
        if (castor.cruzando) {
            if (sonidoPasos.paused) {
                iniciarSonido(sonidoPasos);
                if (castor.saltando === true) {
                    detenerSonido(sonidoPasos);
                }
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

    // Funcion que mueve todas las plataformas hacia la izquierda según la distancia recorrida y elimina la primera plataforma
    function moverPlataformas(distanciaRecorrida) {
        troncos.forEach(tronco => {
            tronco.x -= distanciaRecorrida;
        });
        bombas.forEach(bomba => {
            bomba.x -= distanciaRecorrida;
        });
        vidasExtraArray.forEach(vidasExtra => {
            vidasExtra.x -= distanciaRecorrida;
        });
        troncos.shift();
        let ancho = 0;
        // Genera un nuevo tronco al final del array
        if (puntuación < 25) {                         //Al llegar a 25 puntos los troncos se generan más finos para aumentar la dificultad del juego
            ancho = Math.random() * 100 + 50;
        } else {
            ancho = Math.random() * 10 + 50;
        }
        let xPos = troncos[troncos.length - 1].x + troncos[troncos.length - 1].width + Math.random() * 100 + 50;
        troncos.push({ x: xPos, y: 600, width: ancho, height: 200 });

        castor.x = troncos[0].x + troncos[0].width / 2 - castor.width / 2;

        // Tras conseguir un punto, se empiezan a generar bombas al final del array de plataformas
        if (puntuación >= 1) {
            actualizarProbabilidadBomba();
            generarBomba();
        }
        generarVidasExtra();    //Genera vidas extra tras mover las plataformas
        reiniciarLinea();       //Reinicia la línea que genera el jugador
    }

    //FUNCIONES GENERADORAS
    //Funcion que crea las plataformas y las almacena en el array de troncos
    function crearPlataformas() {
        for (let i = 0; i < 8; i++) {
            let ancho = Math.random() * 100 + 50;
            let distanciaMinima = 120;
            let distanciaMaxima = 200;
            let lastTronco = troncos[troncos.length - 1];
            let distanciaAleatoria = Math.random() * (distanciaMaxima - distanciaMinima) + distanciaMinima;
            let xPos;                   // Posición x de la primera pltaforma   

            if (i === 0) {              //La primera plataforma se encuentra en x=50
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

    //Funcion que genera las bombas y las almacena en el array de bombas
    function generarBomba() {
        if (Math.random() < probabilidadBomba) {
            const ultimoTronco = troncos[troncos.length - 1];
            const penultimoTronco = troncos[troncos.length - 2];

            // Calcula posición entre el penúltimo y último tronco
            const posicionX = ((penultimoTronco.x + penultimoTronco.width * 0.53835) - bomba.width / 2) + (((ultimoTronco.x + ultimoTronco.width * 0.53835) - bomba.width / 2) - ((penultimoTronco.x + penultimoTronco.width * 0.53835) - bomba.width / 2)) / 2;

            const posicionY = penultimoTronco.y - 10;

            const nuevaBomba = new Bomba(posicionX, posicionY);             //Hace las bombas más grandes según la puntuación para agregar dificultad al juego
            if (puntuación < 10) {
                nuevaBomba.width = 20;
                nuevaBomba.height = 20;
            } else if (puntuación > 10 && puntuación < 20) {
                nuevaBomba.width = 25;
                nuevaBomba.height = 25;
            } else if (puntuación > 20) {
                nuevaBomba.width = 30;
                nuevaBomba.height = 30;
            }

            bombas.push(nuevaBomba);

        }
    }

    //Funcion que genera las vidas extra y las almacena en el array de vidas extra
    function generarVidasExtra() {
        if (Math.random() <= probabilidadVidasExtra) {              //Genera vidas extra según la probabilidad (10%)
            const ultimoTronco = troncos[troncos.length - 1];
            const penultimoTronco = troncos[troncos.length - 2];

            // Calcula posición entre el penúltimo y último tronco
            const posicionX = ((penultimoTronco.x + penultimoTronco.width * 0.53835) - vidasExtra.width / 2) + (((ultimoTronco.x + ultimoTronco.width * 0.53835) - vidasExtra.width / 2) - ((penultimoTronco.x + penultimoTronco.width * 0.53835) - vidasExtra.width / 2)) / 2;

            const posicionY = penultimoTronco.y - 10;

            const nuevaVidasExtra = new VidasExtra(posicionX, posicionY);

            vidasExtraArray.push(nuevaVidasExtra);

        }
    }

    //Funcion que mueve todos los elementos del escenario a la izquierda
    function moverEscenario() {
        const velocidad = 5;
        const intervalo = setInterval(() => {

            // Mueve las plataformas hacia la izquierda
            troncos.forEach(tronco => {
                tronco.x -= velocidad;
            });

            // Mueve el tronco generado por el jugador hacia la izquierda
            linea.x -= velocidad;

            // Mueve el castor hacia la izquierda
            castor.x -= velocidad;

            //Mueve las bombas hacia la izquierda
            bombas.forEach((bomba, index) => {
                bomba.x -= velocidad;

                // Elimina bombas fuera del escenario
                if (bomba.x + bomba.width < 0) {
                    bombas.splice(index, 1);
                }
            });

            // Mueve las vidas extra hacia la izquierda
            vidasExtraArray.forEach((vidasExtra, index) => {
                vidasExtra.x -= velocidad;

                // Elimina las vidas extra fuera del escenario
                if (vidasExtra.x + vidasExtra.width < 0) {
                    vidasExtraArray.splice(index, 1);
                }
            });

            // Si el castor llega a su posición inicial deja de moverse el escenario
            if (castor.x <= 100) {
                castor.x = 100;
                clearInterval(intervalo);
            }
        }, 16);
    }

    //FUNCIONES DE LOS MOVIMIENTOS DEL CASTOR
    //Dibuja al castor moviéndose en su posición normal
    function dibujarCastor() {
        iniciarAnimaciónEstática();
        if (posicion > 2) {             //Si posicion tiene un valor mayor a 2, se reinicia a 0 para evitar errores
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

    //Dibuja al castor caminando
    function dibujarCaminando() {
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

    //Dibuja al castor construyendo
    function dibujarConstruyendo() {
        iniciarAnimaciónConstruyendo();
        if (posicion == 0) {            //Depende de la posición del sprite, tiene un tamaño u otro
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

    //Dibuja al castor saltando
    function dibujarSaltando() {
        iniciarAnimaciónSaltando();
        if (posicion == 0) {
            castor.width = 46;
            castor.height = 47;
        } else if (posicion == 1) {
            castor.width = 31;
            castor.height = 52;
        } else if (posicion == 2) {
            castor.width = 36;
            castor.height = 48;
        } else if (posicion == 3) {
            castor.width = 48;
            castor.height = 33;
        } else if (posicion == 4) {
            castor.width = 48;
            castor.height = 43;
        } else if (posicion == 5) {
            castor.width = 33;
            castor.height = 53;
        } else if (posicion == 6) {
            castor.width = 45;
            castor.height = 41;
        } else if (posicion == 7) {
            castor.width = 48;
            castor.height = 38;
        }
        if (posicion <= 7) {
            ctx.drawImage(castor.imagen,
                castor.animacionCastorSaltando[posicion][0],
                castor.animacionCastorSaltando[posicion][1],
                castor.width,
                castor.height,
                castor.x,
                castor.y + 3,
                castor.width,
                castor.height);
        }

    }

    //FUNCIONES ANIMACIONES

    //Valores según la longitud de cada sprite:
    //Animaciones del castor
    function animacionEstática() {
        posicion = (posicion + 1) % castor.animacionCastorNormal.length;
    }
    function animacionCaminando() {
        posicion = (posicion + 1) % castor.animacionCastorCaminando.length;
    }
    function animacionConstruyendo() {
        posicion = (posicion + 1) % castor.animacionCastorConstruyendo.length;
    }
    function animacionSaltando() {
        posicion = (posicion + 1) % castor.animacionCastorSaltando.length;
    }
    //Animaciones de las bombas
    function animacionBombaEstatica() {
        posicionBomba = (posicionBomba + 1) % bomba.animacionBomba.length;
    }
    function animacionBombaExplotando() {
        posicionExplosion = (posicionExplosion + 1) % bomba.animacionExplosion.length;
    }
    //Animaciones de las vidas extra
    function animacionVidasExtra() {
        posicionSpriteVidasExtra = (posicionSpriteVidasExtra + 1) % vidasExtra.spriteVidasExtra.length;
    }

    //Inicia la animación del castor en su posición normal
    function iniciarAnimaciónEstática() {
        if (!intervaloEstático) {
            if (idIntervaloCaminando) {
                clearInterval(idIntervaloCaminando);
            }
            if (idIntervaloConstruyendo) {
                clearInterval(idIntervaloConstruyendo);
            }
            if (idIntervaloSaltando) {
                clearInterval(idIntervaloSaltando);
            }
            intervaloEstático = true;
            intervaloCaminando = false;
            intervaloConstruyendo = false;
            intervaloSaltando = false;
            idIntervaloEstático = setInterval(animacionEstática, 1000 / 8);
        }
    }

    //Inicia la animación del castor caminando:
    function iniciarAnimaciónCaminando() {
        if (!intervaloCaminando) {
            if (idIntervaloEstático) {
                clearInterval(idIntervaloEstático);
            }
            if (idIntervaloConstruyendo) {
                clearInterval(idIntervaloConstruyendo);
            }
            if (idIntervaloSaltando) {
                clearInterval(idIntervaloSaltando);
            }
            intervaloCaminando = true;
            intervaloEstático = false;
            intervaloConstruyendo = false;
            intervaloSaltando = false;
            idIntervaloCaminando = setInterval(animacionCaminando, 1000 / 24);
        }
    }

    //Inicia la animación del castor construyendo
    function iniciarAnimaciónConstruyendo() {
        if (!intervaloConstruyendo) {
            if (idIntervaloEstático) {
                clearInterval(idIntervaloEstático);
            }
            if (idIntervaloCaminando) {
                clearInterval(idIntervaloCaminando);
            }
            if (idIntervaloSaltando) {
                clearInterval(idIntervaloSaltando);
            }
            intervaloConstruyendo = true;
            intervaloCaminando = false;
            intervaloEstático = false;
            intervaloSaltando = false;
            idIntervaloConstruyendo = setInterval(animacionConstruyendo, 1000 / 10);
        }
    }

    //Inicia la animación del castor saltando
    function iniciarAnimaciónSaltando() {
        if (!intervaloSaltando) {
            if (idIntervaloEstático) {
                clearInterval(idIntervaloEstático);
            }
            if (idIntervaloCaminando) {
                clearInterval(idIntervaloCaminando);
            }
            if (idIntervaloConstruyendo) {
                clearInterval(idIntervaloConstruyendo);
            }
            intervaloSaltando = true;
            intervaloEstático = false;
            intervaloCaminando = false;
            intervaloConstruyendo = false;
            idIntervaloSaltando = setInterval(animacionSaltando, 1000 / 6);
        }
    }

    //OTRAS FUNCIONES

    //Funcion que incrementa exponencialmente la probabilidad de que aparezcan bombas, para aumenrar la dificultad del juego de forma progresiva
    function actualizarProbabilidadBomba() {
        probabilidadBomba = Math.min(1, 0.35 + puntuación * 0.005);
    }

    //Funcion que realiza el salto del castor
    function realizarSalto() {
        if (castor.saltando) {

            castor.y -= velocidadSalto;
            velocidadSalto -= gravedad;

            if (velocidadSalto <= 0) {          //Si la velocidad de salto es menor o igual a 0, el castor empieza a caer
                velocidadSalto -= gravedad;
            }

            if (castor.y >= 560) {              //El castor deja de caer cuando llega al suelo
                castor.y = 560;
                castor.saltando = false;
                velocidadSalto = 15;
                posicion = 0;
            }
        }
    }

    //COLISIONES

    //Colisiones del tronco generado por el jugador con las plataformas
    function colisionTroncoPlataforma() {
        const troncoSuperior = linea.height;
        const plataformaInicial = linea.x + linea.height * Math.cos(linea.angle);
        const plataformaIzquierda = troncos[1].x + (0.28 * troncos[1].width);             //He sacado el 28% en GIMP, dejando fuera la parte del tronco no visible
        const plataformaDerecha = troncos[1].x + (0.8 * troncos[1].width);                  //He sacado el 80% en GIMP, dejando fuera la parte del tronco no visible
        if (troncoSuperior >= (plataformaIzquierda - plataformaInicial) && troncoSuperior <= (plataformaDerecha - plataformaInicial)) {
            return true;
        } else {
            return false;
        }
    }

    //Colisiones del tronco generado por el jugador con el techo
    function colisionTroncoTecho() {
        if (linea.y - linea.height <= 0) {
            linea.creciendo = false;
            linea.cayendo = true;

            velocidadAngular = Math.PI / 160;
            requestAnimationFrame(animarCaida);
        }
    }

    //Colision de las bombas con el castor
    function verificarColisionBombas() {
        bombas.forEach((bomba, index) => {
            if (castor.x < bomba.x + bomba.width &&
                castor.x + castor.width > bomba.x &&
                castor.y < bomba.y + bomba.height &&
                castor.y + castor.height > bomba.y) {
                iniciarSonido(sonidoExplosion);
                bomba.explotando = true;
            }
        });
    }
    //Colision de las vidas extra con el castor
    function verificarColisionVidasExtra() {
        vidasExtraArray.forEach((vidasExtra, index) => {
            if (castor.x < vidasExtra.x + vidasExtra.width &&
                castor.x + castor.width > vidasExtra.x &&
                castor.y < vidasExtra.y + vidasExtra.height &&
                castor.y + castor.height > vidasExtra.y) {
                if (vidas < 3) {                        //Solo puede tener un máximo de 3 vidas
                    vidas++;
                }
                iniciarSonido(sonidoVidaExtra);
                vidasExtraArray.splice(index, 1);
            }
        });
    }


    // EVENTOS

    //Carga el fondo del juego
    fondo.onload = function () {
        dibujarFondo();
    };

    // Inicia la partida al hacer click en el botón
    botonIniciar.onclick = iniciarPartida;

    //Cuando se pulsa el ratón se genera un tronco hacia arriba
    canvas.addEventListener("mousedown", () => {
        if (juegoIniciado && !linea.cayendo) {
            iniciarSonido(sonidoConstruyendo);
            linea.creciendo = true;
        }
    });

    //Cuando se deja de pulsar el ratón el tronco deja de crecer y cae hacia la derecha
    canvas.addEventListener("mouseup", () => {
        if (juegoIniciado && linea.creciendo) {
            detenerSonido(sonidoConstruyendo);
            linea.creciendo = false;
            linea.cayendo = true;
            velocidadAngular = Math.PI / 160;
            requestAnimationFrame(animarCaida);
        }
    });

    //Cuando se pulsa la barra espaciadora el castor salta
    document.addEventListener("keydown", (event) => {
        if (event.code === "Space" && !castor.saltando && juegoIniciado && puedeSaltar) {
            castor.saltando = true;
            puedeSaltar = false;

            realizarSalto();

            setTimeout(() => {
                puedeSaltar = true;
            }, cooldown);
        }
    });

    //INICIALIZACIÓN

    //Le asigna la imagen del sprite al castor
    imagen = new Image();
    imagen.src = "Assets/Images/sprite-castor.png";
    Castor.prototype.imagen = imagen;
    castor = new Castor(x, y);

    //Le asigna la imagen del sprite a la bomba
    imagenBomba = new Image();
    imagenBomba.src = "Assets/Images/sprite-bomba.png";
    Bomba.prototype.imagen = imagenBomba;
    bomba = new Bomba(x_Bomba, y_Bomba);

    //Le asigna la imagen del sprite a las vidas extra
    imagenVidasExtra = new Image();
    imagenVidasExtra.src = "Assets/Images/sprite-vidas.png";
    VidasExtra.prototype.imagen = imagenVidasExtra;
    vidasExtra = new VidasExtra(x_VidasExtra, y_VidasExtra);

    mostrarLeaderboard();       //Llama a la función que muestra el marcador

    //Aumenta la velocidad de caída del tronco:
    velocidadAngular += 0.01 * Math.pow(linea.angle, 2);

    //Asigna los intervalos de las animaciones
    //Intervalos de las bombas
    idIntervaloBomba = setInterval(animacionBombaEstatica, 1000 / 6);
    idIntervaloBomba = setInterval(animacionBombaExplotando, 1000 / 0.2);
    //Intervalo de las vidas extra
    idIntervaloVidasExtra = setInterval(animacionVidasExtra, 1000 / 6);

};