class Poka extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "../img/mr_poka.png";

        super(x, y, 80, ctx, image)
    }
}

class GameTrack {
    constructor(width, height, ctx) {
        let image = new Image()
        image.src = "../img/track.jpeg";
        ctx.drawImage(image, 0, 0, width, height);
    }
}

class Hamburger extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "../img/hamburger2.png";
        super(x, y,50, ctx, image)
    }
}

class Coca extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "../img/coca1.png";
        super(x, y,50, ctx, image)//50 Coca Size
    }
}
class Donuts extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "../img/donuts1.png";
        super(x, y,50, ctx, image)
    }
}
class Potatos extends Actors {
    constructor(x, y, ctx) { 
        let image = new Image()
        image.src = "../img/papitas1.png";
        super(x, y,80, ctx, image)
    }
}
class Joku extends Actors {//Mr Joku=Mr Joke
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "../img/joku.png";
        super(x, y,200, ctx, image)
    }
}
class Rat extends Actors {
    constructor(x, y, ctx) {
        let image = new Image()
        image.src = "../img/rat.png";
        super(x, y, Rat.size, ctx, image)
    }

    static size = 45;//Rat size
}
