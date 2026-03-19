export class GameTrack {
    constructor(width, height, ctx) {
        this.width = width;
        this.height = height;
        this.ctx = ctx;

        this.fondo1 = new Image();
        this.fondo1.src = "./img/track.jpeg";

        this.fondo2 = new Image();
        this.fondo2.src = "./img/track02.png";

        this.fondoActual = this.fondo1;
        this.offsetX = 0;
        this.cambioFondo = false;
        this.umbralCambio = 800;

        this.cargado1 = false;
        this.cargado2 = false;

        // Límites del mundo
        this.limiteIzquierdo = 0;
        this.limiteDerecho = 2000; // Cuánto puede avanzar

        this.fondo1.onload = () => { this.cargado1 = true; };
        this.fondo2.onload = () => { this.cargado2 = true; };
    }

    actualizarScroll(pokaX) {
        const centroPantalla = this.width / 2;

        // El scroll solo se activa cuando Poka pasa el centro
        if (pokaX > centroPantalla + 50) {
            // Mover el fondo hacia la izquierda (simula avance)
            this.offsetX = Math.min(
                this.limiteDerecho,
                this.offsetX + (pokaX - centroPantalla - 50) * 0.5
            );
        } else if (pokaX < centroPantalla - 50) {
            // Mover el fondo hacia la derecha (simula retroceso)
            this.offsetX = Math.max(
                this.limiteIzquierdo,
                this.offsetX - (centroPantalla - 50 - pokaX) * 0.5
            );
        }

        // Cambiar fondo
        if (!this.cambioFondo && this.offsetX > this.umbralCambio) {
            this.cambioFondo = true;
            this.fondoActual = this.fondo2;
        }
    }

    draw(pokaX = 0) {
        this.actualizarScroll(pokaX);

        const imagen = this.fondoActual;

        if (imagen && imagen.complete && imagen.naturalHeight > 0) {
            // Dibujar el fondo con desplazamiento
            const x = -this.offsetX;
            this.ctx.drawImage(imagen, x, 0, this.width * 3, this.height);

            // Si el fondo se está acabando, repetirlo
            if (x + this.width * 3 < this.width) {
                this.ctx.drawImage(imagen, x + this.width * 3, 0, this.width * 3, this.height);
            }
        } else {
            // Fondo de emergencia
            this.ctx.fillStyle = "#87CEEB";
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = "#8B4513";
            this.ctx.fillRect(0, this.height-60, this.width, 60);
        }

        // Barra de progreso
        const progreso = Math.min(100, (this.offsetX / this.umbralCambio) * 100);
        this.ctx.fillStyle = "rgba(0,0,0,0.5)";
        this.ctx.fillRect(10, 10, 200, 20);
        this.ctx.fillStyle = progreso >= 100 ? "#00ff00" : "#ffff00";
        this.ctx.fillRect(10, 10, 200 * (progreso / 100), 20);
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.strokeRect(10, 10, 200, 20);
    }
}