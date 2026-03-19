export class MuerteScene {
    constructor(poka, canvas) {
        this.poka   = poka;
        this.canvas = canvas;
        this.timer  = 0;

        // ── Centro del canvas: aquí cae Poka y aquí van los enemigos ──
        this.cx = canvas.width  / 2;   // 450
        this.cy = canvas.height / 2;   // centro vertical

        // Posición propia de Poka durante la animación
        // Empieza en el centro-arriba y cae al centro
        this.pokaX      = this.cx - 40;
        this.pokaY      = this.cy - 150;  // Un poco arriba del centro
        this.velocidadY = -15;
        this.gravedad   = 0.8;
        this.suelo      = this.cy - 40;   // Donde aterriza (centro del canvas)

        // Estado visual
        this.rotacion    = 0;
        this.alpha       = 1;
        this.pokaEscala  = 1;
        this.pokaVisible = true;
        this.temblor     = 0;

        // Enemigos, sangre y manchas
        this.enemigos = [];
        this.sangre   = [];
        this.manchas  = [];

        this._spawnEnemigos();

        try {
            this.muerteSound = new Audio('./audio/muerte.mp3');
            this.muerteSound.play();
        } catch(e) {}
    }

    // ===================================================
    //  SPAWN: todos los enemigos apuntan al centro
    // ===================================================
    _spawnEnemigos() {
        for (let i = 0; i < 22; i++) {
            const tipo  = Math.random() > 0.5 ? "rata" : "cucaracha";
            const borde = Math.floor(Math.random() * 4);
            let sx, sy;

            switch (borde) {
                case 0: sx = Math.random() * this.canvas.width;  sy = -25; break;
                case 1: sx = Math.random() * this.canvas.width;  sy = this.canvas.height + 25; break;
                case 2: sx = -25;                                 sy = Math.random() * this.canvas.height; break;
                default:sx = this.canvas.width + 25;              sy = Math.random() * this.canvas.height; break;
            }

            // Apuntar al centro del canvas con variación leve
            const dx   = this.cx - sx + (Math.random() - 0.5) * 60;
            const dy   = this.suelo - sy + (Math.random() - 0.5) * 60;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const spd  = 1.8 + Math.random() * 2.2;

            this.enemigos.push({
                x: sx, y: sy,
                vx: (dx / dist) * spd,
                vy: (dy / dist) * spd,
                tipo,
                angulo:       Math.atan2(dy, dx),
                llegó:        false,
                delay:        Math.floor(Math.random() * 40),
                escala:       0.7 + Math.random() * 0.7,
                mordidaTimer: 0,
                mordida:      0
            });
        }
    }

    // ===================================================
    //  SANGRE
    // ===================================================
    _emitirSangre(x, y, cantidad = 6, fuerza = 4) {
        for (let i = 0; i < cantidad; i++) {
            const ang = Math.random() * Math.PI * 2;
            const f   = (0.5 + Math.random()) * fuerza;
            this.sangre.push({
                x, y,
                vx:    Math.cos(ang) * f,
                vy:    Math.sin(ang) * f - 1,
                radio: 2 + Math.random() * 5,
                vida:  1.0,
                decay: 0.012 + Math.random() * 0.018
            });
        }
        if (Math.random() > 0.5) {
            this.manchas.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 10,
                r: 4 + Math.random() * 10,
                a: 0.6 + Math.random() * 0.4
            });
        }
    }

    _actualizarSangre() {
        this.sangre.forEach(p => {
            p.x  += p.vx;
            p.y  += p.vy;
            p.vx *= 0.90;
            p.vy *= 0.90;
            p.vy += 0.2;
            p.vida  -= p.decay;
            p.radio  = Math.max(0, p.radio - 0.04);
        });
        this.sangre = this.sangre.filter(p => p.vida > 0);
    }

    // ===================================================
    //  UPDATE
    // ===================================================
    update() {
        this.timer++;
        const t = this.timer;

        // ── FASE 0: Salto girando (0–30) ──
        if (t <= 30) {
            this.pokaY      += this.velocidadY;
            this.velocidadY += this.gravedad;
            this.rotacion    = Math.min(this.rotacion + 0.15, Math.PI);
            return false;
        }

        // ── FASE 1: Caída al suelo (30–80) ──
        if (t <= 80) {
            if (this.pokaY < this.suelo) {
                this.pokaY += 9;
            } else {
                this.pokaY = this.suelo;
            }
            if (t === 60) {
                this.temblor = 8;
                this._emitirSangre(this.cx, this.suelo + 40, 12, 5);
            }
            if (this.temblor > 0) this.temblor -= 0.3;
            this._actualizarSangre();
            return false;
        }

        // ── FASE 2: Enemigos se acercan al centro (80–200) ──
        if (t <= 200) {
            this.enemigos.forEach(e => {
                if (t < 80 + e.delay) return;
                const dx   = this.cx     - e.x;
                const dy   = this.suelo  - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 35) {
                    e.x     += e.vx;
                    e.y     += e.vy;
                    e.angulo = Math.atan2(e.vy, e.vx);
                } else {
                    e.llegó = true;
                }
            });

            if (this.temblor > 0) this.temblor -= 0.1;
            this._actualizarSangre();
            return false;
        }

        // ── FASE 3: Devorar a Poka (200–340) ──
        if (t <= 340) {
            const progreso  = (t - 200) / 140;
            this.pokaEscala = Math.max(0, 1 - progreso * 1.05);

            if (t % 5 === 0) {
                this._emitirSangre(
                    this.cx + (Math.random() - 0.5) * 50,
                    this.suelo + 40 + (Math.random() - 0.5) * 30,
                    8, 6
                );
            }

            this.enemigos.forEach(e => {
                if (!e.llegó) return;
                e.mordidaTimer++;
                e.mordida = Math.sin(e.mordidaTimer * 0.5) * 5;
            });

            this.temblor = 3 + Math.sin(t * 0.3) * 2;
            this._actualizarSangre();
            return false;
        }

        // ── FASE 4: Poka desaparece, enemigos se dispersan (340–440) ──
        if (t <= 440) {
            this.pokaVisible = false;
            this.temblor     = 0;

            this.enemigos.forEach(e => {
                e.x += (Math.random() - 0.5) * 1.5;
                e.y += (Math.random() - 0.5) * 1.5;
            });

            if (t % 15 === 0) {
                this._emitirSangre(this.cx, this.suelo + 40, 4, 2);
            }

            this._actualizarSangre();
            return false;
        }

        // ── FASE 5: Fade a negro (440–500) ──
        if (t <= 500) {
            this.alpha = 1 - ((t - 440) / 60);
            this._actualizarSangre();
            return false;
        }

        // ── FASE 6: Fin → GameOverCard ──
        return true;
    }

    // ===================================================
    //  DRAW
    // ===================================================
    draw(ctx) {
        const t = this.timer;

        // Temblor de pantalla
        const tx = this.temblor > 0 ? (Math.random() - 0.5) * this.temblor : 0;
        const ty = this.temblor > 0 ? (Math.random() - 0.5) * this.temblor : 0;
        ctx.save();
        ctx.translate(tx, ty);

        // Fondo oscuro progresivo
        const oscuridad = Math.min(0.88, t / 60);
        ctx.fillStyle = `rgba(0,0,0,${oscuridad})`;
        ctx.fillRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);

        // Manchas permanentes de sangre
        this.manchas.forEach(m => {
            ctx.save();
            ctx.globalAlpha = m.a * this.alpha;
            ctx.fillStyle   = "#6b0000";
            ctx.beginPath();
            ctx.ellipse(m.x, m.y, m.r, m.r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Partículas de sangre
        this.sangre.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.vida * this.alpha;
            ctx.fillStyle   = `hsl(${Math.random() * 12}, 90%, ${18 + Math.random() * 14}%)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Poka centrado
        if (this.pokaVisible && this.pokaEscala > 0) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.cx, this.pokaY + 40);
            ctx.rotate(this.rotacion);
            ctx.scale(this.pokaEscala, this.pokaEscala);
            ctx.translate(-40, -40);
            // Dibujar en posición 0,0
            const origX = this.poka.x;
            const origY = this.poka.y;
            this.poka.x = 0;
            this.poka.y = 0;
            this.poka.redraw();
            this.poka.x = origX;
            this.poka.y = origY;
            ctx.restore();
        }

        // Enemigos
        this.enemigos.forEach(e => {
            if (t < 80 + e.delay) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(e.x + e.mordida, e.y);
            ctx.rotate(e.angulo);
            ctx.scale(e.escala, e.escala);
            e.tipo === "rata" ? this._dibujarRata(ctx) : this._dibujarCucaracha(ctx);
            ctx.restore();
        });

        // GAME OVER con fade-in
        if (t >= 50) {
            const fadeIn = Math.min(1, (t - 50) / 40);
            ctx.save();
            ctx.globalAlpha = fadeIn * this.alpha;
            ctx.font        = "bold 62px Arial";
            ctx.textAlign   = "center";
            ctx.strokeStyle = "#000";
            ctx.lineWidth   = 6;
            ctx.fillStyle   = "#ff1a1a";
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur  = 20;
            ctx.strokeText("GAME OVER", this.canvas.width / 2, 100);
            ctx.fillText  ("GAME OVER", this.canvas.width / 2, 100);
            ctx.textAlign = "left";
            ctx.restore();
        }

        ctx.restore(); // fin temblor
    }

    // ===================================================
    //  DIBUJO DE ENEMIGOS
    // ===================================================
    _dibujarRata(ctx) {
        ctx.strokeStyle = "#888";
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.quadraticCurveTo(-38, -14, -42, 6);
        ctx.stroke();

        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#3a3a3a";
        ctx.beginPath();
        ctx.ellipse(23, -3, 10, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cc7777";
        ctx.beginPath();
        ctx.ellipse(17, -12, 5, 7, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(27, -6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ccc";
        ctx.lineWidth   = 0.8;
        [[-5,-8],[-5,-5],[-5,-2]].forEach(([ox,oy]) => {
            ctx.beginPath();
            ctx.moveTo(28+ox, oy);
            ctx.lineTo(38+ox, oy-2);
            ctx.stroke();
        });
    }

    _dibujarCucaracha(ctx) {
        ctx.fillStyle = "#5C3317";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#3d2008";
        ctx.beginPath();
        ctx.ellipse(19, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#3d2008";
        ctx.lineWidth   = 1.5;
        ctx.beginPath(); ctx.moveTo(23,-3); ctx.lineTo(36,-13); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(23,-1); ctx.lineTo(36,-5);  ctx.stroke();

        ctx.strokeStyle = "#3d2008";
        ctx.lineWidth   = 1;
        [-10,0,10].forEach(ox => {
            ctx.beginPath(); ctx.moveTo(ox,-8);  ctx.lineTo(ox-5,-16); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ox, 8);  ctx.lineTo(ox-5, 16); ctx.stroke();
        });

        ctx.fillStyle = "#ff4400";
        ctx.beginPath();
        ctx.arc(22, -3, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}