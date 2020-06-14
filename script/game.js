const FPS = 30; // Frames Per Second
const FRICTION = 0.7;
const ASTEROIDS_JAG = 0.4;
const ASTEROIDS_NUM = 10; //starting number of asteroids
const ASTEROIDS_SIZE = 100; // starting size of asteroid
const ASTEROIDS_SPD = 50; // max starting speed of asteroid
const ASTEROIDS_VERT = 10; // average number of vertices on each asteroid
const SHIP_SIZE = 30; // ship size
const SHIP_THRUST = 4; // acceleration of the ship per second
const TURN_SPEED = 360; // turn speed per second(degrees)



let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let background = new Image();
background.src = './images/background.jpg';
let shipBody = new Image();
shipBody.src = './images/ship3.png';

let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI,
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
};

// asteroids

let asteroids = [];
let newAsteroid = (x, y) => {
    let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * ASTEROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTEROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: ASTEROIDS_SIZE / 2,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ASTEROIDS_VERT + 1) + ASTEROIDS_VERT / 2),
        offs: []
    };

    // create the vertex offets array
    for(let i = 0; i < asteroid.vert; i++) {
        asteroid.offs.push(Math.random() * ASTEROIDS_JAG * 2 + 1 -ASTEROIDS_JAG);
    }

    return asteroid
};

let distBetweenPoints = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 -y1, 2));
};

let createAsteroidsBelt = () => {
    asteroids = [];
    let x, y;
    for (let i = 0; i < ASTEROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROIDS_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y))
    }
};
createAsteroidsBelt();

setInterval(update, 1000 / FPS);



let keyDown = (ev) => {
    switch (ev.keyCode) {
        case 37:
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38:
            ship.thrusting = true;
            break;
        case 39:
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
};
let keyUp = (ev) => {
    switch (ev.keyCode) {
        case 37:
            ship.rot = 0;
            break;
        case 38:
            ship.thrusting = false;
            break;
        case 39:
            ship.rot = 0;
            break;
    }
};


document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function update() {
    ctx.fillStyle = ctx.createPattern(background, 'repeat-y');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        // draw the fire
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = SHIP_SIZE / 10;
        ctx.beginPath();
        ctx.moveTo( // rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        ctx.lineTo( // rear behind the ship
            ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
            ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
        );
        ctx.lineTo(
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= SHIP_THRUST * ship.thrust.y / FPS;
    }


    ctx.strokeStyle = 'white';
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    // draw the asteroids
    ctx.strokeStyle = 'slategray';
    ctx.lineWidth = SHIP_SIZE / 20;
    let x, y, r, a, vert, offs;
    for (let i = 0; i < asteroids.length; i++) {

        //get the asteroids property
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;
        offs = asteroids[i].offs;
        // draw a path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );

        //draw the polygon
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        //move the asteroid

        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;

        //handle edge of screen
        if(asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canvas.width + asteroids[i].r;
        } else if(asteroids[i].x > canvas.width + asteroids[i].r){
            asteroids[i].x = 0 - asteroids[i].r
        }

        if(asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canvas.height + asteroids[i].r;
        } else if(asteroids[i].y > canvas.height + asteroids[i].r){
            asteroids[i].y = 0 - asteroids[i].r
        }
    }

    //rotate ship
    ship.a += ship.rot;

    //move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    //handle edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r
    }

    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r
    }

    // ship body
    //ctx.drawImage(shipBody, ship.x -1, ship.y -1, 37, 55);
    ctx.fillStyle = 'red';
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
}