export class MuerteScene {
    constructor(poka, canvas) {
        this.poka = poka;
        this.canvas = canvas;
        this.timer = 0;
        this.fase = 0;
        this.ratasDevorando = [];
        this.sangre = [];
        this.gameOverLista = false;

        this.startX = poka.x;
        this.startY = poka.y;
        this.velocidadY = -15;
        this.gravedad = 0.8;

        try {
            this.muerteSound = new Audio('./audio/muerte.mp3');
            this.muerteSound.play();
        } catch(e) {}
    }

    update() {
        this.timer++;

        // FASE 0: Salto (0-20)
        if (this.timer < 20) {
            this.poka.y += this.velocidadY;
            this.velocidadY += this.gravedad;
            this.poka.rotacion = (this.poka.rotacion || 0) + 0.1;
            return false;
        }

        // FASE 1: Caída (20-50)
        if (this.timer >= 20 && this.timer < 50) {
            this.poka.y += 8;

            // Crear enemigos mientras cae
            if (this.timer % 10 === 0 && this.ratasDevorando.length < 5) {
                this.ratasDevorando.push({
                    x: this.poka.x + 50 + (Math.random() * 150),
                    y: this.poka.y + 30,
                    velocidad: 2 + Math.random() * 2,
                    tipo: Math.random() > 0.5 ? "rata" : "cucaracha"
                });
            }
            return false;
        }

        // FASE 2: Desvanecer (50-80)
        if (this.timer >= 50 && this.timer < 80) {
            this.poka.alpha = 1 - ((this.timer - 50) / 30);

            this.ratasDevorando.forEach(rata => {
                rata.x -= rata.velocidad;
            });
            return false;
        }

        // FASE 3: Terminar (80+)
        if (this.timer >= 80) {
            return true;
        }

        return false;
    }

    draw(ctx) {
        const oscuridad = Math.min(0.8, this.timer / 100);
        ctx.fillStyle = `rgba(0,0,0,${oscuridad})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar Poka
        ctx.save();
        ctx.translate(this.poka.x + 40, this.poka.y + 40);
        ctx.rotate(this.poka.rotacion || 0);
        ctx.translate(-40, -40);

        if (this.poka.alpha !== undefined) {
            ctx.globalAlpha = this.poka.alpha;
        }

        this.poka.redraw();
        ctx.restore();

        // Dibujar enemigos devorando
        this.ratasDevorando.forEach(rata => {
            if (rata.tipo === "rata") {
                // Rata
                ctx.fillStyle = "#333333";
                ctx.beginPath();
                ctx.ellipse(rata.x, rata.y, 20, 10, 0, 0, Math.PI * 2);
                ctx.fill();

                // Ojos rojos
                ctx.fillStyle = "#ff0000";
                ctx.beginPath();
                ctx.arc(rata.x + 15, rata.y - 5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(rata.x + 5, rata.y - 5, 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Cucaracha
                ctx.fillStyle = "#8B4513";
                ctx.beginPath();
                ctx.ellipse(rata.x, rata.y, 15, 7, 0, 0, Math.PI * 2);
                ctx.fill();

                // Antenas
                ctx.strokeStyle = "#8B4513";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(rata.x + 10, rata.y - 10);
                ctx.lineTo(rata.x + 15, rata.y - 15);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(rata.x + 5, rata.y - 10);
                ctx.lineTo(rata.x, rata.y - 15);
                ctx.stroke();
            }

            // Sangre
            if (rata.x < this.poka.x + 100) {
                ctx.fillStyle = "#aa0000";
                ctx.beginPath();
                ctx.arc(rata.x - 5, rata.y + 5, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Texto
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";

        if (this.timer < 30) {
            ctx.fillText("¡HAS MUERTO!", 450, 150);
        } else if (this.timer < 60) {
            ctx.fillText("GAME OVER", 450, 150);
        }

        ctx.textAlign = "left";
    }
}