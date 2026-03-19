import { Actors } from './Actors.js';

export class Poka extends Actors {
    constructor(x, y, ctx) {
        let image = new Image();
        image.src = "./img/mr_poka.png";

        super(x, y, 80, ctx, image);

        // ===== SPRITES =====
        this.imgNormal = image;

        this.imgViejo = new Image();
        this.imgViejo.src = "./img/mr_oldpoka.png";

        // ===== TAMAÑOS Y OFFSETS POR SPRITE =====
        // mr_poka.png:    tamaño base 80px, sin offset
        // mr_oldpoka.png: se dibuja más grande y un poco más arriba
        //                 para que visualmente ocupe el mismo espacio
        this.tamanoNormal = 80;
        this.tamanoViejo  = 100;  // más grande para compensar transparencias
        this.offsetYViejo = -20;  // sube 20px para que no se hunda en el suelo

        // ===== CONTADORES POR TIPO =====
        this.contadorHamburguesas = 0;
        this.contadorCocas        = 0;
        this.contadorDonas        = 0;
        this.contadorPapas        = 0;

        // ===== FACTORES DE CONVERSIÓN =====
        this.factores = {
            hamburguesa: { kcal: 1000, co2: 2.5, costo: 150, pesoPorUnidad: 1.0   },
            refresco:    { kcal: 500,  co2: 0.5, costo: 25,  pesoPorUnidad: 0.133 },
            dona:        { kcal: 600,  co2: 1.0, costo: 50,  pesoPorUnidad: 0.285 },
            papas:       { kcal: 400,  co2: 1.5, costo: 50,  pesoPorUnidad: 0.2   }
        };

        // ===== ESTADÍSTICAS =====
        this.totalKcal            = 0;
        this.totalCO2             = 0;
        this.totalGasto           = 0;
        this.pesoGanado           = 0;
        this.pesoInicial          = 70;
        this.ultimoIncrementoPeso = 0;
        this.añosPerdidos         = 0;

        // ===== ESTADOS =====
        this.estado         = "NORMAL";
        this.estadoAnterior = "NORMAL";

        // ===== EFECTOS VISUALES =====
        this.temblor        = 0;
        this.visionBorrosa  = 0;
        this.tamanoOriginal = 80;
        this.drawOffsetY    = 0; // offset de dibujo según sprite activo

        // ===== FÍSICA MARIO BROS =====
        this.gravedad        = 0.6;
        this.fuerzaSaltoBase = -14;
        this.saltando        = false;
        this.tiempoSalto     = 0;
        this.tiempoMaxSalto  = 10;
        this.extension       = 0.9;
        this.corteSalto      = -4;
        this.dy              = 0;

        console.log("🆕 Poka creado");
    }

    // ===================================================
    //  FÍSICA
    // ===================================================

    aplicarFisica() {
        this.dy += this.gravedad;
        this.y  += this.dy;

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
        if (keys.jump && this.grounded) {
            this.dy          = this.fuerzaSaltoBase;
            this.saltando    = true;
            this.tiempoSalto = 1;
            this.grounded    = false;
        }

        if (keys.jump && this.saltando && this.tiempoSalto < this.tiempoMaxSalto) {
            this.dy -= this.extension;
            this.tiempoSalto++;
        }

        if (!keys.jump && this.saltando && this.dy < this.corteSalto) {
            this.dy       = this.corteSalto;
            this.saltando = false;
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
        this.velocidad     = 50;
        this.temblor       = 0;
        this.visionBorrosa = 0;

        switch (this.estado) {
            case "SOBREPESO":
                this.velocidad       = 45;
                this.fuerzaSaltoBase = -13;
                this.size            = this.tamanoNormal;
                this.drawOffsetY     = 0;
                this.img             = this.imgNormal;
                break;

            case "OBESO":
                this.velocidad       = 40;
                this.fuerzaSaltoBase = -11;
                this.size            = this.tamanoNormal;
                this.drawOffsetY     = 0;
                this.img             = this.imgNormal;
                break;

            case "SEVERO":
                this.velocidad       = 35;
                this.fuerzaSaltoBase = -9;
                this.temblor         = 1;
                this.size            = this.tamanoViejo;   // más grande
                this.drawOffsetY     = this.offsetYViejo;  // sube para no hundirse
                this.img             = this.imgViejo;
                break;

            case "PREDIABETES":
                this.velocidad       = 28;
                this.fuerzaSaltoBase = -7;
                this.temblor         = 2;
                this.visionBorrosa   = 1;
                this.size            = this.tamanoViejo;
                this.drawOffsetY     = this.offsetYViejo;
                this.img             = this.imgViejo;
                break;

            case "DIABETES":
                this.velocidad       = 18;
                this.fuerzaSaltoBase = -5;
                this.temblor         = 3;
                this.visionBorrosa   = 2;
                this.size            = this.tamanoViejo;
                this.drawOffsetY     = this.offsetYViejo;
                this.img             = this.imgViejo;
                break;

            default: // NORMAL
                this.fuerzaSaltoBase = -14;
                this.size            = this.tamanoNormal;
                this.drawOffsetY     = 0;
                this.img             = this.imgNormal;
                break;
        }
    }

    // ===================================================
    //  COMER
    // ===================================================

    comer(tipo, factor) {
        if      (tipo === 'hamburguesa') this.contadorHamburguesas++;
        else if (tipo === 'refresco')    this.contadorCocas++;
        else if (tipo === 'dona')        this.contadorDonas++;
        else if (tipo === 'papas')       this.contadorPapas++;

        this.totalKcal            += factor.kcal;
        this.totalCO2             += factor.co2;
        this.totalGasto           += factor.costo;
        this.pesoGanado           += factor.pesoPorUnidad;
        this.ultimoIncrementoPeso  = factor.pesoPorUnidad;

        this.heal(100);
        this.actualizarEstado();
        this.calcularAñosPerdidos();
    }

    comerHamburguesa() { this.comer('hamburguesa', this.factores.hamburguesa); }
    comerCoca()        { this.comer('refresco',    this.factores.refresco);    }
    comerDona()        { this.comer('dona',        this.factores.dona);        }
    comerPapas()       { this.comer('papas',       this.factores.papas);       }

    // ===================================================
    //  ESTADO
    // ===================================================

    actualizarEstado() {
        this.estadoAnterior = this.estado;

        if      (this.pesoGanado >= 25) { this.estado = "DIABETES";    this.vida = 0; }
        else if (this.pesoGanado >= 20)   this.estado = "PREDIABETES";
        else if (this.pesoGanado >= 15)   this.estado = "SEVERO";
        else if (this.pesoGanado >= 10)   this.estado = "OBESO";
        else if (this.pesoGanado >= 5)    this.estado = "SOBREPESO";
        else                              this.estado = "NORMAL";

        if (this.estado !== this.estadoAnterior) {
            console.log(`⚠️ Estado: ${this.estadoAnterior} → ${this.estado}`);
            if (this.estado === "SEVERO") {
                console.log("👴 Poka envejece: activando sprite mr_oldpoka");
            }
        }
    }

    calcularAñosPerdidos() {
        const porPeso     = Math.floor(this.pesoGanado / 5) * 2;
        const porCO2      = Math.floor(this.totalCO2 / 100);
        const totalComida = this.contadorHamburguesas + this.contadorCocas +
            this.contadorDonas        + this.contadorPapas;
        const porComida   = Math.floor(totalComida / 20);
        this.añosPerdidos = porPeso + porCO2 + porComida;
    }

    calcularEsperanzaVida() {
        let esperanza  = 80;
        esperanza     -= this.pesoGanado * 1.5;
        esperanza     -= Math.floor(this.totalCO2 / 50);
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

        // Dibujar sprite con offset Y para alinear al suelo
        if (this.img && this.img.complete) {
            this.ctx.drawImage(
                this.img,
                this.x,
                this.y + this.drawOffsetY,  // ← offset aplicado solo al dibujo
                this.size,
                this.size
            );
        }

        // Ícono de diabetes
        if (this.estado === "DIABETES") {
            this.ctx.filter    = "none";
            this.ctx.font      = "20px Arial";
            this.ctx.fillStyle = "#ff0000";
            this.ctx.fillText("💉", this.x - 5, this.y + this.drawOffsetY - 10);
        }

        this.ctx.restore();
    }

    getEstadisticas() {
        return {
            hamburguesas:     this.contadorHamburguesas,
            cocas:            this.contadorCocas,
            donas:            this.contadorDonas,
            papas:            this.contadorPapas,
            totalKcal:        this.totalKcal,
            co2:              this.totalCO2.toFixed(1),
            pesoGanado:       this.pesoGanado.toFixed(2),
            pesoActual:       (this.pesoInicial + this.pesoGanado).toFixed(1),
            pesoInicial:      this.pesoInicial,
            gasto:            this.totalGasto,
            estado:           this.estado,
            esperanzaVida:    this.calcularEsperanzaVida(),
            añosPerdidos:     this.añosPerdidos,
            ultimoIncremento: this.ultimoIncrementoPeso.toFixed(3)
        };
    }
}