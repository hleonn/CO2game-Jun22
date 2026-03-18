import { Actors } from './Actors.js';

export class Donuts extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "./img/donuts1.png";
        super(x, y, 50, ctx, image)
    }
}