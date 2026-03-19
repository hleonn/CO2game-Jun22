export class GameTrack {
    constructor(width, height, ctx) {
        this.width  = width;
        this.height = height;
        this.ctx    = ctx;

        this.fondo1 = new Image(); this.fondo1.src = "./img/track.jpeg";
        this.fondo2 = new Image(); this.fondo2.src = "./img/track02.png";
        this.fondo3 = new Image(); this.fondo3.src = "./img/track03.png";
        this.fondo4 = new Image(); this.fondo4.src = "./img/track04.png";
        this.fondo5 = new Image(); this.fondo5.src = "./img/track05.png";

        this.offsetX = 0;

        // ── ~2000px por zona ──
        this.umbral1a2 = 1800;
        this.umbral2a3 = 3800;
        this.umbral3a4 = 5800;
        this.umbral4a5 = 7800;

        this.fondoActivo     = 1;
        this.fondoSiguiente  = 1;
        this.transitando     = false;
        this.alphaTransicion = 0;
        this.velocidadFade   = 0.005;

        this.cargado1 = false; this.cargado2 = false;
        this.cargado3 = false; this.cargado4 = false; this.cargado5 = false;

        this.limiteIzquierdo = 0;
        this.limiteDerecho   = 9500;

        this.fondo1.onload = () => { this.cargado1 = true; };
        this.fondo2.onload = () => { this.cargado2 = true; };
        this.fondo3.onload = () => { this.cargado3 = true; };
        this.fondo4.onload = () => { this.cargado4 = true; };
        this.fondo5.onload = () => { this.cargado5 = true; };
    }

    actualizarScroll(delta) {
        if (Math.abs(delta) < 0.5) return 0;

        const offsetAnterior = this.offsetX;
        this.offsetX = Math.max(
            this.limiteIzquierdo,
            Math.min(this.limiteDerecho, this.offsetX + delta)
        );

        const deltaReal = this.offsetX - offsetAnterior;

        const fondoEsperado = this.offsetX >= this.umbral4a5 ? 5
            : this.offsetX >= this.umbral3a4 ? 4
                : this.offsetX >= this.umbral2a3 ? 3
                    : this.offsetX >= this.umbral1a2 ? 2
                        : 1;

        if (fondoEsperado !== this.fondoActivo && !this.transitando) {
            this.transitando     = true;
            this.alphaTransicion = 0;
            this.fondoSiguiente  = fondoEsperado;
        }

        if (this.transitando) {
            this.alphaTransicion += this.velocidadFade;
            if (this.alphaTransicion >= 1) {
                this.alphaTransicion = 1;
                this.transitando     = false;
                this.fondoActivo     = this.fondoSiguiente;
            }
        }

        return deltaReal;
    }

    _getFondo(n) {
        if (n === 1) return this.fondo1;
        if (n === 2) return this.fondo2;
        if (n === 3) return this.fondo3;
        if (n === 4) return this.fondo4;
        return this.fondo5;
    }

    _dibujarFondo(img, alpha) {
        if (!img || !img.complete || img.naturalHeight === 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        const escala = this.height / img.naturalHeight;
        const imgW   = img.naturalWidth * escala;
        const imgH   = this.height;

        let startX = -(this.offsetX % imgW);
        if (startX > 0) startX -= imgW;

        while (startX < this.width) {
            this.ctx.drawImage(img, startX, 0, imgW, imgH);
            startX += imgW;
        }

        this.ctx.restore();
    }

    draw(deltaX = 0) {
        const deltaReal = this.actualizarScroll(deltaX);

        if (!this.cargado1 && !this.cargado2 && !this.cargado3 && !this.cargado4 && !this.cargado5) {
            this.ctx.fillStyle = "#87CEEB";
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = "#8B4513";
            this.ctx.fillRect(0, this.height - 60, this.width, 60);
            return deltaReal;
        }

        if (this.transitando) {
            this._dibujarFondo(this._getFondo(this.fondoActivo),    1 - this.alphaTransicion);
            this._dibujarFondo(this._getFondo(this.fondoSiguiente), this.alphaTransicion);
        } else {
            this._dibujarFondo(this._getFondo(this.fondoActivo), 1);
        }

        this._dibujarBarraProgreso();
        return deltaReal;
    }

    _dibujarBarraProgreso() {
        let progreso, etiqueta;

        if (this.offsetX < this.umbral1a2) {
            progreso = Math.min(100, (this.offsetX / this.umbral1a2) * 100);
            etiqueta = `Zona 1: ${Math.floor(progreso)}%`;
        } else if (this.offsetX < this.umbral2a3) {
            const rango = this.umbral2a3 - this.umbral1a2;
            progreso = Math.min(100, ((this.offsetX - this.umbral1a2) / rango) * 100);
            etiqueta = `Zona 2: ${Math.floor(progreso)}%`;
        } else if (this.offsetX < this.umbral3a4) {
            const rango = this.umbral3a4 - this.umbral2a3;
            progreso = Math.min(100, ((this.offsetX - this.umbral2a3) / rango) * 100);
            etiqueta = `Zona 3: ${Math.floor(progreso)}%`;
        } else if (this.offsetX < this.umbral4a5) {
            const rango = this.umbral4a5 - this.umbral3a4;
            progreso = Math.min(100, ((this.offsetX - this.umbral3a4) / rango) * 100);
            etiqueta = `Zona 4: ${Math.floor(progreso)}%`;
        } else {
            progreso = 100;
            etiqueta = "✅ Zona 5";
        }

        this.ctx.fillStyle   = "rgba(0,0,0,0.5)";
        this.ctx.fillRect(10, 10, 200, 20);
        this.ctx.fillStyle   = progreso >= 100 ? "#00ff00" : "#ffff00";
        this.ctx.fillRect(10, 10, 200 * (progreso / 100), 20);
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.strokeRect(10, 10, 200, 20);
        this.ctx.font        = "bold 11px Arial";
        this.ctx.fillStyle   = "#ffffff";
        this.ctx.fillText(etiqueta, 15, 25);
    }
}