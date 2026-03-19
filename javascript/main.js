import { Actors } from './classes/Actors.js';
import { Poka } from './classes/Poka.js';
import { GameTrack } from './classes/GameTrack.js';
import { Hamburger } from './classes/Hamburger.js';
import { Coca } from './classes/Coca.js';
import { Donuts } from './classes/Donuts.js';
import { Potatos } from './classes/Potatos.js';
import { Joku } from './classes/Joku.js';
import { Rat } from './classes/Rat.js';
import { Cucaracha } from './classes/Cucaracha.js';
import { GameOverCard } from './classes/GameOverCard.js';
import { MuerteScene } from './classes/MuerteScene.js';

const botonSalir = { x: 750, y: 10, w: 40, h: 30 };

// ===== CONSTANTES =====
const canvas     = document.getElementById("workArea");
const ctx        = canvas.getContext("2d");
const soundtrack = new Audio('./audio/main.mp3');

const CANVAS_DIMENSIONS            = { width: 900, height: 600 };
const POKA_VIDA_INICIAL            = 2000;
const DANIO_RATA                   = 500;
const DANIO_CUCARACHA              = 250;
const VELOCIDAD_RATA               = 3;
const VELOCIDAD_CUCARACHA          = 1.5;
const VELOCIDAD_CAIDA_COMIDA       = 1;
const MR_POKA_SIZE                 = 80;
const MR_POKA_OFFSET               = 40;
const UNDERGROUND_HEIGHT           = 40;
const POKA_X_INICIAL               = 80;
const PROBABILIDAD_RATA            = 12;
const PROBABILIDAD_CUCARACHA       = 12;
const INTERVALO_RATAS              = 1000;
const INTERVALO_CUCARACHAS         = 600;
const INTERVALO_COMIDA             = 1000;
const RAT_UNDERGROUND_OFFSET       = 20;
const MIN_DISTANCIA_ENTRE_ENEMIGOS = 150;

// Punto de la pantalla donde la cámara empieza a seguir a Poka
const CAMARA_UMBRAL = CANVAS_DIMENSIONS.width / 3; // 300px

// ===== VARIABLES GLOBALES =====
let animationFrameReqID   = null;
let enemiesIntervalID     = null;
let cucarachasIntervalID  = null;
let junkFoodIntervalID    = null;
let gameTrack             = null;
const keys                = { jump: false, left: false, right: false };
let rats                  = [];
let cucarachas            = [];
let undergroundRats       = [];
let JunkyFood             = [];
let juegoPausado          = false;
let botonPausa            = { x: 800, y: 10, w: 40, h: 30 };
let muerteScene           = null;
let gameOverCard           = null;
let mostrandoGameOver     = false;
let poka                  = null;

// Posición mundial de Poka (crece indefinidamente)
let mundoPoka = POKA_X_INICIAL;

const pokaY = CANVAS_DIMENSIONS.height - MR_POKA_SIZE - MR_POKA_OFFSET;
let lastTime               = 0;
let fps                    = 0;
let ultimaRataTiempo       = 0;
let ultimaCucarachaLlamada = 0;
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

// ===== VERIFICAR ESPACIADO =====
function puedeAparecerEnemigo(x) {
    for (let r of rats)            { if (r && Math.abs(r.x - x) < MIN_DISTANCIA_ENTRE_ENEMIGOS) return false; }
    for (let c of cucarachas)      { if (c && Math.abs(c.x - x) < MIN_DISTANCIA_ENTRE_ENEMIGOS) return false; }
    for (let r of undergroundRats) { if (r && Math.abs(r.x - x) < MIN_DISTANCIA_ENTRE_ENEMIGOS) return false; }
    return true;
}

// ===== START GAME =====
function startGame() {
    console.log("🎮 Iniciando juego...");
    gameTrack = new GameTrack(CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height, ctx);
    poka = new Poka(POKA_X_INICIAL, pokaY, ctx);
    poka.vida = POKA_VIDA_INICIAL;
    mundoPoka = POKA_X_INICIAL;

    JunkyFood = []; rats = []; cucarachas = []; undergroundRats = [];
    muerteScene = null; gameOverCard = null;
    mostrandoGameOver = false; juegoPausado = false;
    ultimaRataTiempo = 0; ultimaCucarachaLlamada = 0; totalCucarachasCreadas = 0;
    keys.left = false; keys.right = false; keys.jump = false;

    document.getElementById("start").style.display   = 'none';
    document.getElementById("gameover").style.display = 'none';
    canvas.classList.remove("noShow");

    updateWorkArea();
    soundtrack.currentTime = 0;
    soundtrack.play().catch(() => {});

    enemiesIntervalID    = setInterval(() => { if (!juegoPausado) ratsEnemies();       }, INTERVALO_RATAS);
    cucarachasIntervalID = setInterval(() => { if (!juegoPausado) cucarachasEnemies(); }, INTERVALO_CUCARACHAS);
    junkFoodIntervalID   = setInterval(() => { if (!juegoPausado) addRandomJunkFood(); }, INTERVALO_COMIDA);
}
window.startGame = startGame;

// ===== UPDATE WORK AREA =====
function updateWorkArea() {
    const now = performance.now();
    fps      = Math.round(1000 / (now - lastTime));
    lastTime = now;

    ctx.clearRect(0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);

    // ===== PAUSA =====
    if (juegoPausado) {
        if (gameTrack) gameTrack.draw(0);
        dibujarElementos();
        ctx.fillStyle = "rgba(0,0,0,0.5)";
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

    // 1. Mover posición mundial de Poka según teclas
    const velocidad = poka.velocidad;
    if (keys.right) mundoPoka += velocidad * 0.12;
    if (keys.left)  mundoPoka -= velocidad * 0.12;
    mundoPoka = Math.max(0, mundoPoka); // no salir por la izquierda del mundo

    // 2. Calcular posición visual de Poka y delta de cámara
    let pokaVisualX;
    let deltaScroll = 0;

    if (mundoPoka <= CAMARA_UMBRAL) {
        // Poka se mueve libremente antes del umbral
        pokaVisualX = mundoPoka;
        deltaScroll = 0;
    } else {
        // Poka se queda en el umbral, el fondo scrollea
        pokaVisualX = CAMARA_UMBRAL;
        if (keys.right) deltaScroll =  velocidad * 0.12;
        if (keys.left)  deltaScroll = -velocidad * 0.12;
    }

    // 3. Dibujar fondo y obtener el delta REAL que se aplicó
    // (puede ser 0 si el fondo llegó al límite izquierdo o derecho)
    const deltaReal = gameTrack ? gameTrack.draw(deltaScroll) : 0;

    // 4. Actualizar física de Poka (salto/gravedad) y fijar su X visual
    poka.animate(keys);
    poka.x = pokaVisualX;

    // 5. Enemigos: velocidad propia + se desplazan con el scroll REAL
    rats.forEach((rat, i) => {
        if (!rat) return;
        rat.x -= VELOCIDAD_RATA + deltaReal;
        rat.redraw();
        if (intersects(rat.position(), poka.position())) {
            poka.damage(DANIO_RATA);
            rats[i] = null;
        }
    });

    cucarachas.forEach((cuca, i) => {
        if (!cuca) return;
        cuca.x -= VELOCIDAD_CUCARACHA + deltaReal;
        cuca.redraw();
        if (intersects(cuca.position(), poka.position())) {
            poka.damage(DANIO_CUCARACHA);
            cucarachas[i] = null;
        }
    });

    undergroundRats.forEach((rat, i) => {
        if (!rat) return;
        rat.x -= VELOCIDAD_RATA + deltaReal;
        rat.redraw();
        if (intersects(rat.position(), poka.position())) {
            poka.damage(DANIO_RATA);
            undergroundRats[i] = null;
        }
    });

    rats            = rats.filter(r => r && r.x > -50);
    cucarachas      = cucarachas.filter(c => c && c.x > -50);
    undergroundRats = undergroundRats.filter(r => r && r.x > -50);

    // 6. Comida: cae verticalmente Y se mueve con el scroll REAL
    JunkyFood.forEach((elem, i) => {
        if (!elem) return;
        elem.y += VELOCIDAD_CAIDA_COMIDA;
        elem.x -= deltaReal; // usa deltaReal, no deltaScroll
        elem.redraw();
        if (intersects(elem.position(), poka.position())) {
            if      (elem instanceof Hamburger) poka.comerHamburguesa();
            else if (elem instanceof Coca)      poka.comerCoca();
            else if (elem instanceof Donuts)    poka.comerDona();
            else if (elem instanceof Potatos)   poka.comerPapas();
            JunkyFood[i] = null;
        }
    });
    JunkyFood = JunkyFood.filter(e => e && e.y < CANVAS_DIMENSIONS.height);

    mostrarDatos(poka.vida, poka.x, poka.y, fps);
    animationFrameReqID = requestAnimationFrame(updateWorkArea);
}

// ===== DIBUJAR ELEMENTOS =====
function dibujarElementos() {
    if (poka) poka.redraw();
    rats.forEach(r => r?.redraw());
    cucarachas.forEach(c => c?.redraw());
    undergroundRats.forEach(r => r?.redraw());
    JunkyFood.forEach(f => f?.redraw());
}

// ===== RATAS =====
function ratsEnemies() {
    const ahora = Date.now();
    if (ahora - ultimaRataTiempo < 400) return;
    ultimaRataTiempo = ahora;
    if (Math.floor(Math.random() * 100) < PROBABILIDAD_RATA) {
        const x = CANVAS_DIMENSIONS.width;
        if (puedeAparecerEnemigo(x))
            rats.push(new Rat(x, CANVAS_DIMENSIONS.height - UNDERGROUND_HEIGHT - 45, ctx));
    }
    if (Math.floor(Math.random() * 100) < PROBABILIDAD_RATA / 2) {
        const x = CANVAS_DIMENSIONS.width + 50;
        if (puedeAparecerEnemigo(x))
            undergroundRats.push(new Rat(x, CANVAS_DIMENSIONS.height - 45 + RAT_UNDERGROUND_OFFSET, ctx));
    }
}

// ===== CUCARACHAS =====
function cucarachasEnemies() {
    const ahora = Date.now();
    if (ahora - ultimaCucarachaLlamada < 300) return;
    ultimaCucarachaLlamada = ahora;
    if (Math.floor(Math.random() * 100) < PROBABILIDAD_CUCARACHA) {
        const x = CANVAS_DIMENSIONS.width;
        if (puedeAparecerEnemigo(x)) {
            cucarachas.push(new Cucaracha(x, CANVAS_DIMENSIONS.height - 55, ctx));
            totalCucarachasCreadas++;
        }
    }
}

// ===== COMIDA =====
function addRandomJunkFood() {
    const type = Math.floor(Math.random() * 100);
    const x    = Math.floor(Math.random() * (CANVAS_DIMENSIONS.width - 50));
    if      (type < 25) JunkyFood.push(new Potatos(x, 0, ctx));
    else if (type < 50) JunkyFood.push(new Coca(x, 0, ctx));
    else if (type < 75) JunkyFood.push(new Donuts(x, 0, ctx));
    else                JunkyFood.push(new Hamburger(x, 0, ctx));
}

// ===== MOSTRAR DATOS =====
function mostrarDatos(vida, x, y, fps) {
    if (!poka) return;
    const s = poka.getEstadisticas();

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, 900, 155);

    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#ff5555"; ctx.fillText("❤️ VIDA:", 10, 20);
    ctx.fillStyle = "white";   ctx.fillText(vida, 70, 20);
    ctx.fillStyle = "#88aa88"; ctx.fillText("🌍 CO₂:", 150, 20);
    ctx.fillStyle = "white";   ctx.fillText(`${s.co2} kg`, 210, 20);
    ctx.fillStyle = "#ffaa00"; ctx.fillText("📊 ESTADO:", 300, 20);
    ctx.fillStyle = s.estado === "NORMAL" ? "#00ff00" : s.estado === "DIABETES" ? "#ff0000" : "#ffaa00";
    ctx.fillText(s.estado, 380, 20);
    ctx.fillStyle = fps > 50 ? "#00ff00" : "#ffff00";
    ctx.fillText(`⚡ ${fps} FPS`, 750, 20);

    ctx.fillStyle = "#ffaa88"; ctx.fillText("⚖️ PESO +:", 10, 45);
    ctx.fillStyle = "white";   ctx.fillText(`${s.pesoGanado} kg`, 85, 45);
    ctx.fillStyle = "#ffff00"; ctx.fillText(`(+${s.ultimoIncremento} kg)`, 160, 45);
    const pct = Math.min(100, (s.pesoGanado / 25) * 100);
    ctx.fillStyle = "#333"; ctx.fillRect(250, 35, 200, 14);
    ctx.fillStyle = pct > 80 ? "#ff0000" : "#ffaa00";
    ctx.fillRect(250, 35, 200 * (pct / 100), 14);
    ctx.strokeStyle = "#fff"; ctx.strokeRect(250, 35, 200, 14);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffaa00"; ctx.fillText(`🍔 ${s.hamburguesas}`, 10,  70);
    ctx.fillStyle = "#ff5555"; ctx.fillText(`🥤 ${s.cocas}`,        80,  70);
    ctx.fillStyle = "#ffaa88"; ctx.fillText(`🍩 ${s.donas}`,        150, 70);
    ctx.fillStyle = "#ffaa00"; ctx.fillText(`🍟 ${s.papas}`,        220, 70);

    ctx.font = "bold 13px Arial";
    ctx.fillStyle = "#aa88ff"; ctx.fillText(`🐀 Ratas: ${rats.length}`, 10, 93);
    ctx.fillStyle = "#ffaa88"; ctx.fillText(`🪳 Cucarachas: ${cucarachas.length}`, 120, 93);
    ctx.fillStyle = "#8866aa"; ctx.fillText(`🕳️ Subterráneas: ${undergroundRats.length}`, 250, 93);

    const ec = s.esperanzaVida > 60 ? "#00ff00" : s.esperanzaVida > 40 ? "#ffff00" : "#ff0000";
    ctx.fillStyle = ec;        ctx.fillText(`⏳ ESPERANZA: ${s.esperanzaVida} años`, 10,  116);
    ctx.fillStyle = "#ff6600"; ctx.fillText(`📉 AÑOS PERDIDOS: ${s.añosPerdidos}`,  250, 116);

    ctx.fillStyle = "#444"; ctx.fillRect(botonPausa.x, botonPausa.y, botonPausa.w, botonPausa.h);
    ctx.strokeStyle = "#fff"; ctx.strokeRect(botonPausa.x, botonPausa.y, botonPausa.w, botonPausa.h);
    ctx.font = "20px Arial"; ctx.fillStyle = "#fff";
    ctx.fillText("⏸️", botonPausa.x + 8, botonPausa.y + 22);

    ctx.fillStyle = "#aa0000"; ctx.fillRect(botonSalir.x, botonSalir.y, botonSalir.w, botonSalir.h);
    ctx.strokeStyle = "#fff";  ctx.strokeRect(botonSalir.x, botonSalir.y, botonSalir.w, botonSalir.h);
    ctx.font = "bold 18px Arial"; ctx.fillStyle = "#fff";
    ctx.fillText("✖", botonSalir.x + 12, botonSalir.y + 22);

    ctx.font = "10px Arial"; ctx.fillStyle = "#888";
    ctx.fillText(`📍 mundo:${Math.floor(mundoPoka)}`, 780, 148);
}

// ===== CLICK =====
canvas.addEventListener('click', (e) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;

    if (mx >= botonPausa.x && mx <= botonPausa.x + botonPausa.w &&
        my >= botonPausa.y && my <= botonPausa.y + botonPausa.h) {
        juegoPausado = !juegoPausado;
        juegoPausado ? soundtrack.pause() : soundtrack.play().catch(() => {});
        return;
    }
    if (mx >= botonSalir.x && mx <= botonSalir.x + botonSalir.w &&
        my >= botonSalir.y && my <= botonSalir.y + botonSalir.h) {
        juegoPausado = false; soundtrack.pause();
        clearInterval(enemiesIntervalID);
        clearInterval(cucarachasIntervalID);
        clearInterval(junkFoodIntervalID);
        cancelAnimationFrame(animationFrameReqID);
        document.getElementById("start").style.display = 'block';
        canvas.classList.add("noShow");
        return;
    }
    if (mostrandoGameOver && gameOverCard &&
        mx >= 250 && mx <= 650 && my >= 550 && my <= 620) {
        gameOverCard = null; muerteScene = null; mostrandoGameOver = false;
        startGame();
    }
});

// ===== TECLADO =====
document.addEventListener("keydown", (e) => {
    if (!poka || juegoPausado || mostrandoGameOver) return;
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === "ArrowLeft")  keys.left  = true;
    if (e.key === " ") { keys.jump = true; e.preventDefault(); }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === "ArrowLeft")  keys.left  = false;
    if (e.key === " ")          keys.jump  = false;
});

setInterval(() => {
    console.log(`🐀 ${rats.length} | 🪳 ${cucarachas.length} | 🌍 mundoPoka:${Math.floor(mundoPoka)}`);
}, 10000);