const gravity = 1;

class Actors {
    constructor(x, y, size, ctx, img) {
        // la posicion original en Y
        this.originalY = y;

        this.x = x;
        this.y = y;
        this.size = size;
        this.vida = 2000 //check if we want to start with 100 and link with intersec
        this.velocidad= 50 //with line (17 & 21)
        this.ctx = ctx
        this.img = img;

        // from actors
        this.dy = 0;
        this.jumpForce = 15;
        this.grounded = false;
        this.jumpTimer = 0;

        this.redraw()
    }

    // returns the coordinates
    position() {
        return {
            x: this.x,
            y: this.y,
            w: this.size,
            h: this.size,
        };
    }

    // afectar con daño
    damage(dam){//metodo, porque existe dentro de una clase
        this.vida -= dam
    }

    // agregar vida
    heal(v){//metodo, porque existe dentro de una clase
        this.vida += v
    }

    moverAlFrente(){
        this.x +=this.velocidad
    }

    moverAtras(){
        this.x -=this.velocidad
    }

    /*
     * Se ejecuta con cada render el los frames
     * @param keys { jump: boolean }
     */
    animate(keys) {
        // si en este render de los frames estamos brincando:
        /* barra espaciadora o tecla w, brinca */
        if (keys.jump){
            this.jump();
        } else {
            this.jumpTimer = 0;
        }

        // modifica el cambio de posicion en cada frame
        // en el primer render (la 1ra vez que alguien llama a animate)
        // la dy es 0, valor del constructor
        this.y += this.dy;

        // cuando estes brincando
        const isJumpping = this.y < this.originalY;
        if(isJumpping) {
            this.dy += gravity;
            this.grounded = false;
        } else { // cuando no este brincando reset position
            this.dy = 0;
            this.grounded = true;
            this.y = this.originalY; // -this.size;
        }

        this.redraw();
    }


    jump(){/*se agrega de JUMP*/
        if (this.grounded && this.jumpTimer == 0) {
            this.jumpTimer = 1; /*Que significa*/
            this.dy = -this.jumpForce;
        } else if(this.jumpTimer > 0 && this.jumpTimer < 5){/* maxima altura */
            this.jumpTimer ++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);/*Que significa*/
        }
    }

    estaVivo(){
        if (this.vida > 100){//check live
            return true
        }
        return false
    }

    // dibuja sin animación
    redraw(){
        // this.ctx.fillRect(this.x,this.y, 30, 30)//add image by fillRect ("../img/MrPoka.png")
        this.ctx.drawImage(this.img, this.x, this.y, this.size, this.size)
    }
}





