import { Actors } from './Actors.js';

export class Rat extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "./img/rat.png";
        super(x, y, Rat.size, ctx, image)
    }

    static size = 45;
}