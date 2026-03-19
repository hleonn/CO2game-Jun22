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
            refresco: { kcal: 500, co2: 0.5, costo: 25, pesoPorUnidad: 0.133 },
            dona: { kcal: 600, co2: 1.0, costo: 50, pesoPorUnidad: 0.285 },
            papas: { kcal: 400, co2: 1.5, costo: 50, pesoPorUnidad: 0.2 }
        };

        // ===== ESTADÍSTICAS =====
        this.totalKcal = 0;
        this.totalCO2 = 0;
        this.totalGasto = 0;
        this.pesoGanado = 0;
        this.pesoInicial = 70;
        this.ultimoIncrementoPeso = 0;

        // Estados
        this.estado = "NORMAL";
        this.estadoAnterior = "NORMAL";

        // Efectos visuales
        this.temblor = 0;
        this.visionBorrosa = 0;
        this.tamanoOriginal = 80;

        this.añosPerdidos = 0;

        // ===== FÍSICA ESTILO MARIO BROS =====
        this.gravedad = 0.8;
        this.fuerzaSalto = -15;
        this.velocidadY = 0;
        this.enSuelo = true;
        this.saltando = false;
        this.saltoPresionado = false;
        this.tiempoSalto = 0;
        this.tiempoMaxSalto = 12; // Frames que puede mantener el salto

        // Altura original del suelo
        this.originalY = y;

        console.log("🆕 Poka creado con física Mario Bros");
    }

    comer(tipo, factor) {
        if (tipo === 'hamburguesa') this.contadorHamburguesas++;
        else if (tipo === 'refresco') this.contadorCocas++;
        else if (tipo === 'dona') this.contadorDonas++;
        else if (tipo === 'papas') this.contadorPapas++;

        this.totalKcal += factor.kcal;
        this.totalCO2 += factor.co2;
        this.totalGasto += factor.costo;
        this.pesoGanado += factor.pesoPorUnidad;
        this.ultimoIncrementoPeso = factor.pesoPorUnidad;

        this.heal(100);
        this.actualizarEstado();
        this.calcularAñosPerdidos();
    }

    comerHamburguesa() { this.comer('hamburguesa', this.factores.hamburguesa); }
    comerCoca() { this.comer('refresco', this.factores.refresco); }
    comerDona() { this.comer('dona', this.factores.dona); }
    comerPapas() { this.comer('papas', this.factores.papas); }

    actualizarEstado() {
        this.estadoAnterior = this.estado;

        if (this.pesoGanado >= 25) {
            this.estado = "DIABETES";
            this.vida = 0;
        }
        else if (this.pesoGanado >= 20) this.estado = "PREDIABETES";
        else if (this.pesoGanado >= 15) this.estado = "SEVERO";
        else if (this.pesoGanado >= 10) this.estado = "OBESO";
        else if (this.pesoGanado >= 5) this.estado = "SOBREPESO";
        else this.estado = "NORMAL";
    }

    calcularAñosPerdidos() {
        const porPeso = Math.floor(this.pesoGanado / 5) * 2;
        const porCO2 = Math.floor(this.totalCO2 / 100);
        const totalComida = this.contadorHamburguesas + this.contadorCocas +
            this.contadorDonas + this.contadorPapas;
        const porComida = Math.floor(totalComida / 20);
        this.añosPerdidos = porPeso + porCO2 + porComida;
    }

    // ===== FÍSICA ESTILO MARIO BROS =====
    aplicarFisica() {
        // Aplicar gravedad
        this.velocidadY += this.gravedad;
        this.y += this.velocidadY;

        // Detectar suelo
        if (this.y >= this.originalY) {
            this.y = this.originalY;
            this.velocidadY = 0;
            this.enSuelo = true;
            this.saltando = false;
            this.tiempoSalto = 0;
        } else {
            this.enSuelo = false;
        }
    }

    intentarSaltar(keys) {
        // Iniciar salto (solo si está en el suelo)
        if (keys.jump && this.enSuelo) {
            this.velocidadY = this.fuerzaSalto;
            this.saltando = true;
            this.tiempoSalto = 1;
            console.log("🦘 Salto iniciado");
        }

        // Salto variable (más alto si mantiene presionado)
        if (keys.jump && this.saltando && this.tiempoSalto < this.tiempoMaxSalto) {
            // Mantener impulso hacia arriba
            this.velocidadY = this.fuerzaSalto;
            this.tiempoSalto++;
        }
    }

    animate(keys) {
        // Aplicar física ANTES del salto
        this.aplicarFisica();

        // Intentar saltar (si está en el suelo)
        this.intentarSaltar(keys);

        // Aplicar efectos de estado
        this.aplicarEfectos();

        // Dibujar
        this.redraw();
    }

    aplicarEfectos() {
        // Velocidad base
        this.velocidad = 50;
        this.temblor = 0;
        this.visionBorrosa = 0;
        this.size = this.tamanoOriginal;

        // Ajustar salto según peso
        if (this.pesoGanado > 0) {
            switch(this.estado) {
                case "SOBREPESO":
                    this.velocidad = 45;
                    this.fuerzaSalto = -13;
                    this.size = this.tamanoOriginal + 3;
                    break;
                case "OBESO":
                    this.velocidad = 40;
                    this.fuerzaSalto = -11;
                    this.size = this.tamanoOriginal + 6;
                    break;
                case "SEVERO":
                    this.velocidad = 35;
                    this.fuerzaSalto = -9;
                    this.size = this.tamanoOriginal + 10;
                    this.temblor = 1;
                    break;
                case "PREDIABETES":
                    this.velocidad = 30;
                    this.fuerzaSalto = -7;
                    this.size = this.tamanoOriginal - 5;
                    this.temblor = 2;
                    this.visionBorrosa = 1;
                    break;
                case "DIABETES":
                    this.velocidad = 20;
                    this.fuerzaSalto = -5;
                    this.size = this.tamanoOriginal - 10;
                    this.temblor = 3;
                    this.visionBorrosa = 2;
                    break;
                default:
                    this.fuerzaSalto = -15;
            }
        } else {
            this.fuerzaSalto = -15;
        }
    }

    calcularEsperanzaVida() {
        let esperanza = 80;
        esperanza -= this.pesoGanado * 1.5;
        esperanza -= Math.floor(this.totalCO2 / 50);
        return Math.max(0, Math.floor(esperanza));
    }

    redraw() {
        this.ctx.save();

        if (this.temblor > 0) {
            const offsetX = (Math.random() - 0.5) * this.temblor;
            const offsetY = (Math.random() - 0.5) * this.temblor;
            this.ctx.translate(offsetX, offsetY);
        }

        if (this.visionBorrosa > 0) {
            this.ctx.filter = `blur(${this.visionBorrosa}px)`;
        }

        super.redraw();

        if (this.estado === "PREDIABETES") {
            this.ctx.font = "16px Arial";
            this.ctx.fillStyle = "#ff6600";
            this.ctx.fillText("⚠️", this.x - 10, this.y - 10);
        }
        else if (this.estado === "DIABETES") {
            this.ctx.font = "20px Arial";
            this.ctx.fillStyle = "#ff0000";
            this.ctx.fillText("💉", this.x - 15, this.y - 15);
        }

        this.ctx.restore();
    }

    getEstadisticas() {
        return {
            hamburguesas: this.contadorHamburguesas,
            cocas: this.contadorCocas,
            donas: this.contadorDonas,
            papas: this.contadorPapas,
            totalKcal: this.totalKcal,
            co2: this.totalCO2.toFixed(1),
            pesoGanado: this.pesoGanado.toFixed(2),
            pesoActual: (this.pesoInicial + this.pesoGanado).toFixed(1),
            pesoInicial: this.pesoInicial,
            gasto: this.totalGasto,
            estado: this.estado,
            esperanzaVida: this.calcularEsperanzaVida(),
            añosPerdidos: this.añosPerdidos,
            ultimoIncremento: this.ultimoIncrementoPeso.toFixed(3)
        };
    }
}