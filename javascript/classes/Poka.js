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

        // Efectos
        this.temblor = 0;
        this.visionBorrosa = 0;
        this.tamanoOriginal = 80;

        // Años perdidos
        this.añosPerdidos = 0;
    }

    comer(tipo, factor) {
        const pesoAnterior = this.pesoGanado;

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
        else if (this.pesoGanado >= 20) {
            this.estado = "PREDIABETES";
        }
        else if (this.pesoGanado >= 15) {
            this.estado = "SEVERO";
        }
        else if (this.pesoGanado >= 10) {
            this.estado = "OBESO";
        }
        else if (this.pesoGanado >= 5) {
            this.estado = "SOBREPESO";
        }
        else {
            this.estado = "NORMAL";
        }
    }

    calcularAñosPerdidos() {
        // Cada 5kg de sobrepeso = 2 años perdidos
        // Cada 100kg CO2 = 1 año perdido
        // Cada 20 alimentos chatarra = 1 año perdido
        const porPeso = Math.floor(this.pesoGanado / 5) * 2;
        const porCO2 = Math.floor(this.totalCO2 / 100);
        const totalComida = this.contadorHamburguesas + this.contadorCocas +
            this.contadorDonas + this.contadorPapas;
        const porComida = Math.floor(totalComida / 20);

        this.añosPerdidos = porPeso + porCO2 + porComida;
    }

    aplicarEfectos() {
        this.velocidad = 50;
        this.jumpForce = 15;
        this.temblor = 0;
        this.visionBorrosa = 0;
        this.size = this.tamanoOriginal;

        switch(this.estado) {
            case "SOBREPESO":
                this.velocidad = 40;
                this.jumpForce = 12;
                this.size = this.tamanoOriginal + 5;
                break;
            case "OBESO":
                this.velocidad = 30;
                this.jumpForce = 9;
                this.size = this.tamanoOriginal + 10;
                break;
            case "SEVERO":
                this.velocidad = 20;
                this.jumpForce = 6;
                this.size = this.tamanoOriginal + 15;
                this.temblor = 2;
                break;
            case "PREDIABETES":
                this.velocidad = 15;
                this.jumpForce = 4;
                this.size = this.tamanoOriginal - 10;
                this.temblor = 5;
                this.visionBorrosa = 3;
                break;
            case "DIABETES":
                this.velocidad = 5;
                this.jumpForce = 2;
                this.size = this.tamanoOriginal - 20;
                this.temblor = 10;
                this.visionBorrosa = 8;
                break;
        }
    }

    calcularEsperanzaVida() {
        let esperanza = 80;
        esperanza -= this.pesoGanado * 1.5;
        esperanza -= Math.floor(this.totalCO2 / 50);
        return Math.max(0, Math.floor(esperanza));
    }

    redraw() {
        this.aplicarEfectos();

        this.ctx.save();

        if (this.temblor > 0) {
            const offsetX = (Math.random() - 0.5) * this.temblor;
            const offsetY = (Math.random() - 0.5) * this.temblor;
            this.ctx.translate(offsetX, offsetY);
        }

        if (this.visionBorrosa > 0) {
            this.ctx.filter = `blur(${this.visionBorrosa}px)`;
        }

        if (this.estado === "PREDIABETES" || this.estado === "DIABETES") {
            this.ctx.fillStyle = "rgba(200, 200, 200, 0.3)";
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