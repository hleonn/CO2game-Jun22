import { Actors } from './classes/Actors.js';
import { Poka } from './classes/Poka.js';
import { GameTrack } from './classes/GameTrack.js';
import { Hamburger } from './classes/Hamburger.js';
import { Coca } from './classes/Coca.js';
import { Donuts } from './classes/Donuts.js';
import { Potatos } from './classes/Potatos.js';
import { Joku } from './classes/Joku.js';
import { Rat } from './classes/Rat.js';
import { Cucaracha } from './classes/Cucaracha.js'; // IMPORTANTE: Debe estar presente
import { GameOverCard } from './classes/GameOverCard.js';
import { MuerteScene } from './classes/MuerteScene.js';

const botonSalir = {
    x: 750, // Posición diferente a pausa
    y: 10,
    w: 40,
    h: 30
};
// ===== CONSTANTES =====
const canvas = document.getElementById("workArea");
const ctx = canvas.getContext("2d");
const soundtrack = new Audio('./audio/main.mp3');

const CANVAS_DIMENSIONS = { width: 900, height: 600 };
const POKA_VIDA_INICIAL = 2000;
const DANIO_RATA = 500;
const DANIO_CUCARACHA = 250;

// VELOCIDADES
const VELOCIDAD_RATA = 3;
const VELOCIDAD_CUCARACHA = 1.5; // Misma velocidad que ratas
const VELOCIDAD_CAIDA_COMIDA = 1;

const MR_POKA_SIZE = 80;
const MR_POKA_OFFSET = 40;
const UNDERGROUND_HEIGHT = 40;
const POKA_X_INICIAL = 10;

// PROBABILIDADES
const PROBABILIDAD_RATA = 12;     // 12% de probabilidad
const PROBABILIDAD_CUCARACHA = 12; // Aumentada a 10% para que se vean más

// INTERVALOS
const INTERVALO_RATAS = 1000;      // 1 segundo
const INTERVALO_CUCARACHAS = 600;  // Reducido a 800ms para que aparezcan más seguido
const INTERVALO_COMIDA = 1000;

const RAT_UNDERGROUND_OFFSET = 20;
const MIN_DISTANCIA_ENTRE_ENEMIGOS = 150; // Píxeles mínimos entre enemigos

// ===== VARIABLES GLOBALES =====
let animationFrameReqID = null;
let enemiesIntervalID = null;
let cucarachasIntervalID = null;
let junkFoodIntervalID = null;
let gameTrack = null;
const keys = { jump: false };
let rats = [];
let cucarachas = [];
let undergroundRats = [];
let JunkyFood = [];
let juegoPausado = false;
let botonPausa = { x: 800, y: 10, w: 40, h: 30 };
let muerteScene = null;
let gameOverCard = null;
let mostrandoGameOver = false;
let poka = null;
const pokaY = CANVAS_DIMENSIONS.height - MR_POKA_SIZE - MR_POKA_OFFSET;
let lastTime = 0;
let fps = 0;
let ultimaRataTiempo = 0;
let ultimaCucarachaLlamada = 0;

// Variables para debug
let totalCucarachasCreadas = 0;

// ===== INTERSECTS =====
function intersects(r1, r2) {
    const box1 = r1.hitbox || r1;
    const box2 = r2.hitbox || r2;
    return !(box2.x > (box1.x + box1.w) ||
        (box2.x + box2.w) < box1.x ||
        box2.y > (box1.y + box1.h) ||
        (box2.y + box2.h) < box1.y);
}

// ===== VERIFICAR ESPACIADO ENTRE ENEMIGOS =====
function puedeAparecerEnemigo(x) {
    // Verificar distancia con ratas
    for (let rata of rats) {
        if (rata && Math.abs(rata.x - x) < MIN_DISTANCIA_ENTRE_ENEMIGOS) {
            return false;
        }
    }
    // Verificar distancia con cucarachas
    for (let cuca of cucarachas) {
        if (cuca && Math.abs(cuca.x - x) < MIN_DISTANCIA_ENTRE_ENEMIGOS) {
            return false;
        }
    }
    // Verificar distancia con ratas subterráneas
    for (let rata of undergroundRats) {
        if (rata && Math.abs(rata.x - x) < MIN_DISTANCIA_ENTRE_ENEMIGOS) {
            return false;
        }
    }
    return true;
}

// ===== START GAME =====
function startGame() {
    console.log("🎮 Iniciando juego...");
    gameTrack = new GameTrack(CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height, ctx);
    poka = new Poka(POKA_X_INICIAL, pokaY, ctx);
    poka.vida = POKA_VIDA_INICIAL;

    JunkyFood = [];
    rats = [];
    cucarachas = [];
    undergroundRats = [];

    muerteScene = null;
    gameOverCard = null;
    mostrandoGameOver = false;
    juegoPausado = false;
    ultimaRataTiempo = 0;
    ultimaCucarachaLlamada = 0;
    totalCucarachasCreadas = 0;

    document.getElementById("start").style.display = 'none';
    document.getElementById("gameover").style.display = 'none';
    canvas.classList.remove("noShow");

    updateWorkArea();

    soundtrack.currentTime = 0;
    soundtrack.play();

    enemiesIntervalID = setInterval(() => {
        if (!juegoPausado) ratsEnemies();
    }, INTERVALO_RATAS);

    cucarachasIntervalID = setInterval(() => {
        if (!juegoPausado) cucarachasEnemies();
    }, INTERVALO_CUCARACHAS);

    junkFoodIntervalID = setInterval(() => {
        if (!juegoPausado) addRandomJunkFood();
    }, INTERVALO_COMIDA);
}

window.startGame = startGame;

// ===== UPDATE WORK AREA =====
function updateWorkArea() {
    const now = performance.now();
    fps = Math.round(1000 / (now - lastTime));
    lastTime = now;

    ctx.clearRect(0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);
    const pokaXAnterior = poka?.x || 0;
    // Dibujar fondo con scroll
    if (gameTrack) {
        gameTrack.draw(poka?.x || 0);
    }

    // ===== PAUSA =====
    if (juegoPausado) {
        dibujarElementos();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("⏸️ PAUSA", 300, 300);
        mostrarDatos(poka?.vida, poka?.x, poka?.y, fps);
        animationFrameReqID = requestAnimationFrame(updateWorkArea);
        return;
    }

    // ===== MUERTE Y GAME OVER =====
    if (!poka?.estaVivo()) {
        soundtrack.pause();

        if (!muerteScene && !mostrandoGameOver) {
            muerteScene = new MuerteScene(poka, canvas);
        }

        if (muerteScene && !mostrandoGameOver) {
            const terminado = muerteScene.update();
            muerteScene.draw(ctx);

            if (terminado) {
                mostrandoGameOver = true;
                gameOverCard = new GameOverCard(poka);
            }
        }

        if (mostrandoGameOver && gameOverCard) {
            gameOverCard.draw(ctx, canvas);
        }

        cancelAnimationFrame(animationFrameReqID);
        clearInterval(enemiesIntervalID);
        clearInterval(cucarachasIntervalID);
        clearInterval(junkFoodIntervalID);

        animationFrameReqID = requestAnimationFrame(updateWorkArea);
        return;
    }

    // ===== JUEGO NORMAL =====
    poka.animate(keys);
// Limitar movimiento de Poka
    if (poka.x < 0) poka.x = 0;
    if (poka.x > 2000) poka.x = 2000; // Mismo límite que el fondo
    // Ratas
    rats.forEach((rat, i) => {
        if (!rat) return;
        rat.x -= VELOCIDAD_RATA;
        rat.redraw();
        if (intersects(rat.position(), poka.position())) {
            poka.damage(DANIO_RATA);
            rats[i] = null;
        }
    });

    // CUCARACHAS - AHORA VISIBLES
    cucarachas.forEach((cuca, i) => {
        if (!cuca) return;
        cuca.x -= VELOCIDAD_CUCARACHA;
        cuca.redraw();
        if (intersects(cuca.position(), poka.position())) {
            poka.damage(DANIO_CUCARACHA);
            cucarachas[i] = null;
        }
    });

    // Ratas subterráneas
    undergroundRats.forEach((rat, i) => {
        if (!rat) return;
        rat.x -= VELOCIDAD_RATA;
        rat.redraw();
        if (intersects(rat.position(), poka.position())) {
            poka.damage(DANIO_RATA);
            undergroundRats[i] = null;
        }
    });

    // Limpiar enemigos fuera de pantalla
    rats = rats.filter(rat => rat && rat.x > -50);
    cucarachas = cucarachas.filter(cuca => cuca && cuca.x > -50);
    undergroundRats = undergroundRats.filter(rat => rat && rat.x > -50);

    // Comida
    JunkyFood.forEach((elem, i) => {
        if (!elem) return;
        elem.y += VELOCIDAD_CAIDA_COMIDA;
        elem.redraw();

        if (intersects(elem.position(), poka.position())) {
            if (elem instanceof Hamburger) poka.comerHamburguesa();
            else if (elem instanceof Coca) poka.comerCoca();
            else if (elem instanceof Donuts) poka.comerDona();
            else if (elem instanceof Potatos) poka.comerPapas();
            JunkyFood[i] = null;
        }
    });

    JunkyFood = JunkyFood.filter(elem => elem && elem.y < CANVAS_DIMENSIONS.height);

    mostrarDatos(poka.vida, poka.x, poka.y, fps);
    animationFrameReqID = requestAnimationFrame(updateWorkArea);
}

// ===== DIBUJAR ELEMENTOS =====
function dibujarElementos() {
    if (poka) poka.redraw();
    rats.forEach(rat => rat?.redraw());
    cucarachas.forEach(cuca => cuca?.redraw());
    undergroundRats.forEach(rat => rat?.redraw());
    JunkyFood.forEach(food => food?.redraw());
}

// ===== RATAS =====
function ratsEnemies() {
    const ahora = Date.now();
    if (ahora - ultimaRataTiempo < 400) return;
    ultimaRataTiempo = ahora;

    const probabilidad = Math.floor(Math.random() * 100);
    if (probabilidad < PROBABILIDAD_RATA) {
        const x = 900;
        if (puedeAparecerEnemigo(x)) {
            const y = CANVAS_DIMENSIONS.height - UNDERGROUND_HEIGHT - 45;
            rats.push(new Rat(x, y, ctx));
        }
    }

    // Ratas subterráneas
    const r2 = Math.floor(Math.random() * 100);
    if (r2 < PROBABILIDAD_RATA / 2) {
        const x = 950;
        if (puedeAparecerEnemigo(x)) {
            const y = CANVAS_DIMENSIONS.height - 45 + RAT_UNDERGROUND_OFFSET;
            undergroundRats.push(new Rat(x, y, ctx));
        }
    }
}

// ===== CUCARACHAS (AHORA CON MAYOR PROBABILIDAD) =====
function cucarachasEnemies() {
    const ahora = Date.now();
    if (ahora - ultimaCucarachaLlamada < 300) return; // Mínimo 300ms
    ultimaCucarachaLlamada = ahora;

    const probabilidad = Math.floor(Math.random() * 100);

    // Debug: mostrar cada intento
    console.log(`🪳 Intento cucaracha: prob=${probabilidad}, umbral=${PROBABILIDAD_CUCARACHA}`);

    if (probabilidad < PROBABILIDAD_CUCARACHA) {
        const x = 900;
        // Verificar espaciado
        if (puedeAparecerEnemigo(x)) {
            // Misma altura que ratas (ras del piso)
            const y = CANVAS_DIMENSIONS.height - 55;

            // Crear la cucaracha
            const nuevaCuca = new Cucaracha(x, y, ctx);
            cucarachas.push(nuevaCuca);
            totalCucarachasCreadas++;

            console.log(`✅ Cucaracha #${totalCucarachasCreadas} creada en:`, x, y);
            console.log(`📊 Total cucarachas activas: ${cucarachas.length}`);
        } else {
            console.log("❌ Espaciado insuficiente para cucaracha");
        }
    }
}

// ===== COMIDA =====
function addRandomJunkFood() {
    const type = Math.floor(Math.random() * 100);
    const x = Math.floor(Math.random() * (CANVAS_DIMENSIONS.width - 50));

    if (type < 25) JunkyFood.push(new Potatos(x, 0, ctx));
    else if (type < 50) JunkyFood.push(new Coca(x, 0, ctx));
    else if (type < 75) JunkyFood.push(new Donuts(x, 0, ctx));
    else if (type < 100) JunkyFood.push(new Hamburger(x, 0, ctx));
}

// ===== MOSTRAR DATOS =====
function mostrarDatos(vida, x, y, fps) {
    if (!poka) return;
    const s = poka.getEstadisticas();

    // Fondo HUD
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, 900, 200); // Más alto para incluir contador de cucarachas

    // Línea 1 - Vida, CO2, Estado, FPS
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#ff5555";
    ctx.fillText("❤️ VIDA:", 10, 20);
    ctx.fillStyle = "white";
    ctx.fillText(vida, 70, 20);

    ctx.fillStyle = "#88aa88";
    ctx.fillText("🌍 CO₂:", 150, 20);
    ctx.fillStyle = "white";
    ctx.fillText(`${s.co2} kg`, 210, 20);

    ctx.fillStyle = "#ffaa00";
    ctx.fillText("📊 ESTADO:", 300, 20);

    let estadoColor = s.estado === "NORMAL" ? "#00ff00" :
        s.estado === "DIABETES" ? "#ff0000" : "#ffaa00";
    ctx.fillStyle = estadoColor;
    ctx.fillText(s.estado, 380, 20);

    ctx.fillStyle = fps > 50 ? "#00ff00" : "#ffff00";
    ctx.fillText(`⚡ ${fps} FPS`, 750, 20);

    // Línea 2 - Peso
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#ffaa88";
    ctx.fillText("⚖️ PESO +:", 10, 50);
    ctx.fillStyle = "white";
    ctx.fillText(`${s.pesoGanado} kg`, 85, 50);
    ctx.fillStyle = "#ffff00";
    ctx.fillText(`(+${s.ultimoIncremento} kg)`, 160, 50);

    // Barra de peso
    const pct = Math.min(100, (s.pesoGanado / 25) * 100);
    ctx.fillStyle = "#333";
    ctx.fillRect(250, 40, 200, 15);
    ctx.fillStyle = pct > 80 ? "#ff0000" : "#ffaa00";
    ctx.fillRect(250, 40, 200 * (pct / 100), 15);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(250, 40, 200, 15);

    // Línea 3 - Contadores de comida
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffaa00";
    ctx.fillText(`🍔 ${s.hamburguesas}`, 10, 85);
    ctx.fillStyle = "#ff5555";
    ctx.fillText(`🥤 ${s.cocas}`, 80, 85);
    ctx.fillStyle = "#ffaa88";
    ctx.fillText(`🍩 ${s.donas}`, 150, 85);
    ctx.fillStyle = "#ffaa00";
    ctx.fillText(`🍟 ${s.papas}`, 220, 85);

    // Línea 4 - Contadores de enemigos (NUEVO)
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#aa88ff";
    ctx.fillText(`🐀 Ratas: ${rats.length}`, 10, 115);
    ctx.fillStyle = "#ffaa88";
    ctx.fillText(`🪳 Cucarachas: ${cucarachas.length}`, 120, 115);
    ctx.fillStyle = "#8866aa";
    ctx.fillText(`🕳️ Subterráneas: ${undergroundRats.length}`, 250, 115);

    // Línea 5 - Esperanza y años perdidos
    ctx.font = "bold 14px Arial";
    const ec = s.esperanzaVida > 60 ? "#00ff00" : (s.esperanzaVida > 40 ? "#ffff00" : "#ff0000");
    ctx.fillStyle = ec;
    ctx.fillText(`⏳ ESPERANZA: ${s.esperanzaVida} años`, 10, 145);

    ctx.fillStyle = "#ff6600";
    ctx.fillText(`📉 AÑOS PERDIDOS: ${s.añosPerdidos}`, 250, 145);

    // ===== BARRA DE AVANCE DE PANTALLA =====
    const centroPantalla = CANVAS_DIMENSIONS.width / 2;
    const avance = Math.max(0, x - centroPantalla);
    const porcentajeAvance = Math.min(100, (avance / 500) * 100);

    ctx.fillStyle = "#333333";
    ctx.fillRect(600, 125, 200, 15);

    const colorBarra = porcentajeAvance >= 100 ? "#00ff00" : "#ffff00";
    ctx.fillStyle = colorBarra;
    ctx.fillRect(600, 125, 200 * (porcentajeAvance / 100), 15);

    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(600, 125, 200, 15);

    ctx.font = "bold 12px Arial";
    ctx.fillStyle = "#ffffff";
    if (porcentajeAvance < 100) {
        ctx.fillText(`Zona 1: ${Math.floor(porcentajeAvance)}%`, 610, 120);
    } else {
        ctx.fillStyle = "#00ff00";
        ctx.fillText("✅ ZONA 2: BOSQUE", 610, 120);
    }

    // Botón pausa
    ctx.fillStyle = "#444";
    ctx.fillRect(botonPausa.x, botonPausa.y, botonPausa.w, botonPausa.h);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(botonPausa.x, botonPausa.y, botonPausa.w, botonPausa.h);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("⏸️", botonPausa.x + 8, botonPausa.y + 22);

// ===== NUEVO: Botón de SALIR =====
    ctx.fillStyle = "#aa0000";
    ctx.fillRect(botonSalir.x, botonSalir.y, botonSalir.w, botonSalir.h);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(botonSalir.x, botonSalir.y, botonSalir.w, botonSalir.h);
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("✖", botonSalir.x + 12, botonSalir.y + 22);
    // Posición
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText(`📍 ${Math.floor(x)},${Math.floor(y)}`, 780, 195);
}

// ===== CLICK =====
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Botón de pausa
    if (mx >= botonPausa.x && mx <= botonPausa.x + botonPausa.w &&
        my >= botonPausa.y && my <= botonPausa.y + botonPausa.h) {
        juegoPausado = !juegoPausado;
        juegoPausado ? soundtrack.pause() : soundtrack.play();
        return;
    }
// ===== NUEVO: Botón de SALIR =====
    if (mx >= botonSalir.x && mx <= botonSalir.x + botonSalir.w &&
        my >= botonSalir.y && my <= botonSalir.y + botonSalir.h) {

        // Volver al menú principal
        juegoPausado = false;
        soundtrack.pause();

        // Limpiar intervalos
        clearInterval(enemiesIntervalID);
        clearInterval(cucarachasIntervalID);
        clearInterval(junkFoodIntervalID);
        cancelAnimationFrame(animationFrameReqID);

        // Mostrar botón START y ocultar canvas
        document.getElementById("start").style.display = 'block';
        canvas.classList.add("noShow");

        return;
    }
    // Botón de reinicio
    if (mostrandoGameOver && gameOverCard &&
        mx >= 250 && mx <= 650 &&
        my >= 550 && my <= 620) {
        gameOverCard = null;
        muerteScene = null;
        mostrandoGameOver = false;
        startGame();
    }
});

// ===== TECLADO =====
document.addEventListener("keydown", (e) => {
    if (!poka || juegoPausado || mostrandoGameOver) return;
    if (e.key === "ArrowLeft") poka.moverAtras();
    if (e.key === "ArrowRight") poka.moverAlFrente();
    if (e.key === " ") {
        keys.jump = true;
        e.preventDefault();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === " ") keys.jump = false;
});

// ===== DEBUG: Mostrar estadísticas cada 10 segundos =====
setInterval(() => {
    console.log("=".repeat(50));
    console.log("📊 ESTADÍSTICAS DE ENEMIGOS:");
    console.log(`🐀 Ratas activas: ${rats.length}`);
    console.log(`🪳 Cucarachas activas: ${cucarachas.length}`);
    console.log(`🕳️ Ratas subterráneas: ${undergroundRats.length}`);
    console.log(`📈 Total cucarachas creadas: ${totalCucarachasCreadas}`);
    console.log("=".repeat(50));
}, 10000);