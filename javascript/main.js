import { Actors } from './classes/Actors.js';
import { Poka } from './classes/Poka.js';
import { GameTrack } from './classes/GameTrack.js';
import { Hamburger } from './classes/Hamburger.js';
import { Coca } from './classes/Coca.js';
import { Donuts } from './classes/Donuts.js';
import { Potatos } from './classes/Potatos.js';
import { Rat } from './classes/Rat.js';
import { GameOverCard } from './classes/GameOverCard.js';
import { MuerteScene } from './classes/MuerteScene.js';

// ===== CONSTANTES =====
const canvas = document.getElementById("workArea");
const ctx = canvas.getContext("2d");
const soundtrack = new Audio('./audio/main.mp3');

const CANVAS_DIMENSIONS = { width: 900, height: 600 };
const POKA_VIDA_INICIAL = 2000;
const DANIO_RATA = 500;
const VELOCIDAD_RATA = 3; // REDUCIDA de 5 a 3
const VELOCIDAD_CAIDA_COMIDA = 1;
const MR_POKA_SIZE = 80;
const MR_POKA_OFFSET = 40;
const UNDERGROUND_HEIGHT = 40;
const POKA_X_INICIAL = 10;

// PROBABILIDADES DE APARICIÓN (REDUCIDAS)
const PROBABILIDAD_RATA = 15; // Antes 40, ahora 15%
const NUMEROS_MAGICOS = [3, 8, 13, 18, 23]; // Números más espaciados

const INTERVALO_RATAS = 800; // AUMENTADO de 500ms a 800ms
const INTERVALO_COMIDA = 1000;
const RAT_UNDERGROUND_OFFSET = 20;

// ===== VARIABLES GLOBALES =====
let animationFrameReqID = null;
let enemiesIntervalID = null;
let junkFoodIntervalID = null;
let gameTrack = null;
const keys = { jump: false };
let rats = [];
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

// Control de tiempo para ratas (evitar que aparezcan muy seguidas)
let ultimaRataTiempo = 0;

// ===== INTERSECTS =====
function intersects(r1, r2) {
    const box1 = r1.hitbox || r1;
    const box2 = r2.hitbox || r2;
    return !(box2.x > (box1.x + box1.w) ||
        (box2.x + box2.w) < box1.x ||
        box2.y > (box1.y + box1.h) ||
        (box2.y + box2.h) < box1.y);
}

// ===== START GAME =====
function startGame() {
    gameTrack = new GameTrack(CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height, ctx);
    poka = new Poka(POKA_X_INICIAL, pokaY, ctx);
    poka.vida = POKA_VIDA_INICIAL;

    JunkyFood = [];
    rats = [];
    undergroundRats = [];

    muerteScene = null;
    gameOverCard = null;
    mostrandoGameOver = false;
    juegoPausado = false;
    ultimaRataTiempo = 0;

    document.getElementById("start").style.display = 'none';
    document.getElementById("gameover").style.display = 'none';
    canvas.classList.remove("noShow");

    updateWorkArea();

    soundtrack.currentTime = 0;
    soundtrack.play();

    enemiesIntervalID = setInterval(() => {
        if (!juegoPausado) ratsEnemies();
    }, INTERVALO_RATAS);

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
    if (gameTrack) gameTrack.draw();

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
        clearInterval(junkFoodIntervalID);

        animationFrameReqID = requestAnimationFrame(updateWorkArea);
        return;
    }

    // ===== JUEGO NORMAL =====
    poka.animate(keys);

    // Ratas (con velocidad constante)
    rats.forEach((rat, i) => {
        if (!rat) return;
        rat.x -= VELOCIDAD_RATA; // Velocidad constante
        rat.redraw();
        if (intersects(rat.position(), poka.position())) {
            poka.damage(DANIO_RATA);
            rats[i] = null;
        }
    });

    // Limpiar ratas que salieron de la pantalla
    rats = rats.filter(rat => rat && rat.x > -50);

    undergroundRats.forEach(rat => rat?.redraw());
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

    // Limpiar comida que cayó al suelo
    JunkyFood = JunkyFood.filter(elem => elem && elem.y < CANVAS_DIMENSIONS.height);

    mostrarDatos(poka.vida, poka.x, poka.y, fps);
    animationFrameReqID = requestAnimationFrame(updateWorkArea);
}

// ===== DIBUJAR ELEMENTOS =====
function dibujarElementos() {
    if (poka) poka.redraw();
    rats.forEach(rat => rat?.redraw());
    undergroundRats.forEach(rat => rat?.redraw());
    JunkyFood.forEach(food => food?.redraw());
}

// ===== RATAS (CONTROL DE FRECUENCIA) =====
function ratsEnemies() {
    const ahora = Date.now();

    // Evitar que aparezcan muy seguidas
    if (ahora - ultimaRataTiempo < 300) return; // Mínimo 300ms entre ratas
    ultimaRataTiempo = ahora;

    const r1 = Math.floor(Math.random() * 100); // 0-99

    // Solo 15% de probabilidad
    if (r1 < PROBABILIDAD_RATA) {
        const y = CANVAS_DIMENSIONS.height - UNDERGROUND_HEIGHT - 45;
        rats.push(new Rat(850, y, ctx));
    }

    const r2 = Math.floor(Math.random() * 100);
    if (r2 < PROBABILIDAD_RATA) {
        const y = CANVAS_DIMENSIONS.height - 45 + RAT_UNDERGROUND_OFFSET;
        undergroundRats.push(new Rat(900, y, ctx));
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
    ctx.fillRect(0, 0, 900, 140);

    // Línea 1
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

    // Línea 3 - Contadores
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffaa00";
    ctx.fillText(`🍔 ${s.hamburguesas}`, 10, 85);
    ctx.fillStyle = "#ff5555";
    ctx.fillText(`🥤 ${s.cocas}`, 80, 85);
    ctx.fillStyle = "#ffaa88";
    ctx.fillText(`🍩 ${s.donas}`, 150, 85);
    ctx.fillStyle = "#ffaa00";
    ctx.fillText(`🍟 ${s.papas}`, 220, 85);

    // Línea 4 - Esperanza de vida y años perdidos
    ctx.font = "bold 14px Arial";
    const ec = s.esperanzaVida > 60 ? "#00ff00" : (s.esperanzaVida > 40 ? "#ffff00" : "#ff0000");
    ctx.fillStyle = ec;
    ctx.fillText(`⏳ ESPERANZA: ${s.esperanzaVida} años`, 300, 85);

    // Años perdidos (NUEVO)
    ctx.fillStyle = "#ff6600";
    ctx.fillText(`📉 AÑOS PERDIDOS: ${s.añosPerdidos}`, 550, 85);

    // Botón pausa
    ctx.fillStyle = "#444";
    ctx.fillRect(800, 10, 40, 30);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(800, 10, 40, 30);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("⏸️", 808, 35);

    // Posición
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText(`📍 ${x},${y}`, 780, 135);
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