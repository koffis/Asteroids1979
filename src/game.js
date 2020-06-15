// all const that we need for game
const FPS = 30; // Frames Per Second
const SPD_DECREASE = 0.7; // how fast space-ship will slow down
const ASTEROIDS_BUMPS = 0.5; // how much bumps will on asteroid
const ASTEROIDS_NUM = 1; //starting number of asteroids
const ASTEROIDS_SIZE = 100; // starting size of asteroid
const ASTEROIDS_SPD = 50; // max starting speed of asteroid
const ASTEROIDS_VERT = 100; // average number of vertices on each asteroid
const SHIP_SIZE = 30; // ship size
const SHIP_THRUST = 4; // acceleration of the ship per second
const TURN_SPEED = 360; // turn speed per second(degrees)
const SHOW_BOUNDING = false; // show or hide collision detection
const SHIP_EXPLODE_DUR = 0.3; //duration of the ship explosion
const SHIP_INV_DUR = 3; //duration of the ship invisibility
const SHIP_BLINK_DUR = 0.1; //duration of the ships blink during invisibility
const LASER_MAX = 10; // max number of lasers on screen at once
const LASER_SPD = 500; // max number of lasers on screen at once
const LASER_DIST = 0.75; // max distance laser can fly
const LASER_EXPLODE_DUR = 0.1; // duration lasers explosion in sec
const TEXT_FADE_TIME = 2.5; // text fade time in seconds
const TEXT_SIZE = 40; // text font height in pixels
const GAME_LIVES = 3; // starting number of lives
const POINTS_LGE = 5; // starting number of lives
const POINTS_MED = 10; // starting number of lives
const POINTS_SML = 20; // starting number of lives
const SAVE_KEY_SCORE = 'best score'; //save key for local storage

// create workspace
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// game variables for configure
let level, lives, asteroids, score, scoreHigh, ship, text, textScore, textAlpha, textBest;

// set interval to reload frames
setInterval(update, 1000 / FPS);

// set background
let background = new Image();
background.src = './images/background.jpg';
/*let shipBody = new Image();
shipBody.src = './images/ship3.png';*/

// ship template
let newShip = () => {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI,
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        canShoot: true,
        dead: false,
        lasers: [],
        explodeTime: 0,
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
};

// lasers template
let shootLasers = () => {
    //create the laser object
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }
    //prevent further shooting
    ship.canShoot = false
};

// asteroids template
let newAsteroid = (x, y, r) => {
    let lvlMult = 1 + 0.1 * level;
    let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * ASTEROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTEROIDS_SPD * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ASTEROIDS_VERT + 1) + ASTEROIDS_VERT / 2),
        offs: []
    };
    // create the vertex offets array
    for (let i = 0; i < asteroid.vert; i++) {
        asteroid.offs.push(Math.random() * ASTEROIDS_BUMPS * 2 + 1 - ASTEROIDS_BUMPS);
    }
    return asteroid
};

// calculating distance between 2 points
let distBetweenPoints = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// creating a lot of asteroids which you need to destroy
let createAsteroidsBelt = () => {
    asteroids = [];
    let x, y;
    for (let i = 0; i < ASTEROIDS_NUM + level; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROIDS_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 2)));
    }
};
createAsteroidsBelt();

// creating a ship on game space
let drawShip = (x, y, a, colour = 'white') => {
    ctx.strokeStyle = colour;
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
    );
    ctx.lineTo(
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo(
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
};

// destroying ship
let explodeShip = () => {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
};

// if you lose
let gameOver = () => {
    ship.dead = true;
    text = 'Game Over';
    textScore = 'Your score: ' + score;
    textBest = 'Best score: ' + scoreHigh;
    textAlpha = 2.0;
};

// new level if you successful passed previous one
let newLevel = () => {
    text = 'Level ' + (level + 1);
    textAlpha = 1.0;
    createAsteroidsBelt();
};

// starting a new session
let newGame = () => {
    level = 0;
    lives = GAME_LIVES;
    score = 0;
    ship = newShip();
    // get the high score
    let scoreStr =  localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr == null) {
        scoreHigh = 0;
    } else {
        scoreHigh = parseInt(scoreStr)
    }
    newLevel();
};
newGame();

// destroy asteroids in game
let destroyAsteroid = (index) => {
    let x = asteroids[index].x;
    let y = asteroids[index].y;
    let r = asteroids[index].r;

    // split the asteroid in two
    if (r === Math.ceil(ASTEROIDS_SIZE / 2)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4)));
        score += POINTS_LGE;
    } else if (r === Math.ceil(ASTEROIDS_SIZE / 4)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8)));
        score += POINTS_MED;
    } else {
        score += POINTS_SML;
    }

    // check high score
    if(score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }

    //destroy the asteroid
    asteroids.splice(index, 1);

    // new level when no more asteroids
    if (asteroids.length === 0) {
        level++;
        newLevel()
    }
};

// off scroll page on 'space bar'
document.onkeydown = function (e) {
    let keyCode = e.keyCode || e.charCode;
    if (keyCode === 32) e.preventDefault();
};

// function to move space-ship
let keyDown = (ev) => {
    if (ship.dead) { // condition to stop using this function
        return;
    }
    switch (ev.keyCode) {
        case 32: // space bar (shoot laser)
            shootLasers();
            break;
        case 65: // 'a' button to turn left
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 87: // 'w' button to move
            ship.thrusting = true;
            break;
        case 68: //'d' button to turn right
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
};

// function to stop moving
let keyUp = (ev) => {
    if (ship.dead) { // condition to stop using this function
        return;
    }
    switch (ev.keyCode) {
        case 32: // stop shooting with laser
            ship.canShoot = true;
            break;
        case 65: // stop turning left
            ship.rot = 0;
            break;
        case 87: // stop moving
            ship.thrusting = false;
            break;
        case 68: // stop turning right
            ship.rot = 0;
            break;
    }
};

// event listeners for possibility to use buttons
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// function for updating frames (animation)
function update() {
    // immunity after loosing life
    let blinkOn = ship.blinkNum % 2 === 0;
    let exploding = ship.explodeTime > 0;

    // set background
    ctx.fillStyle = ctx.createPattern(background, 'repeat');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // increased speed of the ship
    if (ship.thrusting && !ship.dead) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        // draw the fire
        if (!exploding && blinkOn) {
            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = SHIP_SIZE / 10;
            ctx.beginPath();
            ctx.moveTo( // rear left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.4 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.4 * Math.cos(ship.a))
            );
            ctx.lineTo( // rear behind the ship
                ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
            );
            ctx.lineTo(
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.4 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.4 * Math.cos(ship.a))
            );
            ctx.lineTo(
                ship.x - ship.r * (3 / 2 * Math.cos(ship.a) - 0.7 * Math.sin(ship.a)),
                ship.y + ship.r * (3 / 2 * Math.sin(ship.a) + 0.7 * Math.cos(ship.a))
            );
            ctx.lineTo(
                ship.x - ship.r * (3 / 2 * Math.cos(ship.a) + 0.7 * Math.sin(ship.a)),
                ship.y + ship.r * (3 / 2 * Math.sin(ship.a) - 0.7 * Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else { // slow down the ship
        ship.thrust.x -= SPD_DECREASE * ship.thrust.x / FPS;
        ship.thrust.y -= SHIP_THRUST * ship.thrust.y / FPS;
    }

    // draw a ship
    if (!exploding) {
        if (blinkOn && !ship.dead) {
            drawShip(ship.x, ship.y, ship.a);
        }

        // handle blinking
        if (ship.blinkNum > 0) {
            // reduce the blink time
            ship.blinkTime--;
            // reduce the blink num
            if (ship.blinkTime === 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }
    } else {
        ctx.fillStyle = 'darkred';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, Math.PI * 2, 0);
        ctx.fill();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, Math.PI * 2, 0);
        ctx.fill();
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, Math.PI * 2, 0);
        ctx.fill();
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, Math.PI * 2, 0);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, Math.PI * 2, 0);
        ctx.fill();
    }

    // draw the lasers
    for (let i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime === 0) {
            ctx.fillStyle = 'salmon';
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // draw the explosion
            ctx.fillStyle = 'orangered';
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = 'salmon';
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = 'pink';
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    // draw the game text
    if (textAlpha >= 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
        ctx.fillText(text, canvas.width / 2, canvas.height * 0.75);
        if(lives === 0){
            ctx.fillText(textScore, canvas.width / 2, canvas.height * 0.82);
            ctx.fillText(textBest, canvas.width / 2, canvas.height * 0.89);
        }
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    } else if(ship.dead) {
        newGame();
    }

    // draw the lives
    let lifeColour;
    for (let i = 0; i < lives; i++) {
        lifeColour = exploding && i === lives - 1 ? "red" : "white";
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE * 18, 0.5 * Math.PI, lifeColour);
    }

    // draw the score
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = "white";
    ctx.font = TEXT_SIZE + "px dejavu sans mono";
    ctx.fillText(score, canvas.width / 2, SHIP_SIZE);

    //detect laser hits on asteroids
    let ax, ay, ar, lx, ly;
    for (let i = asteroids.length - 1; i >= 0; i--) {
        // grab the asteroid properties
        ax = asteroids[i].x;
        ay = asteroids[i].y;
        ar = asteroids[i].r;

        // loop over the lasers
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
            // grab the laser properties
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            // detect hits
            if (ship.lasers[j].explodeTime === 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                // remove the asteroid and activate the laser explosion
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                break;
            }
        }

    }

    // draw the asteroids
    ctx.strokeStyle = 'green';
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
        if (SHOW_BOUNDING) {
            ctx.strokeStyle = 'line';
            ctx.beginPath();
            ctx.arc(x, y, r, Math.PI * 2, 0);
            ctx.stroke();
        }
    }

    //check for asteroids collisions
    if (!exploding) {
        if (ship.blinkNum === 0 && !ship.dead) {
            for (let i = 0; i < asteroids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }

        //rotate ship
        ship.a += ship.rot;

        //move the ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        ship.explodeTime--;
        // reset the ship
        if (ship.explodeTime === 0) {
            lives--;
            if(lives === 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }

    }

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

    //move the lasers
    for (let i = ship.lasers.length - 1; i >= 0; i--) {

        //check distance flied
        if (ship.lasers[i].dist > LASER_DIST * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        // handle the explosion
        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            //destroy the laser after duration
            if (ship.lasers[i].explodeTime === 0) {
                ship.lasers.splice(i, 1);
                continue;
            }
        } else {
            //move the laser
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            //calculate the distance
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }

        //handle edge of screen
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canvas.width;
        } else if (ship.lasers[i].x > canvas.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canvas.height;
        } else if (ship.lasers[i].y > canvas.height) {
            ship.lasers[i].y = 0;
        }
    }

    //move the asteroid
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;

        //handle edge of screen
        if (asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canvas.width + asteroids[i].r;
        } else if (asteroids[i].x > canvas.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r
        }

        if (asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canvas.height + asteroids[i].r;
        } else if (asteroids[i].y > canvas.height + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r
        }
    }

    // ship body
    //ctx.drawImage(shipBody, ship.x -1, ship.y -1, 37, 55);
    /*ctx.fillStyle = 'red';
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)*/
}