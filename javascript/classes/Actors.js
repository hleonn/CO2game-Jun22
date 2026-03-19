export class Actors {
    constructor(x, y, size, ctx, img) {
        this.originalY = y;
        this.x = x;
        this.y = y;
        this.size = size;
        this.vida = 2000;
        this.velocidad = 50;
        this.ctx = ctx;
        this.img = img;
        this.dy = 0;
        this.jumpForce = 15;
        this.grounded = false;
        this.jumpTimer = 0;

        img.onload = () => this.redraw();
    }

    position() {
        return {
            x: this.x,
            y: this.y,
            w: this.size,
            h: this.size,
        };
    }

    damage(dam) {
        this.vida -= dam;
    }

    heal(v) {
        this.vida += v;
    }

    moverAlFrente() {
        this.x += this.velocidad;
    }

    moverAtras() {
        this.x -= this.velocidad;
    }

    estaVivo() {
        return this.vida > 0;
    }

    redraw() {
        if (this.img.complete) {
            this.ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
        }
    }
}