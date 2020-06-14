const FPS = 30; // Frames Per Second
        let SHIP_SIZE = 30; // ship size
        let TURN_SPEED = 360; // turn speed per second(degrees)
        const SHIP_THRUST = 5; // acceleration of the ship per second

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

        setInterval(update, 1000 / FPS);
        let keyDown = (ev) => {
            switch (ev.keyCode) {
                case 37:
                    ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
                    break;
                case 38:
                    ship.thrusting =  true;
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
                    ship.thrusting =  false;
                    break;
                case 39:
                    ship.rot = 0;
                    break;
            }
        };

        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);

        function update(){
            ctx.fillStyle = ctx.createPattern(background, 'no-repeat');
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if(ship.thrusting){
                ship.thrust.x += SHIP_THRUST * Math.cos(ship.a)/ FPS;
                ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a)/ FPS;
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

            ship.a += ship.rot;

            ship.x += ship.thrust.x;
            ship.y += ship.thrust.y;

            ctx.drawImage(shipBody, ship.x - 18, ship.y - 21, 37, 55);
        }