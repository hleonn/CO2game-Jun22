// Calcula cuánto puede crecer el canvas (900x600) sin salirse del viewport
function calcularScale() {
    const CANVAS_W = 900;
    const CANVAS_H = 600;
    const MARGEN   = 0.92;

    const scaleX = (window.innerWidth  * MARGEN) / CANVAS_W;
    const scaleY = (window.innerHeight * MARGEN) / CANVAS_H;
    const scale  = Math.min(scaleX, scaleY);

    // Aplicar directamente al canvas — sin variables CSS
    const canvas = document.getElementById('workArea');
    if (canvas) {
        canvas.style.transform = `scale(${scale})`;
    }

    console.log(`📐 Scale: ${scale.toFixed(2)}x → ${Math.round(CANVAS_W * scale)}x${Math.round(CANVAS_H * scale)}px`);
}

calcularScale();
window.addEventListener('resize', calcularScale);