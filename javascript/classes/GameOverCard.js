export class GameOverCard {
    constructor(poka) {
        this.poka  = poka;
        this.stats = poka.getEstadisticas();
    }

    // ── Silueta humana dibujada con canvas paths ──
    _dibujarSilueta(ctx, cx, cy, grosor, color) {
        const g = grosor; // 1.0 = normal, >1 = más ancho

        ctx.save();
        ctx.fillStyle   = color;
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1;

        // Cabeza
        ctx.beginPath();
        ctx.ellipse(cx, cy - 52, 12, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cuello
        ctx.fillRect(cx - 4, cy - 40, 8, 10);

        // Torso (más ancho según grosor)
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15, 18 * g, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cadera (más ancha según grosor)
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12, 16 * g, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brazos
        ctx.beginPath();
        ctx.ellipse(cx - 22 * g, cy - 12, 6, 18, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 22 * g, cy - 12, 6, 18, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Piernas
        ctx.beginPath();
        ctx.ellipse(cx - 9, cy + 38, 7 * g, 22, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 9, cy + 38, 7 * g, 22, -0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ── Cuadro con borde estilo clínico ──
    _cuadro(ctx, x, y, w, h, titulo, colorBorde) {
        ctx.save();
        // Fondo
        ctx.fillStyle = "rgba(240,245,250,0.08)";
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();
        // Borde
        ctx.strokeStyle = colorBorde;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.stroke();
        // Etiqueta superior
        ctx.fillStyle = colorBorde;
        ctx.font      = "bold 11px Arial";
        ctx.textAlign = "left";
        ctx.fillText(titulo.toUpperCase(), x + 10, y + 14);
        // Línea bajo etiqueta
        ctx.strokeStyle = colorBorde;
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 19);
        ctx.lineTo(x + w - 1, y + 19);
        ctx.stroke();
        ctx.restore();
    }

    // ── Fila de dato ──
    _fila(ctx, x, y, label, valor, colorValor = "#e8f0fe") {
        ctx.save();
        ctx.font      = "12px Arial";
        ctx.fillStyle = "#9aa8b8";
        ctx.textAlign = "left";
        ctx.fillText(label, x, y);
        ctx.font      = "bold 13px Arial";
        ctx.fillStyle = colorValor;
        ctx.textAlign = "right";
        ctx.fillText(valor, x + 160, y);
        ctx.restore();
    }

    // ── Mensaje diagnóstico según estado ──
    _diagnostico() {
        switch (this.stats.estado) {
            case "DIABETES":    return { texto: "DIABETES TIPO 2 CONFIRMADA", color: "#ff4444", icono: "⚠️" };
            case "PREDIABETES": return { texto: "PREDIABETES DETECTADA",       color: "#ff8800", icono: "⚠️" };
            case "SEVERO":      return { texto: "OBESIDAD SEVERA",              color: "#ffaa00", icono: "📋" };
            case "OBESO":       return { texto: "OBESIDAD GRADO I",             color: "#ffcc00", icono: "📋" };
            case "SOBREPESO":   return { texto: "SOBREPESO MODERADO",           color: "#ffe066", icono: "📋" };
            default:            return { texto: "PESO NORMAL",                  color: "#44ff88", icono: "✅" };
        }
    }

    draw(ctx, canvas) {
        const W = canvas.width;   // 900
        const H = canvas.height;  // 600

        // ── Fondo clínico oscuro ──
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(0, 0, W, H);

        // Líneas de fondo estilo hoja cuadriculada médica
        ctx.strokeStyle = "rgba(100,140,180,0.08)";
        ctx.lineWidth   = 0.5;
        for (let x = 0; x < W; x += 30) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 30) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // ── Encabezado tipo expediente ──
        ctx.fillStyle = "#1a2332";
        ctx.fillRect(0, 0, W, 52);
        ctx.strokeStyle = "#2d6a9f";
        ctx.lineWidth   = 1;
        ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(W, 52); ctx.stroke();

        // Cruz médica
        ctx.fillStyle = "#2d6a9f";
        ctx.fillRect(14, 12, 6, 28); ctx.fillRect(8, 18, 18, 16);

        ctx.font      = "bold 16px Arial";
        ctx.fillStyle = "#e8f0fe";
        ctx.textAlign = "left";
        ctx.fillText("EXPEDIENTE CLÍNICO — REPORTE FINAL", 40, 26);
        ctx.font      = "11px Arial";
        ctx.fillStyle = "#6a8aaa";
        ctx.fillText(`DIAGNÓSTICO: ${this.stats.estado}   |   PACIENTE: MR. POKA   |   FECHA: ${new Date().toLocaleDateString()}`, 40, 44);

        // ID expediente
        ctx.font      = "bold 12px Arial";
        ctx.fillStyle = "#2d6a9f";
        ctx.textAlign = "right";
        ctx.fillText(`EXP #CO2-${String(Math.floor(Math.random()*9000)+1000)}`, W - 14, 32);

        // ── Diagnóstico banner ──
        const dx = this._diagnostico();
        ctx.fillStyle = dx.color + "22";
        ctx.fillRect(0, 52, W, 30);
        ctx.strokeStyle = dx.color;
        ctx.lineWidth   = 2;
        ctx.beginPath(); ctx.moveTo(0, 82); ctx.lineTo(W, 82); ctx.stroke();
        ctx.font      = "bold 14px Arial";
        ctx.fillStyle = dx.color;
        ctx.textAlign = "center";
        ctx.fillText(`${dx.icono}  ${dx.texto}  ${dx.icono}`, W / 2, 71);

        // ============================================================
        // COLUMNA IZQUIERDA — Siluetas comparativas
        // ============================================================
        this._cuadro(ctx, 14, 90, 240, 390, "Comparación Morfológica", "#2d6a9f");

        // Etiquetas
        ctx.font      = "11px Arial";
        ctx.fillStyle = "#6a8aaa";
        ctx.textAlign = "center";
        ctx.fillText("INICIAL", 80, 120);
        ctx.fillText("ACTUAL", 190, 120);

        // Línea divisoria entre siluetas
        ctx.strokeStyle = "rgba(45,106,159,0.3)";
        ctx.lineWidth   = 0.8;
        ctx.beginPath(); ctx.moveTo(134, 110); ctx.lineTo(134, 460); ctx.stroke();

        // Peso ganado como factor de grosor (max 1.8x con 25kg)
        const pesoNum  = parseFloat(this.stats.pesoGanado) || 0;
        const grosorFinal = 1 + Math.min(pesoNum / 25, 1) * 0.85;

        // Silueta inicial (normal)
        this._dibujarSilueta(ctx, 80, 290, 1.0, "#4a9eff");

        // Silueta final (engordada)
        this._dibujarSilueta(ctx, 190, 290, grosorFinal, dx.color);

        // Peso bajo cada silueta
        ctx.font      = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#4a9eff";
        ctx.fillText(`${this.stats.pesoInicial} kg`, 80, 430);
        ctx.fillStyle = dx.color;
        ctx.fillText(`${this.stats.pesoActual} kg`, 190, 430);

        // Flecha entre siluetas
        ctx.fillStyle   = "#ff8800";
        ctx.font        = "20px Arial";
        ctx.fillText("→", 134, 295);

        // Diferencia de peso
        ctx.font      = "bold 11px Arial";
        ctx.fillStyle = "#ff8800";
        ctx.fillText(`+${this.stats.pesoGanado} kg`, 134, 316);

        // IMC estimado
        const altura  = 1.70;
        const imcFinal = ((parseFloat(this.stats.pesoActual)) / (altura * altura)).toFixed(1);
        const imcColor = imcFinal > 30 ? "#ff4444" : imcFinal > 25 ? "#ffaa00" : "#44ff88";
        ctx.font      = "11px Arial";
        ctx.fillStyle = "#6a8aaa";
        ctx.fillText("IMC ESTIMADO", 134, 455);
        ctx.font      = "bold 16px Arial";
        ctx.fillStyle = imcColor;
        ctx.fillText(imcFinal, 134, 472);

        // ============================================================
        // COLUMNA CENTRAL — Datos clínicos
        // ============================================================
        this._cuadro(ctx, 264, 90, 200, 185, "Signos Vitales", "#2d9f6a");

        const baseY = 112;
        ctx.textAlign = "left";
        this._fila(ctx, 274, baseY + 20, "Peso inicial",      `${this.stats.pesoInicial} kg`);
        this._fila(ctx, 274, baseY + 40, "Peso actual",       `${this.stats.pesoActual} kg`,  dx.color);
        this._fila(ctx, 274, baseY + 60, "Peso ganado",       `+${this.stats.pesoGanado} kg`, "#ff8800");
        this._fila(ctx, 274, baseY + 80, "Esperanza de vida", `${this.stats.esperanzaVida} años`,
            this.stats.esperanzaVida > 60 ? "#44ff88" : this.stats.esperanzaVida > 40 ? "#ffcc00" : "#ff4444");
        this._fila(ctx, 274, baseY + 100, "Años perdidos",    `${this.stats.añosPerdidos} años`, "#ff6600");
        this._fila(ctx, 274, baseY + 120, "CO₂ generado",     `${this.stats.co2} kg`, "#44dd88");
        this._fila(ctx, 274, baseY + 140, "Gasto total",
            `$${(this.stats.hamburguesas*150)+(this.stats.cocas*25)+(this.stats.donas*50)+(this.stats.papas*50)}`);

        // Cuadro consumo
        this._cuadro(ctx, 264, 285, 200, 195, "Registro de Consumo", "#9f6a2d");

        this._fila(ctx, 274, 307, "🍔 Hamburguesas",  `${this.stats.hamburguesas} uds`, "#ffaa44");
        this._fila(ctx, 274, 327, "🥤 Refrescos",     `${this.stats.cocas} uds`,       "#ff6666");
        this._fila(ctx, 274, 347, "🍩 Donas",         `${this.stats.donas} uds`,       "#ffaacc");
        this._fila(ctx, 274, 367, "🍟 Papas",         `${this.stats.papas} uds`,       "#ffdd44");

        const totalItems = this.stats.hamburguesas + this.stats.cocas +
            this.stats.donas + this.stats.papas;
        ctx.fillStyle = "rgba(159,106,45,0.15)";
        ctx.fillRect(264, 385, 200, 28);
        this._fila(ctx, 274, 402, "TOTAL INGERIDO", `${totalItems} items`, "#ffcc44");

        // Kcal totales
        ctx.font      = "11px Arial";
        ctx.fillStyle = "#6a8aaa";
        ctx.textAlign = "center";
        ctx.fillText(`${this.stats.totalKcal?.toLocaleString?.() ?? "—"} kcal totales`, 364, 465);

        // ============================================================
        // COLUMNA DERECHA — Indicadores visuales
        // ============================================================
        this._cuadro(ctx, 474, 90, 410, 390, "Indicadores de Salud", "#6a2d9f");

        // Esperanza de vida — barra
        const espPct = Math.min(100, (this.stats.esperanzaVida / 80) * 100);
        const espColor = espPct > 70 ? "#44ff88" : espPct > 45 ? "#ffcc00" : "#ff4444";
        ctx.font      = "11px Arial";
        ctx.fillStyle = "#9aa8b8";
        ctx.textAlign = "left";
        ctx.fillText("Esperanza de vida", 484, 122);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(484, 127, 390, 14);
        ctx.fillStyle = espColor;
        ctx.fillRect(484, 127, 390 * (espPct / 100), 14);
        ctx.font      = "bold 11px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "right";
        ctx.fillText(`${this.stats.esperanzaVida} años`, 874, 139);

        // CO2 — barra
        const co2Num = parseFloat(this.stats.co2) || 0;
        const co2Pct = Math.min(100, (co2Num / 50) * 100);
        ctx.font      = "11px Arial";
        ctx.fillStyle = "#9aa8b8";
        ctx.textAlign = "left";
        ctx.fillText("Huella de carbono CO₂", 484, 158);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(484, 163, 390, 14);
        ctx.fillStyle = co2Pct > 70 ? "#ff4444" : co2Pct > 40 ? "#ffaa00" : "#44dd88";
        ctx.fillRect(484, 163, 390 * (co2Pct / 100), 14);
        ctx.font      = "bold 11px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "right";
        ctx.fillText(`${this.stats.co2} kg`, 874, 175);

        // Peso ganado — barra
        const pesoPct = Math.min(100, (pesoNum / 25) * 100);
        ctx.font      = "11px Arial";
        ctx.fillStyle = "#9aa8b8";
        ctx.textAlign = "left";
        ctx.fillText("Peso ganado (máx. 25 kg)", 484, 194);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(484, 199, 390, 14);
        ctx.fillStyle = pesoPct > 70 ? "#ff4444" : pesoPct > 40 ? "#ffaa00" : "#ffdd44";
        ctx.fillRect(484, 199, 390 * (pesoPct / 100), 14);
        ctx.font      = "bold 11px Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "right";
        ctx.fillText(`+${this.stats.pesoGanado} kg`, 874, 211);

        // ── Gráfica de barras: consumo por tipo ──
        ctx.font      = "11px Arial";
        ctx.fillStyle = "#6a8aaa";
        ctx.textAlign = "left";
        ctx.fillText("Distribución de consumo", 484, 238);

        const alimentos = [
            { label: "🍔", val: this.stats.hamburguesas, color: "#ff8844" },
            { label: "🥤", val: this.stats.cocas,        color: "#4488ff" },
            { label: "🍩", val: this.stats.donas,        color: "#ff66aa" },
            { label: "🍟", val: this.stats.papas,        color: "#ffdd44" },
        ];
        const maxVal = Math.max(...alimentos.map(a => a.val), 1);
        const barW   = 70;
        const barMaxH = 90;
        alimentos.forEach((a, i) => {
            const bx  = 494 + i * 90;
            const bh  = Math.max(4, (a.val / maxVal) * barMaxH);
            const by  = 340 - bh;

            ctx.fillStyle = a.color + "44";
            ctx.fillRect(bx, 250, barW, 90);

            ctx.fillStyle = a.color;
            ctx.fillRect(bx, by, barW, bh);

            ctx.font      = "18px Arial";
            ctx.textAlign = "center";
            ctx.fillText(a.label, bx + barW / 2, 358);

            ctx.font      = "bold 13px Arial";
            ctx.fillStyle = "#fff";
            ctx.fillText(a.val, bx + barW / 2, by - 4);
        });

        // ── Sello diagnóstico ──
        ctx.save();
        ctx.translate(820, 430);
        ctx.rotate(-0.25);
        ctx.strokeStyle = dx.color + "99";
        ctx.lineWidth   = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font      = "bold 9px Arial";
        ctx.fillStyle = dx.color + "cc";
        ctx.textAlign = "center";
        ctx.fillText("DIAGNÓSTICO", 0, -12);
        ctx.font      = "bold 11px Arial";
        ctx.fillStyle = dx.color;
        ctx.fillText(this.stats.estado, 0, 4);
        ctx.font      = "9px Arial";
        ctx.fillStyle = dx.color + "99";
        ctx.fillText("CONFIRMADO", 0, 17);
        ctx.restore();

        // ============================================================
        // BOTÓN REINICIAR
        // ============================================================
        ctx.fillStyle = "rgba(45,106,159,0.3)";
        ctx.beginPath();
        ctx.roundRect(250, 495, 400, 50, 6);
        ctx.fill();
        ctx.strokeStyle = "#2d6a9f";
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.roundRect(250, 495, 400, 50, 6);
        ctx.stroke();

        ctx.font      = "bold 18px Arial";
        ctx.fillStyle = "#e8f0fe";
        ctx.textAlign = "center";
        ctx.fillText("▶  NUEVA CONSULTA  —  JUGAR DE NUEVO", 450, 526);

        // Pie de página
        ctx.font      = "10px Arial";
        ctx.fillStyle = "#2d4a6a";
        ctx.fillText("CO₂ GAME  •  REPORTE GENERADO AUTOMÁTICAMENTE  •  DATOS SIMULADOS CON FINES EDUCATIVOS", 450, 585);

        ctx.textAlign = "left";
    }
}