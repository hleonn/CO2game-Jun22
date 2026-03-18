// ===== TODOS LOS IMPORTS =====
import { Actors } from './classes/Actors.js';
import { Poka } from './classes/Poka.js';
import { GameTrack } from './classes/GameTrack.js';
import { Hamburger } from './classes/Hamburger.js';
import { Coca } from './classes/Coca.js';
import { Donuts } from './classes/Donuts.js';
import { Potatos } from './classes/Potatos.js';
import { Joku } from './classes/Joku.js';
import { Rat } from './classes/Rat.js';

// ===== CONSTANTES DEL JUEGO =====
const canvas = document.getElementById("workArea")
const ctx = canvas.getContext("2d")
const soundtrack = new Audio('./audio/main.mp3');

// Constantes de dimensiones
const CANVAS_DIMENSIONS = {
    width: 900,
    height: 600,
};

// Salud y daños
const POKA_VIDA_INICIAL = 2000;
const DANIO_RATA = 500;
const CURACION_COMIDA = 100;

// Velocidades
const VELOCIDAD_RATA = 5;
const VELOCIDAD_CAIDA_COMIDA = 1;
const VELOCIDAD_POKA = 50;

// Posiciones y tamaños
const MR_POKA_SIZE = 80;
const MR_POKA_OFFSET = 40;
const UNDERGROUND_HEIGHT = 40;
const RAT_SIZE = 45;
const POKA_X_INICIAL = 10;

// Probabilidades (para aparecer enemigos y comida)
const PROBABILIDAD_MAX = 40;
const NUMEROS_MAGICOS = [1, 32, 5, 38, 29];

// Intervalos de tiempo (ms)
const INTERVALO_RATAS = 500;
const INTERVALO_COMIDA = 1000;

// Offset para ratas subterráneas
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

// Variables para pausa (NUEVO)
let juegoPausado = false;
let botonPausa = {
    x: 800,
    y: 45,
    w: 40,
    h: 20
};

// Contadores de comida (NUEVO)
let contadorHamburguesas = 0;
let contadorCocas = 0;
let contadorDonas = 0;
let contadorPapas = 0;


const pokaY = CANVAS_DIMENSIONS.height - MR_POKA_SIZE - MR_POKA_OFFSET;
let poka = null;

// Variables para FPS
let lastTime = 0;
let fps = 0;

/**
 * Detecta si dos rectángulos se intersectan
 * @param {Object} r1 - Rectángulo 1 con propiedades {x, y, w, h}
 * @param {Object} r2 - Rectángulo 2 con propiedades {x, y, w, h}
 * @returns {boolean} - true si los rectángulos se intersectan
 */
function intersects(r1, r2) {
    // Usar hitbox si existe, si no usar dimensiones normales
    const box1 = r1.hitbox || r1;
    const box2 = r2.hitbox || r2;

    return !(box2.x > (box1.x + box1.w) ||
        (box2.x + box2.w) < box1.x ||
        box2.y > (box1.y + box1.h) ||
        (box2.y + box2.h) < box1.y);
}

/**
 * Inicia una nueva partida
 */
function startGame() {
    // Crear el fondo
    gameTrack = new GameTrack(CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height, ctx);

    poka = new Poka(POKA_X_INICIAL, pokaY, ctx);
    poka.vida = POKA_VIDA_INICIAL;

    JunkyFood = [];
    rats = [];
    undergroundRats = [];


    // Resetear contadores (NUEVO)
    contadorHamburguesas = 0;
    contadorCocas = 0;
    contadorDonas = 0;
    contadorPapas = 0;

    document.getElementById("start").style.display = 'none';
    document.getElementById("gameover").style.display = 'none';
    canvas.classList.remove("noShow");

    updateWorkArea();

    soundtrack.currentTime = 0;
    soundtrack.play();

    enemiesIntervalID = setInterval(() => {
        if (!juegoPausado) { // Solo generar si NO está pausado
            ratsEnemies();
        }
    }, INTERVALO_RATAS);

    junkFoodIntervalID = setInterval(() => {
        if (!juegoPausado) { // Solo generar si NO está pausado
            addRandomJunkFood();
        }
    }, INTERVALO_COMIDA);
}

// Hacer startGame global para el onclick del HTML
window.startGame = startGame;

/**
 * Bucle principal del juego - se ejecuta en cada frame
 */
function updateWorkArea() {
    // Medir FPS
    const now = performance.now();
    const delta = now - lastTime;
    fps = Math.round(1000 / delta);
    lastTime = now;

    ctx.clearRect(0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);

    // Dibujar fondo
    if (gameTrack) {
        gameTrack.draw();
    }
// ===== NUEVO: Si el juego está pausado =====
    if (juegoPausado) {
        // Dibujar todo pero sin movimiento
        if (poka) {
            poka.redraw(); // Solo dibujar, no animar
        }

        rats.forEach(rat => rat?.redraw());
        undergroundRats.forEach(rat => rat?.redraw());
        JunkyFood.forEach(food => food?.redraw());

        // Mostrar mensaje de PAUSA
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);

        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("⏸️ PAUSA", 300, 300);

        ctx.font = "20px Arial";
        ctx.fillText("Click en el botón ⏸️ para continuar", 250, 380);

        mostrarDatos(poka?.vida, poka?.x, poka?.y, fps);
        animationFrameReqID = requestAnimationFrame(updateWorkArea);
        return; // SALIR de la función, no procesar movimiento
    }
    // Verificar si el jugador sigue vivo
    if (!poka.estaVivo()) {
        soundtrack.pause();
        document.getElementById("gameover").style.display = "block";
        canvas.classList.add("noShow");
        cancelAnimationFrame(animationFrameReqID);
        clearInterval(enemiesIntervalID);
        clearInterval(junkFoodIntervalID);
        return;
    }

    // Animar jugador
    poka.animate(keys);

    // Procesar ratas en el piso
    rats.forEach((ratInstance, index) => {
        if (ratInstance == null) return;
        ratInstance.x -= VELOCIDAD_RATA;
        ratInstance.redraw();

        if (intersects(ratInstance.position(), poka.position())) {
            poka.damage(DANIO_RATA);
            rats[index] = null;
        }
    });

    // Procesar ratas subterráneas
    undergroundRats.forEach((ratInstance) => {
        ratInstance.redraw();
    });

    // Procesar comida chatarra
    JunkyFood.forEach((elem, index) => {
        if (elem == null) return;
        elem.y += VELOCIDAD_CAIDA_COMIDA;
        elem.redraw();

        if (intersects(elem.position(), poka.position())) {
            poka.heal(CURACION_COMIDA);

            // Incrementar contador según tipo (NUEVO)
            if (elem instanceof Hamburger) contadorHamburguesas++;
            else if (elem instanceof Coca) contadorCocas++;
            else if (elem instanceof Donuts) contadorDonas++;
            else if (elem instanceof Potatos) contadorPapas++;

            JunkyFood[index] = null;
        }
    });

    mostrarDatos(poka.vida, poka.x, poka.y, fps);
    animationFrameReqID = requestAnimationFrame(updateWorkArea);
}

/**
 * Genera ratas enemigas aleatoriamente
 */
function ratsEnemies() {
    const ratasEnElPiso = Math.floor(Math.random() * PROBABILIDAD_MAX);
    const ratasEnSubsuelo = Math.floor(Math.random() * PROBABILIDAD_MAX);

    if (NUMEROS_MAGICOS.includes(ratasEnElPiso)) {
        const ratY = CANVAS_DIMENSIONS.height - UNDERGROUND_HEIGHT - Rat.size;
        const rat = new Rat(CANVAS_DIMENSIONS.width - 50, ratY, ctx);
        rats.push(rat);
    }

    if (NUMEROS_MAGICOS.includes(ratasEnSubsuelo)) {
        const ratY = CANVAS_DIMENSIONS.height - Rat.size + RAT_UNDERGROUND_OFFSET;
        const rat = new Rat(CANVAS_DIMENSIONS.width, ratY, ctx);
        undergroundRats.push(rat);
    }
}

/**
 * Genera comida chatarra aleatoriamente
 */
function addRandomJunkFood() {
    const randomJunkyFoodType = Math.floor(Math.random() * PROBABILIDAD_MAX);
    const randomX = Math.floor(Math.random() * CANVAS_DIMENSIONS.width);

    if (randomJunkyFoodType < 10) {
        let pott = new Potatos(randomX, 0, ctx);
        JunkyFood.push(pott);
    } else if (randomJunkyFoodType < 20) {
        let cok = new Coca(randomX, 0, ctx);
        JunkyFood.push(cok);
    } else if (randomJunkyFoodType < 30) {
        let don = new Donuts(randomX, 0, ctx);
        JunkyFood.push(don);
    } else if (randomJunkyFoodType < 40) {
        let hambu = new Hamburger(randomX, 0, ctx);
        JunkyFood.push(hambu);
    }
}

/**
 * Muestra información en pantalla (vida, coordenadas, FPS)
 * @param {number} vida - Vida actual del jugador
 * @param {number} x - Posición X del jugador
 * @param {number} y - Posición Y del jugador
 * @param {number} fps - Frames por segundo actuales
 */
function mostrarDatos(vida, x, y, fps) {
    const barWidth = 200;
    const barHeight = 20;
    const co2Percent = Math.min(100, Math.floor((2000 - vida) / 2000 * 100));

    // ===== FONDO DEL HUD =====
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, CANVAS_DIMENSIONS.width, 70);

    // ===== LÍNEA 1: VIDA, CO2, FPS =====
    ctx.font = "bold 16px Arial";

    // VIDA
    ctx.fillStyle = "#ff5555";
    ctx.fillText("❤️ VIDA:", 10, 25);
    ctx.fillStyle = "white";
    ctx.fillText(vida, 80, 25);

    // CO2
    ctx.fillStyle = "#cccccc";
    ctx.fillText("🌍 CO₂:", 200, 25);

    // Fondo de la barra
    ctx.fillStyle = "#333333";
    ctx.fillRect(270, 10, barWidth, barHeight);

    // Barra de progreso
    const gradient = ctx.createLinearGradient(270, 10, 270 + barWidth, 10);
    gradient.addColorStop(0, "#00ff00");
    gradient.addColorStop(0.5, "#ffff00");
    gradient.addColorStop(1, "#ff0000");

    ctx.fillStyle = gradient;
    ctx.fillRect(270, 10, barWidth * (co2Percent / 100), barHeight);

    // Borde de la barra
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(270, 10, barWidth, barHeight);

    // Porcentaje
    ctx.font = "14px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`${co2Percent}%`, 480, 25);

    // FPS
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = fps > 50 ? "#00ff00" : (fps > 30 ? "#ffff00" : "#ff0000");
    ctx.fillText(`⚡ FPS: ${fps}`, 700, 25);

    // ===== LÍNEA 2: CONTADORES DE COMIDA =====
    ctx.font = "14px Arial";

    // Hamburguesa
    ctx.fillStyle = "#ffaa00";
    ctx.fillText("🍔 HAMB:", 10, 55);
    ctx.fillStyle = "white";
    ctx.fillText(contadorHamburguesas, 85, 55);

    // Coca
    ctx.fillStyle = "#ff5555";
    ctx.fillText("🥤 COCA:", 150, 55);
    ctx.fillStyle = "white";
    ctx.fillText(contadorCocas, 220, 55);

    // Dona
    ctx.fillStyle = "#ffaa88";
    ctx.fillText("🍩 DONA:", 280, 55);
    ctx.fillStyle = "white";
    ctx.fillText(contadorDonas, 350, 55);

    // Papas
    ctx.fillStyle = "#ffaa00";
    ctx.fillText("🍟 PAPA:", 410, 55);
    ctx.fillStyle = "white";
    ctx.fillText(contadorPapas, 475, 55);

    // ===== BOTÓN DE PAUSA (simulado) =====
    ctx.fillStyle = "#444444";
    ctx.fillRect(800, 45, 40, 20);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(800, 45, 40, 20);

    ctx.font = "bold 12px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("⏸️", 810, 62);

    // ===== POSICIÓN (esquina inferior derecha) =====
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888888";
    ctx.fillText(`📍 X:${x} Y:${y}`, 780, 590);
}
// ===== DETECTOR DE CLICK PARA PAUSA =====
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    // Verificar si hizo click en el botón de pausa
    if (mouseX >= botonPausa.x &&
        mouseX <= botonPausa.x + botonPausa.w &&
        mouseY >= botonPausa.y &&
        mouseY <= botonPausa.y + botonPausa.h) {

        juegoPausado = !juegoPausado; // Alternar pausa

        // Pausar o reanudar música
        if (juegoPausado) {
            soundtrack.pause();
        } else {
            soundtrack.play();
        }
    }
});
// ===== EVENT LISTENERS =====
document.addEventListener("keydown", (event) => {
    if (event.key == "ArrowLeft") {
        poka?.moverAtras();
    }
    if (event.key == "ArrowRight") {
        poka?.moverAlFrente();
    }
    if (event.key == " ") {
        keys.jump = true;
    }
});

document.addEventListener('keyup', (evt) => {
    if (evt.key == " ") {
        keys.jump = false;
    }
});