export class GameTrack {
    constructor(width, height, ctx) {
        this.width  = width;
        this.height = height;
        this.ctx    = ctx;

        this.fondo1 = new Image();
        this.fondo1.src = "./img/track.jpeg";

        this.fondo2 = new Image();
        this.fondo2.src = "./img/track02.png";

        this.offsetX      = 0;
        this.cambioFondo  = false;
        this.umbralCambio = 800;

        // ── Crossfade ──
        this.transitando   = false;   // true mientras dura el fade
        this.alphaFondo2   = 0;       // 0 = invisible, 1 = completamente visible
        this.velocidadFade = 0.015;   // cuánto sube el alpha por frame (~67 frames = ~1s a 60fps)

        this.cargado1 = false;
        this.cargado2 = false;

        this.limiteIzquierdo = 0;
        this.limiteDerecho   = 2000;

        this.fondo1.onload = () => { this.cargado1 = true; };
        this.fondo2.onload = () => { this.cargado2 = true; };
    }

    actualizarScroll(pokaX) {
        const centroPantalla = this.width / 2;

        if (pokaX > centroPantalla + 50) {
            this.offsetX = Math.min(
                this.limiteDerecho,
                this.offsetX + (pokaX - centroPantalla - 50) * 0.5
            );
        } else if (pokaX < centroPantalla - 50) {
            this.offsetX = Math.max(
                this.limiteIzquierdo,
                this.offsetX - (centroPantalla - 50 - pokaX) * 0.5
            );
        }

        // Disparar transición al cruzar el umbral
        if (!this.cambioFondo && this.offsetX > this.umbralCambio) {
            this.cambioFondo = true;
            this.transitando = true;
            console.log("🌅 Iniciando crossfade de fondo...");
        }

        // Avanzar el fade mientras está transitando
        if (this.transitando) {
            this.alphaFondo2 += this.velocidadFade;
            if (this.alphaFondo2 >= 1) {
                this.alphaFondo2 = 1;
                this.transitando = false;
                console.log("✅ Crossfade completado");
            }
        }
    }

    _dibujarFondo(imagen, alpha) {
        if (!imagen || !imagen.complete || imagen.naturalHeight === 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        const x = -this.offsetX;
        this.ctx.drawImage(imagen, x, 0, this.width * 3, this.height);

        // Repetir si se acaba
        if (x + this.width * 3 < this.width) {
            this.ctx.drawImage(imagen, x + this.width * 3, 0, this.width * 3, this.height);
        }

        this.ctx.restore();
    }

    draw(pokaX = 0) {
        this.actualizarScroll(pokaX);

        if (!this.cargado1 && !this.cargado2) {
            // Fondo de emergencia
            this.ctx.fillStyle = "#87CEEB";
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = "#8B4513";
            this.ctx.fillRect(0, this.height - 60, this.width, 60);
            return;
        }

        if (!this.cambioFondo) {
            // Solo fondo1, sin transición aún
            this._dibujarFondo(this.fondo1, 1);
        } else {
            // Crossfade: fondo1 se apaga mientras fondo2 aparece
            this._dibujarFondo(this.fondo1, 1 - this.alphaFondo2);
            this._dibujarFondo(this.fondo2, this.alphaFondo2);
        }

        // Barra de progreso (solo antes del cambio)
        if (!this.cambioFondo || this.transitando) {
            const progreso = Math.min(100, (this.offsetX / this.umbralCambio) * 100);
            this.ctx.fillStyle   = "rgba(0,0,0,0.5)";
            this.ctx.fillRect(10, 10, 200, 20);
            this.ctx.fillStyle   = progreso >= 100 ? "#00ff00" : "#ffff00";
            this.ctx.fillRect(10, 10, 200 * (progreso / 100), 20);
            this.ctx.strokeStyle = "#ffffff";
            this.ctx.strokeRect(10, 10, 200, 20);
        }
    }
}