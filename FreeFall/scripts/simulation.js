/* 
    IDEAS:
    - Start - Stop 
    - Scale for accurate measurments
    - Slow motion (maybe a slider)
    - Attach to a catapult where you can affect the rotation speed, radius, and angle
*/

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: { y: 100 },
            debug: false
        }
    },
};

var game = new Phaser.Game(config);
var sky;
var ball;
var go;
var gravity = -0.002;
var initXpos = 20;
var initYpos = 580;
var initXvel = 1;
var initYvel = 1.5;
var startTime = 0;
var simRunning = false; 
var startTime = null;

function preload ()
{
    // preload assets for the game
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ball', 'assets/ball.png');
    this.load.image('go', 'assets/go.png');
}

function create ()
{
    // initialize the game
    sky     = this.add.image(400, 300, 'sky');
    
    go      = this.add.sprite(35, 35, 'go');
    go.setScale(.5);
    go.setInteractive();
    go.on('pointerdown', () => startSimulation() );

    ball    = this.add.sprite(initXpos, initYpos, 'ball');
    ball.setScale(.2);
}

function update ()
{
    if (simRunning) {
        let timeElapsed = (Date.now() - startTime)/10;
        ball.x = initXpos + (initXvel * timeElapsed);
        ball.y = initYpos - (initYvel * timeElapsed) - (gravity * timeElapsed * timeElapsed) ;
    } else {
        let a = 1;
    }

}

// start simulation
function startSimulation() {
    simRunning = true;
    startTime = Date.now();
}

