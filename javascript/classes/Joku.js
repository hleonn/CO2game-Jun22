import { Actors } from './Actors.js';

export class Joku extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "./img/joku.png";
        super(x, y, 200, ctx, image)
    }
}