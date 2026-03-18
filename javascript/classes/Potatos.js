import { Actors } from './Actors.js';

export class Potatos extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "./img/papitas1.png";
        super(x, y, 80, ctx, image)
    }
}