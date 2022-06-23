
linea 67-82
updateWorkArea

if(intersects(hamburger.position(),poka.position())){//position is correct?
    console.log('Add points',{
    poka:poka.position(),
    hamb: hamburger.position(),     //es correcto?   
    });
poka.damage(+8);//SUMAR VIDA? check
}

linea 29
const hamburger=[]

linea 77
hamburgers.forEach((hamburger) =>{
    hamburger.x=-5//check
    hamburger.redraw()
})

linea 142
function JunkyHamburger(){
    const hamburgerSky=Math.floor(Math.random()*40)
    const numeros = [1, 32, 5, 38, 29]

if (numeros.includes(hamburgerSky)){
    const hambY=CANVAS_DIMENSIONS.height-50//check 50
    hamburger.size;//check 50
    const hamburgerr=new Hamburger(50,hambY,ctx);//clase poka linea 54
    hamburgers.push(hamburgerr)
}
}
//______________________________________________________________________


function startGame(){
    
    updateWorkArea()

     when the game starts, create a timer to automatically add a new enemy every 500ms
    setInterval( () => {
        addRandomJunkFood()
    }, 1000);
}


const JunkyFood = []
function updateWorkArea(){
    JunkyFood.forEach(()=>{
        JunkyFood.y += 1
        JunkyFood.redraw ()
    })
}


function addRandomJunkFood(){
    const randomJunkyFoodType = Math.floor(Math.random()*20)
    const randomX = Math.floor(Math.random()* CANVAS_DIMENSIONS.width)
    switch (randomJunkyFoodType) {
        case valor1: 2,4,6,8,10
          let Pott= new Potatos(randomX ())
          JunkyFood.push (Pott)

          break;

        case valor2: 12,14,16,18,20
        let Cok= new Coke(randomX ())
        JunkyFood.push (Cok)

          break;
        
        case valor3: 1,3,5,7,9
        let Don= new Donu(randomX ())
        JunkyFood.push (Don)

          break;

          case valor4: 11,13,15,17,19
          let Hambu= new Hambur(randomX ())
          JunkyFood.push (Hambu)

            break;
        
      }
}



















Ref VideoenYoutube: https://www.youtube.com/watch?v=LprJOTU37hk&ab_channel=TylerPotts
//const canvas = document.getElementById('game');
//const ctx = canvas.getContext("2d");//check

/*let score;*/
/*let highscore;*/
let player;
let gravity;/*Definir*/
/*let obstacles;Definir*/
let gamespeed;
let keys = {}/*Definir*/

//Event Listener
document.addEventListener('keydown', function(evt){/*Define tecla abajo*/
    keys[evt.code] = true;
});
document.addEventListener('keyup', function(evt){/*Define tecla arriba*/
    keys[evt.code] = false;
});

class Player{     /*cambiar a Poka*/
    constructor(x, y, w, h, c){
        this.x=x;
        this.y=y;
        this.w=w;       /*debe ser this.size : w */
        this.h=h;       /*debe ser this.size : h */ 
        this.c=c;
        this.dy=0 /*llevar a Actors*/
        this.jumpForce = 15;/*llevar a Actors*/
        this.originalHeight =h;/*llevar a Actors*/
        this.grounded = false;/*llevar a Actors*/
        this.jumpTimer = 0;/*llevar a Actors*/
    }



    animate () {/*Se ejecuta con cada render el los frames*/
        //Jump
        if (keys['Space'] || keys['KeyW']){/*barra espaciadora o tecla w, brinca, sino no brinca*/
            this.Jump();
        } else {
            this.jumpTimer = 0;
        }
        if (keys['ShiftLeft'] || keys['keyS']){
            this.h = this.originalHeight / 2;/*Que significa?*/
        }else{
            this.h = this.originalHeight;
        }
        
        this.y += this.dy;/*Direccion y*/

    //Gravity 
        if(this.y + this.h < canvas.height) {// objeto menor que las dimensiones del canvas
            this.dy +=gravity;
            this.grounded = false;
        } else {
            this.dy=0;
            this.grounded = true;
            this.y = canvas.height-this.h;
        }
        this.Draw();

    }

    Jump(){/*Definir*/
        if(this.grounded && this.jumpTimer == 0){
            this.jumpTimer = 1;/*Que significa*/
            this.dy = -this.jumpForce;
        }else if(this.jumpTimer > 0 && this.jumpTimer < 15){/*Que significa*/
            this.jumpTimer ++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);/*Que significa*/
        }
    }

    Draw () {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}
function start (){
        canvas.width = windows.innerWidth;
        canvas.height = windows.innerHeight;
        ctx.font = "20px sans-serif";
        gameSpeed = 3;/*Definir*/
        gravity = 1;/*Definir*/
        score = 0;
        highscore = 0;
        player = newPlayer(25,canvas.height-150,50,50,'#FF5858');/*here*/
        requestAnimationFrame(Update);
}
function Update(){
        requestAnimationFrame(Update);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        player.animate();/*cambiar a poka*/
}
