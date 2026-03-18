export class GameOverCard {
    constructor(poka) {
        this.poka = poka;
        this.stats = poka.getEstadisticas();
    }

    draw(ctx, canvas) {
        // Fondo negro
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título
        ctx.font = "bold 60px Arial";
        ctx.fillStyle = "#ff0000";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", 450, 80);

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(200, 100);
        ctx.lineTo(700, 100);
        ctx.stroke();

        // ===== CONSUMO =====
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ffaa00";
        ctx.fillText("CONSUMO:", 150, 150);

        ctx.font = "22px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`🍔 Hamburguesas: ${this.stats.hamburguesas}`, 150, 190);
        ctx.fillText(`🥤 Refrescos: ${this.stats.cocas}`, 150, 225);
        ctx.fillText(`🍩 Donas: ${this.stats.donas}`, 150, 260);
        ctx.fillText(`🍟 Papas: ${this.stats.papas}`, 150, 295);

        // ===== PESO =====
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#00aaff";
        ctx.fillText("PESO:", 500, 150);

        ctx.font = "22px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Inicial: ${this.stats.pesoInicial} kg`, 500, 190);
        ctx.fillText(`Ganado: +${this.stats.pesoGanado} kg`, 500, 225);
        ctx.fillText(`Final: ${this.stats.pesoActual} kg`, 500, 260);

        let estadoColor = this.stats.estado === "DIABETES" ? "#ff0000" :
            this.stats.estado === "PREDIABETES" ? "#ff6600" : "#ffff00";
        ctx.fillStyle = estadoColor;
        ctx.fillText(`Estado: ${this.stats.estado}`, 500, 295);

        // ===== CO₂ =====
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#00ff00";
        ctx.fillText("🌍 CO₂ TOTAL:", 150, 350);
        ctx.font = "32px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${this.stats.co2} kg`, 150, 390);

        // ===== ESPERANZA DE VIDA =====
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ff00ff";
        ctx.fillText("⏳ ESPERANZA:", 500, 350);

        let esperanzaColor = this.stats.esperanzaVida > 60 ? "#00ff00" :
            this.stats.esperanzaVida > 40 ? "#ffff00" : "#ff0000";
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = esperanzaColor;
        ctx.fillText(`${this.stats.esperanzaVida} años`, 500, 400);

        // ===== AÑOS PERDIDOS (NUEVO) =====
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ff6600";
        ctx.fillText("📉 AÑOS PERDIDOS:", 150, 460);
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#ff8800";
        ctx.fillText(`${this.stats.añosPerdidos} años`, 150, 510);

        // ===== GASTO =====
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ffff00";
        ctx.fillText("💰 GASTO TOTAL:", 500, 460);

        const totalGasto = (this.stats.hamburguesas * 150) +
            (this.stats.cocas * 25) +
            (this.stats.donas * 50) +
            (this.stats.papas * 50);

        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`$${totalGasto}`, 500, 510);

        // ===== BOTÓN DE REINICIO =====
        ctx.fillStyle = "#333333";
        ctx.fillRect(250, 550, 400, 70);
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 5;
        ctx.strokeRect(250, 550, 400, 70);

        ctx.font = "bold 36px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("👉 JUGAR DE NUEVO 👈", 450, 600);

        ctx.textAlign = "left";
    }
}