export class GameTrack {
    constructor(width, height, ctx) {
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.image = new Image();
        this.image.src = "./img/track.jpeg";
        this.loaded = false;

        this.image.onload = () => {
            console.log("✅ Fondo cargado correctamente");
            this.loaded = true;
            this.draw(); // Dibuja inmediatamente cuando carga
        };

        this.image.onerror = (err) => {
            console.log("❌ Error cargando track.jpeg:", err);
            console.log("📁 Ruta intentada:", this.image.src);
            this.loaded = false;
        };
    }

    draw() {
        if (this.loaded && this.image.complete) {
            // Dibujar la imagen si cargó
            this.ctx.drawImage(this.image, 0, 0, this.width, this.height);
        } else {
            // Fondo de emergencia (estilo pista)

            // Cielo
            this.ctx.fillStyle = "#87CEEB"; // cielo azul
            this.ctx.fillRect(0, 0, this.width, this.height - 60);

            // Suelo (pista)
            this.ctx.fillStyle = "#555555"; // gris asfalto
            this.ctx.fillRect(0, this.height - 60, this.width, 60);

            // Líneas de la pista
            this.ctx.strokeStyle = "#FFFFFF";
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([20, 30]);

            // Línea central
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height - 30);
            this.ctx.lineTo(this.width, this.height - 30);
            this.ctx.stroke();

            // Línea superior de la pista
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height - 60);
            this.ctx.lineTo(this.width, this.height - 60);
            this.ctx.stroke();

            // Resetear dash
            this.ctx.setLineDash([]);

            // Pequeñas líneas blancas en los bordes
            this.ctx.fillStyle = "#FFFFFF";
            for (let i = 0; i < this.width; i += 50) {
                this.ctx.fillRect(i, this.height - 65, 20, 3);
            }

            // Texto informativo
            this.ctx.font = "16px Arial";
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText("Cargando fondo...", 20, 50);
        }
    }
}