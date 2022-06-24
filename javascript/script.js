const canvas = document.getElementById("workArea")
const ctx = canvas.getContext("2d")

const soundtrack = new Audio('../audio/main.mp3');//MUSICA      '../audio/main.mp3'*/

let animationFrameReqID = null;
let enemiesIntervalID = null;
let junkFoodIntervalID = null;

const keys = {
    jump: false,
};

const CANVAS_DIMENSIONS = {
    width: 900,
    height: 600,
};

const _UNDERGROUND_HEIGHT = 40;
const _MAP_TRACK_HEIGHT = 40;

const MR_POKA_SIZE = 80;
const MR_POKA_OFFSET = 40;

const HAMBURGER_SIZE = 40;
const COCA_SIZE = 40;
const DONUTS_SIZE = 40;
const POTATOS_SIZE = 60;
const MR_JOKU_SIZE = 200;

const RAT_OFFSET = 60;

let rats = []
let undergroundRats = []
//NUEVO
let JunkyFood = []

const pokaY = CANVAS_DIMENSIONS.height-MR_POKA_SIZE-MR_POKA_OFFSET;
let poka = null;

let gameOver = new Image()
gameOver.src = "../img/GAMEOVER1.png";

// const jokuY = CANVAS_DIMENSIONS.height-MR_JOKU_SIZE;//*************************** */
// const joku = new Joku(500,0,ctx)
// const hamburger = new Hamburger(50,0,ctx) //Ubicacion */
// const coca = new Coca(200,0,ctx) //Ubicacion */
// const donuts = new Donuts(800,0,ctx) //Ubicacion */
// const potatos = new Potatos(300,0,ctx) //Ubicacion */

function startGame(){
    // reset
    poka = new Poka(10, pokaY, ctx) //instancia
    JunkyFood = [];
    rats = [];
    undergroundRats = [];

    document.getElementById("start").style.display = 'none';
    document.getElementById("gameover").style.display = 'none';
    canvas.classList.remove("noShow")
    updateWorkArea()

    soundtrack.play();//MUSICA*******************/

    // when the game starts, create a timer to automatically add a new enemy every 500ms
    enemiesIntervalID = setInterval( () => {
        ratsEnemies()
    }, 500);
    
    // NUEVO
    junkFoodIntervalID = setInterval( () => {
        addRandomJunkFood()
    }, 1000);
}

function intersects(r1, r2) { // -> should return a boolean
        return !(r2.x > (r1.x + r1.w) ||
                 (r2.x + r2.w) < r1.x ||
                 r2.y > (r1.y+r1.h) ||
                 (r2.y+r2.h) < r1.y);
}

//actors.moverAlFrente()
//actors.damage(100)// cuando tenga 1000 puntos recibira dano

function updateWorkArea() {
    
    console.log("running working area")
    ctx.clearRect(0, 0, 900, 600)

    //******** */

    new GameTrack(CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height, ctx)

    if (!poka.estaVivo()) {
        const restart = document.getElementById("gameover")
        restart.style.display = "block"
        canvas.classList.add("noShow")

        cancelAnimationFrame(animationFrameReqID);
        clearInterval(enemiesIntervalID);
        clearInterval(junkFoodIntervalID);
        return;
    }

    poka.animate(keys);


    //RESTAR PUNTOS AL TOCAR RATA
    rats.forEach((ratInstance, index) => {
        if (ratInstance == null) return;

        ratInstance.x -= 5
        ratInstance.redraw()

        if (intersects(ratInstance.position(), poka.position())) {
            console.log('substract points', {
                poka: poka.position(),
                rat: ratInstance.position(),
            });
            

            poka.damage(500);//RESTAR VIDA
            rats[index] = null;    
        }
    })

    undergroundRats.forEach((ratInstance) =>{
        ratInstance.redraw()
    })
                                    //CAIDA DE OBJETOS
    // make mr joku fall
    // joku.y += 3
    // joku.redraw()
    // // make hamburger fall
    // hamburger.y += 3
    // hamburger.redraw()
    // // make coca fall
    // coca.y += 3
    // coca.redraw()
    // // make donuts fall
    // donuts.y += 3
    // donuts.redraw()
    // // make potatos fall
    // potatos.y += 3
    // potatos.redraw()

    //const hamburgerY = CANVAS_DIMENSIONS.height-HAMBURGER_SIZE;+++++++++++++++++++++++++++++++++
    //new Hamburger(10,0,ctx)

    //const cocaY = CANVAS_DIMENSIONS.height-COCA_SIZE;
    //new Coca(50,0,ctx)

    //const donutsY = CANVAS_DIMENSIONS.height-DONUTS_SIZE;
    //new Donuts(100,0,ctx)

    //const potatosY = CANVAS_DIMENSIONS.height-POTATOS_SIZE;
    //new Potatos(150,0,ctx)

    /****const ratY =CANVAS_DIMENSIONS.height-RAT_SIZE-RAT_OFFSET;;
    new Rat(850,525,ctx)  se movio a la linea 83 y 84*/
    
    //NEW
    JunkyFood.forEach((elem, index)=> {
        if (elem == null) return;

        elem.y += 1
        //elem.x += 1
        elem.redraw ()


        if (intersects(elem.position(), poka.position())) {
            console.log('add points', {
                poka: poka.position(),
                junkyFood: elem.position(),
            });

            poka.heal(100);//SUMAR VIDA

            JunkyFood[index] = null;
        }
    })


//     //SUMAR PUNTOS AL TOCAR COMIDA
//     JunkyFood.forEach((puki) =>{
//         puki.y = 5                 //.x -= 5
//         puki.redraw()

//     if (intersects(JunkyFood.position(), poka.position())) {
//         console.log('add points', {
//             poka: poka.position(),
//             junkyFood: JunkyFood.position(),
//         });
        

//         poka.damage(8);//SUMAR VIDA
//     }
// })


    mostrarDatos(poka.vida, poka.x, poka.y)
    animationFrameReqID = requestAnimationFrame(updateWorkArea)
}

function mostrarDatos(vida,x,y){
    ctx.font="30px Arial"
    ctx.fillText(vida,50,40)
    ctx.fillStyle = "grey";
    ctx.font="10 px Arial"
    ctx.fillText(`X:${x}, Y${y}`,750,40)
    ctx.fillStyle = "yellow";
}
//ALEATORIEDAD DE LAS RATAS
function ratsEnemies (){//********* */
    const ratasEnElPiso = Math.floor(Math.random()*40)
    const ratasEnSubsuelo = Math.floor(Math.random()*40)
    const numeros = [1,32,5,38,29] //****** */

    if (numeros.includes(ratasEnElPiso)) {
        console.log("Add enemy")
        // const randomOffset = Math.floor(Math.random()*MAP_TRACK.height)
        const ratY = CANVAS_DIMENSIONS.height-_UNDERGROUND_HEIGHT-Rat.size; // randomOffset;
        const rat = new Rat(850, ratY, ctx); // instance
        rats.push(rat)
    }

    // add rats to underground
    if (numeros.includes(ratasEnSubsuelo)) {
        const ratY = CANVAS_DIMENSIONS.height-Rat.size+20; // randomOffset;
        const rat = new Rat(CANVAS_DIMENSIONS.width, ratY, ctx); // instance
        undergroundRats.push(rat)
    }
}

                                                //NUEVO ALEATORIEDAD DE LA COMIDA
function addRandomJunkFood(){
    const randomJunkyFoodType = Math.floor(Math.random()*40)
    const randomX = Math.floor(Math.random()* CANVAS_DIMENSIONS.width)
    if (randomJunkyFoodType > 0 && randomJunkyFoodType < 10) {
        let pott= new Potatos(randomX, 0, ctx)
        JunkyFood.push (pott)
    }

    if (randomJunkyFoodType >= 10 && randomJunkyFoodType < 20) {
        let cok= new Coca(randomX, 0, ctx)
        JunkyFood.push (cok)
    }
    
    if (randomJunkyFoodType >= 20 && randomJunkyFoodType < 30) {
        let don= new Donuts(randomX, 0, ctx)
        JunkyFood.push (don)
    }

    if (randomJunkyFoodType >= 30 && randomJunkyFoodType < 40) {
            let hambu= new Hamburger(randomX, 0, ctx)
            JunkyFood.push (hambu)
      }
}

//LEFT & RIGHT MOVE
document.addEventListener("keydown", (event) => {
    if (event.key == "ArrowLeft") {
        
        poka.moverAtras()
    }

    if (event.key ==  "ArrowRight") {
        console.log("Mover a la Derecha")
        poka.moverAlFrente()
    }

    if (event.key == " ") {
        keys.jump = true;
    }
})

document.addEventListener('keyup', (evt) => {
    if (evt.key == " ") {
        keys.jump = false;
    }
});

// document.body.onkeyup = function(e){
//     if(e.keyCode == 32){
//         alert("space bar")
//     }
// }

