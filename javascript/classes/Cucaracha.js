import { Actors } from './Actors.js';

export class Cucaracha extends Actors {
    constructor(x, y, ctx) {
        let image = new Image();
        image.src = "./img/cuca.png";

        super(x, y, 25, ctx, image);

        this.velocidad = 1.5; // REDUCIDA de 3 a 1.5
        this.dano = 250;
        this.tipo = "cucaracha";
    }

    mover() {
        this.x -= this.velocidad;
    }

    redraw() {
        this.mover();
        super.redraw();
    }
}