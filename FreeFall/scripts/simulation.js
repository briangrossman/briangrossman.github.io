/* 
    TODO:
    - Figure out boyancy thing
*/

/* 
  NOTES

  In phaser, the top of the screen is y == 0
*/


// Constants
var gravitationalAcceleration = 9.81 // positive because of inverted y axis;

// Initial values
var screenHeight        = 1000;
var screenWidth         = 1000;
var initXPosition       = 50;
var initYPosition       = 0;
var currYPosition       = initYPosition;
var initYVelocity       = 0;
var currYVelocity       = initYVelocity;
var initAcceleration    = gravitationalAcceleration;
var currAcceleration    = initAcceleration;


// config Phaser
var config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    parent: 'game-container',
    physics: {
        default: 'matter',
        matter: {
            enableSleeping: true,
            gravity: {
                y: 0
            },
            debug: {
                showBody: false,
                showStaticBody: false,
            }
        }
    },
};

var game = new Phaser.Game(config);
var sky;
var ball;

// Settings
var metersPerPixel = 1; // scale size
var useAirDrag = false;

// HUD
var accelerationText;
var velocityText;
var YPositionText;
var timeElapsedText;


// Time Vars (in seconds)
var lastTimeCheck;
var totalTimeElapsed = 0;
var simRunning = false; 




// TO REVIEW
var go;
// TO REVIEW

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

    // update based on spacial scale
    gravitationalAcceleration = gravitationalAcceleration / metersPerPixel;

    // Background
    sky = this.add.image(500, 500, 'sky');

    // object
    ball = this.add.sprite(initXPosition, initYPosition, 'ball');
    ball.setScale(.2);

    // Text
    accelerationText    = this.add.text(300,  70, `Acceleration: ${-1 * currAcceleration.toFixed(2)} meters/second^2`, { fontSize: '24px', fill: '#FFF' });
    velocityText        = this.add.text(300, 100, `    Velocity: ${-1 * currYVelocity.toFixed(2)} meters/second`, { fontSize: '24px', fill: '#FFF' });
    YPositionText       = this.add.text(300, 130, `      Height: ${(screenHeight - currYPosition).toFixed(2)} meters`, { fontSize: '24px', fill: '#FFF' });
    timeElapsedText     = this.add.text(300, 160, `        Time: ${totalTimeElapsed.toFixed(2)} seconds`, { fontSize: '24px', fill: '#FFF' });


    // TO REVIEW
    sky.setScale(2);
    go = this.add.sprite(950, 35, 'go');
    go.setScale(.5);
    go.setInteractive();
    go.on('pointerdown', () => toggleSimRunning() );
    // TO REVIEW

}

function update ()
{
    if (simRunning) {

        // record the time and set totalTimeElapsed
        currTime = new Date().getTime()/1000;
        totalTimeElapsed += (currTime - lastTimeCheck);
        
        // get acceleration, velocity, and y position 
        if (useAirDrag) {
            // air drag
            nothing();

        } else {
            /* no air drag

              Acceleration: a = -g
                  Velocity: v = v0 + gt 
                  Position: y = y0 + (v0 * t) + (g * t^2)/2
            */
            currAcceleration = initAcceleration; // constant acceleration
            currYVelocity    = initYVelocity + (gravitationalAcceleration * totalTimeElapsed);
            currYPosition    = initYPosition + (initYVelocity * totalTimeElapsed) + (0.5 * gravitationalAcceleration * totalTimeElapsed * totalTimeElapsed);
        }
        ball.y = currYPosition;

        // update text
        accelerationText.setText(`Acceleration: ${-1 * currAcceleration.toFixed(2)} meters/second^2`);  // negate due to inverted y-axis
        velocityText.setText(`    Velocity: ${-1 * currYVelocity.toFixed(2)} meters/second`);           // negate due to inverted y-axis
        YPositionText.setText(`      Height: ${(screenHeight - currYPosition).toFixed(2)} meters`);     // subtract from screenHeigh to get height
        timeElapsedText.setText(`        Time: ${totalTimeElapsed.toFixed(2)} seconds`);

        // set lastTimeCheck
        lastTimeCheck = currTime;
    } 

}

// toggle if sim is running
function toggleSimRunning() {

    // if running, pause
    if (simRunning) {
        simRunning = false;
    } else {
        // start the sim
        simRunning = true;

        // set lastTimeCheck
        lastTimeCheck = new Date().getTime()/1000;
    }

}

