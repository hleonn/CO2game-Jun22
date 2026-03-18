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

// ===== CONSTANTES =====
const canvas = document.getElementById("workArea")
const ctx = canvas.getContext("2d")
const soundtrack = new Audio('./audio/main.mp3');

let animationFrameReqID = null;
let enemiesIntervalID = null;
let junkFoodIntervalID = null;
let gameTrack = null; // <-- AÑADIDO: referencia al fondo

const keys = { jump: false };

const CANVAS_DIMENSIONS = {
    width: 900,
    height: 600,
};

const _UNDERGROUND_HEIGHT = 40;
const MR_POKA_SIZE = 80;
const MR_POKA_OFFSET = 40;

let rats = [];
let undergroundRats = [];
let JunkyFood = [];

const pokaY = CANVAS_DIMENSIONS.height - MR_POKA_SIZE - MR_POKA_OFFSET;
let poka = null;

// ===== FUNCIÓN INTERSECTS =====
function intersects(r1, r2) {
    return !(r2.x > (r1.x + r1.w) ||
        (r2.x + r2.w) < r1.x ||
        r2.y > (r1.y + r1.h) ||
        (r2.y + r2.h) < r1.y);
}

// ===== FUNCIÓN STARTGAME =====
function startGame() {
    // <-- AÑADIDO: crear el fondo
    gameTrack = new GameTrack(CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height, ctx);

    poka = new Poka(10, pokaY, ctx);
    JunkyFood = [];
    rats = [];
    undergroundRats = [];

    document.getElementById("start").style.display = 'none';
    document.getElementById("gameover").style.display = 'none';
    canvas.classList.remove("noShow");

    updateWorkArea();

    soundtrack.currentTime = 0;
    soundtrack.play();

    enemiesIntervalID = setInterval(() => {
        ratsEnemies();
    }, 500);

    junkFoodIntervalID = setInterval(() => {
        addRandomJunkFood();
    }, 1000);
}

// ===== HACER STARTGAME GLOBAL =====
window.startGame = startGame;

// ===== UPDATE WORK AREA =====
function updateWorkArea() {
    ctx.clearRect(0, 0, 900, 600);

    // <-- CAMBIADO: usar la referencia y llamar a draw()
    if (gameTrack) {
        gameTrack.draw();
    }

    if (!poka.estaVivo()) {
        soundtrack.pause();
        document.getElementById("gameover").style.display = "block";
        canvas.classList.add("noShow");
        cancelAnimationFrame(animationFrameReqID);
        clearInterval(enemiesIntervalID);
        clearInterval(junkFoodIntervalID);
        return;
    }

    poka.animate(keys);

    rats.forEach((ratInstance, index) => {
        if (ratInstance == null) return;
        ratInstance.x -= 5;
        ratInstance.redraw();

        if (intersects(ratInstance.position(), poka.position())) {
            poka.damage(500);
            rats[index] = null;
        }
    });

    undergroundRats.forEach((ratInstance) => {
        ratInstance.redraw();
    });

    JunkyFood.forEach((elem, index) => {
        if (elem == null) return;
        elem.y += 1;
        elem.redraw();

        if (intersects(elem.position(), poka.position())) {
            poka.heal(100);
            JunkyFood[index] = null;
        }
    });

    mostrarDatos(poka.vida, poka.x, poka.y);
    animationFrameReqID = requestAnimationFrame(updateWorkArea);
}

// ===== RATAS ENEMIGAS =====
function ratsEnemies() {
    const ratasEnElPiso = Math.floor(Math.random() * 40);
    const ratasEnSubsuelo = Math.floor(Math.random() * 40);
    const numeros = [1, 32, 5, 38, 29];

    if (numeros.includes(ratasEnElPiso)) {
        const ratY = CANVAS_DIMENSIONS.height - _UNDERGROUND_HEIGHT - Rat.size;
        const rat = new Rat(850, ratY, ctx);
        rats.push(rat);
    }

    if (numeros.includes(ratasEnSubsuelo)) {
        const ratY = CANVAS_DIMENSIONS.height - Rat.size + 20;
        const rat = new Rat(CANVAS_DIMENSIONS.width, ratY, ctx);
        undergroundRats.push(rat);
    }
}

// ===== COMIDA CHATARRA =====
function addRandomJunkFood() {
    const randomJunkyFoodType = Math.floor(Math.random() * 40);
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

// ===== MOSTRAR DATOS =====
function mostrarDatos(vida, x, y) {
    ctx.font = "30px Arial";
    ctx.fillText(vida, 50, 40);
    ctx.fillStyle = "grey";
    ctx.font = "10px Arial";
    ctx.fillText(`X:${x}, Y${y}`, 750, 40);
    ctx.fillStyle = "yellow";
}

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