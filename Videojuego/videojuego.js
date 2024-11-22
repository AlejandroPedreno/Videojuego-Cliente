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

  // Parámetros del tronco generado por el jugador
  let linea = { x: 0, y: 600, height: 0, angle: 0, creciendo: false, cayendo: false };

  // Parámetros del castor (Es una prueba, hay que pasarlo a objeto)
  let castor = { x: 100, y: 570, width: 30, height: 30, cruzando: false};

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

      dibujarFondo();
      dibujarPlataformas();
      dibujarLinea();
      dibujarCastor();
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
      linea.height=0;
      vidas=3;
  }

  //DIBUJAR
  function dibujarFondo() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        linea.x = (primerTronco.x + primerTronco.width / 2)+10;
        linea.y = primerTronco.y + 4;

    ctx.save();
    ctx.translate(linea.x, linea.y);
    if (linea.cayendo) ctx.rotate(linea.angle);

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
      ctx.drawImage(spriteCastor, castor.x, castor.y, castor.width, castor.height);
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


    // Eliminar el primer tronco del array
    troncos.shift();

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
      moverCastor();
  }

  function crearPlataformas() {
    for (let i = 0; i < 5; i++) {
        let ancho = Math.random() * 100 + 50;
        let xPos = i === 0 ? 50 : troncos[troncos.length - 1].x + troncos[troncos.length - 1].width + Math.random() * 100 + 50;
        troncos.push({ x: xPos, y: 600, width: ancho, height: 200 }); 
    }
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
    // Coordenadas del píxel superior derecho del objeto
    const troncoDerecha = linea.x + linea.width;

    // Coordenadas de la plataforma
    const plataformaIzquierda = plataforma.x;
    const plataformaDerecha = plataforma.x + plataforma.width;


    // Comprobar si el píxel superior derecho del objeto toca la parte superior de la plataforma
    if (troncoDerecha >= plataformaIzquierda && troncoDerecha <= plataformaDerecha) {
        return true;
    }
    return false;
}

};
