import { Actors } from './Actors.js';

export class Coca extends Actors {
    constructor(x, y, ctx) {
        let image = new Image();
        image.src = "./img/hamburger2.png";
        super(x, y, 50, ctx, image);
    }
}