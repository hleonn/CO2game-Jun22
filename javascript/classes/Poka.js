import { Actors } from './Actors.js';

export class Poka extends Actors {
    constructor(x, y, ctx) {
        let image = new Image();
        image.src = "./img/mr_poka.png";

        super(x, y, 80, ctx, image);

        // ===== CONTADORES POR TIPO =====
        this.contadorHamburguesas = 0;
        this.contadorCocas = 0;
        this.contadorDonas = 0;
        this.contadorPapas = 0;

        // ===== FACTORES DE CONVERSIÓN =====
        this.factores = {
            hamburguesa: { kcal: 1000, co2: 2.5, costo: 150, pesoPorUnidad: 1.0 },
            refresco:    { kcal: 500,  co2: 0.5, costo: 25,  pesoPorUnidad: 0.133 },
            dona:        { kcal: 600,  co2: 1.0, costo: 50,  pesoPorUnidad: 0.285 },
            papas:       { kcal: 400,  co2: 1.5, costo: 50,  pesoPorUnidad: 0.2 }
        };

        // ===== ESTADÍSTICAS =====
        this.totalKcal     = 0;
        this.totalCO2      = 0;
        this.totalGasto    = 0;
        this.pesoGanado    = 0;
        this.pesoInicial   = 70;
        this.ultimoIncrementoPeso = 0;
        this.añosPerdidos  = 0;

        // ===== ESTADOS =====
        this.estado         = "NORMAL";
        this.estadoAnterior = "NORMAL";

        // ===== EFECTOS VISUALES =====
        this.temblor       = 0;
        this.visionBorrosa = 0;
        this.tamanoOriginal = 80;

        // ===== FÍSICA MARIO BROS (usa dy/grounded de Actors) =====
        this.gravedad         = 0.6;   // Más suave = arco más "flotante" como Mario
        this.fuerzaSaltoBase  = -14;   // Impulso inicial
        this.saltando         = false;
        this.tiempoSalto      = 0;
        this.tiempoMaxSalto   = 10;    // Frames que puede extender el salto
        this.extension        = 0.9;   // Reducción por frame al mantener presionado
        this.corteSalto       = -4;    // Velocidad máx. hacia arriba al soltar

        // Evitar conflicto con Actors: usar dy de la clase padre
        this.dy = 0;

        console.log("🆕 Poka creado con física Mario Bros mejorada");
    }

    // ===================================================
    //  FÍSICA
    // ===================================================

    aplicarFisica() {
        // Gravedad siempre activa
        this.dy += this.gravedad;
        this.y  += this.dy;

        // Detectar suelo
        if (this.y >= this.originalY) {
            this.y        = this.originalY;
            this.dy       = 0;
            this.grounded = true;
            this.saltando = false;
            this.tiempoSalto = 0;
        } else {
            this.grounded = false;
        }
    }

    intentarSaltar(keys) {
        // ── Inicio del salto: solo desde el suelo ──
        if (keys.jump && this.grounded) {
            this.dy       = this.fuerzaSaltoBase;   // Impulso único
            this.saltando = true;
            this.tiempoSalto = 1;
            this.grounded = false;
        }

        // ── Extensión del salto: mantener presionado da más altura ──
        if (keys.jump && this.saltando && this.tiempoSalto < this.tiempoMaxSalto) {
            // Reducir gradualmente en lugar de resetear
            this.dy -= this.extension;
            this.tiempoSalto++;
        }

        // ── Corte de salto: soltar el botón acorta el salto (como Mario) ──
        if (!keys.jump && this.saltando && this.dy < this.corteSalto) {
            this.dy = this.corteSalto;
            this.saltando = false; // No más extensión este salto
        }
    }

    // ===================================================
    //  LOOP PRINCIPAL
    // ===================================================

    animate(keys) {
        this.aplicarFisica();
        this.intentarSaltar(keys);
        this.aplicarEfectos();
        this.redraw();
    }

    // ===================================================
    //  EFECTOS SEGÚN ESTADO
    // ===================================================

    aplicarEfectos() {
        // Resetear cada frame
        this.velocidad    = 50;
        this.temblor      = 0;
        this.visionBorrosa = 0;
        this.size         = this.tamanoOriginal;

        // Penalizaciones por estado — el personaje se vuelve más lento y torpe
        switch (this.estado) {
            case "SOBREPESO":
                this.velocidad        = 45;
                this.fuerzaSaltoBase  = -13;
                this.size             = this.tamanoOriginal + 3;
                break;
            case "OBESO":
                this.velocidad        = 40;
                this.fuerzaSaltoBase  = -11;
                this.size             = this.tamanoOriginal + 6;
                break;
            case "SEVERO":
                this.velocidad        = 35;
                this.fuerzaSaltoBase  = -9;
                this.size             = this.tamanoOriginal + 10;
                this.temblor          = 1;
                break;
            case "PREDIABETES":
                this.velocidad        = 30;
                this.fuerzaSaltoBase  = -7;
                this.size             = this.tamanoOriginal - 5;
                this.temblor          = 2;
                this.visionBorrosa    = 1;
                break;
            case "DIABETES":
                this.velocidad        = 20;
                this.fuerzaSaltoBase  = -5;
                this.size             = this.tamanoOriginal - 10;
                this.temblor          = 3;
                this.visionBorrosa    = 2;
                break;
            default: // NORMAL
                this.fuerzaSaltoBase  = -14;
                break;
        }
    }

    // ===================================================
    //  COMER
    // ===================================================

    comer(tipo, factor) {
        if (tipo === 'hamburguesa') this.contadorHamburguesas++;
        else if (tipo === 'refresco') this.contadorCocas++;
        else if (tipo === 'dona')     this.contadorDonas++;
        else if (tipo === 'papas')    this.contadorPapas++;

        this.totalKcal    += factor.kcal;
        this.totalCO2     += factor.co2;
        this.totalGasto   += factor.costo;
        this.pesoGanado   += factor.pesoPorUnidad;
        this.ultimoIncrementoPeso = factor.pesoPorUnidad;

        this.heal(100);
        this.actualizarEstado();
        this.calcularAñosPerdidos();
    }

    comerHamburguesa() { this.comer('hamburguesa', this.factores.hamburguesa); }
    comerCoca()        { this.comer('refresco',    this.factores.refresco); }
    comerDona()        { this.comer('dona',        this.factores.dona); }
    comerPapas()       { this.comer('papas',       this.factores.papas); }

    // ===================================================
    //  ESTADO Y ESTADÍSTICAS
    // ===================================================

    actualizarEstado() {
        this.estadoAnterior = this.estado;

        if      (this.pesoGanado >= 25) { this.estado = "DIABETES";    this.vida = 0; }
        else if (this.pesoGanado >= 20)   this.estado = "PREDIABETES";
        else if (this.pesoGanado >= 15)   this.estado = "SEVERO";
        else if (this.pesoGanado >= 10)   this.estado = "OBESO";
        else if (this.pesoGanado >= 5)    this.estado = "SOBREPESO";
        else                              this.estado = "NORMAL";
    }

    calcularAñosPerdidos() {
        const porPeso   = Math.floor(this.pesoGanado / 5) * 2;
        const porCO2    = Math.floor(this.totalCO2 / 100);
        const totalComida = this.contadorHamburguesas + this.contadorCocas +
            this.contadorDonas + this.contadorPapas;
        const porComida = Math.floor(totalComida / 20);
        this.añosPerdidos = porPeso + porCO2 + porComida;
    }

    calcularEsperanzaVida() {
        let esperanza = 80;
        esperanza -= this.pesoGanado * 1.5;
        esperanza -= Math.floor(this.totalCO2 / 50);
        return Math.max(0, Math.floor(esperanza));
    }

    // ===================================================
    //  DIBUJO
    // ===================================================

    redraw() {
        this.ctx.save();

        // Temblor
        if (this.temblor > 0) {
            const ox = (Math.random() - 0.5) * this.temblor * 2;
            const oy = (Math.random() - 0.5) * this.temblor * 2;
            this.ctx.translate(ox, oy);
        }

        // Visión borrosa
        if (this.visionBorrosa > 0) {
            this.ctx.filter = `blur(${this.visionBorrosa}px)`;
        }

        super.redraw();

        // Iconos de estado
        if (this.estado === "PREDIABETES") {
            this.ctx.font      = "16px Arial";
            this.ctx.fillStyle = "#ff6600";
            this.ctx.fillText("⚠️", this.x - 10, this.y - 10);
        } else if (this.estado === "DIABETES") {
            this.ctx.font      = "20px Arial";
            this.ctx.fillStyle = "#ff0000";
            this.ctx.fillText("💉", this.x - 15, this.y - 15);
        }

        this.ctx.restore();
    }

    getEstadisticas() {
        return {
            hamburguesas:    this.contadorHamburguesas,
            cocas:           this.contadorCocas,
            donas:           this.contadorDonas,
            papas:           this.contadorPapas,
            totalKcal:       this.totalKcal,
            co2:             this.totalCO2.toFixed(1),
            pesoGanado:      this.pesoGanado.toFixed(2),
            pesoActual:      (this.pesoInicial + this.pesoGanado).toFixed(1),
            pesoInicial:     this.pesoInicial,
            gasto:           this.totalGasto,
            estado:          this.estado,
            esperanzaVida:   this.calcularEsperanzaVida(),
            añosPerdidos:    this.añosPerdidos,
            ultimoIncremento: this.ultimoIncrementoPeso.toFixed(3)
        };
    }
}