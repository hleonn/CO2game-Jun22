// instrucciones: dadas las coordenadas de a y b, que consisten en:
// - w: width,
// - h: height
// - x
// - y
// regresa un booleano si se intersectan o tocan las cajas

function intersects(r1, r2) { // -> should return a boolean
    // return !(r2.left > r1.right || 
    //             r2.right < r1.left || 
    //             r2.top > r1.bottom ||
    //             r2.bottom < r1.top);

        return !(r2.x > (r1.x + r1.w) || 
                 (r2.x + r2.w) < r1.x || 
                 r2.y > (r1.y+r1.h) ||
                 (r2.y+r2.h) < r1.y);
}

// no intersect, returns false
// const result = intersects(
//     {x: 0, y: 0, w: 100, h: 100},
//     {x: 200, y: 200, w: 100, h: 100}
// );

// // touching edges, expects true
// const result = intersects(
//     {x: 0, y: 0, w: 100, h: 100},
//     {x: 50, y: 100, w: 100, h: 100}
// );

// intersection, expects true
// const result = intersects(
//     {x: 300, y: 300, w: 100, h: 100},
//     {x: 350, y: 350, w: 100, h: 100}
// );



