/* 
    TODO:
    - Change name from ball
    - Check on air drag. It seems to be working... try to find a few tests
    - Is this helpful: https://www.longdom.org/open-access/buoyancy-explains-terminal-velocity-in-skydiving-15928.html ? 
    - Incorporate Carly's images
    - Figure out boyancy thing
*/

/* 
  NOTES

  In phaser, the top of the screen is y == 0
*/


// Constants
var gravitationalAcceleration = 9.81 // positive because of inverted y axis;

// Initial values
var screenHeight        = 800;
var screenWidth         = 1000;

var initXPosition       = 50;

var initYPosition       = 0;
var currYPosition       = initYPosition;

var initYVelocity       = 0;
var currYVelocity       = initYVelocity;

var initAcceleration    = gravitationalAcceleration;
var currAcceleration    = initAcceleration;

var dragCoefficient     = 1;              // Cd (sphere = .5)
var fluidDensity        = 1.23              //  ρ: kg / m^3
var surfaceArea         = 1.06   //  A (basketball = Math.PI * .119 * .119)
var dragConstantB       = (dragCoefficient * fluidDensity * surfaceArea)/2 // b is (Cd * ρ * A)/2, i.e. the constants in the drag force. 
var mass                = 90                 //     kg (basketball = .68)
startOver();

// Settings
var metersPerPixel = 1; // scale size
var useAirDrag = false;


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


// HUD
var accelerationText;
var velocityText;
var YPositionText;
var timeElapsedText;
var buttonPlayPauseDownload;
var buttonRestart;


// Time Vars (in seconds)
var lastTimeCheck;
var totalTimeElapsed = 0;
var simRunning = false; 


function preload ()
{
    // preload assets for the game
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ball', 'assets/skydiver.png');
    this.load.spritesheet('buttonPlayPauseDownload', 'assets/buttonPlayPause.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('buttonRestart', 'assets/buttonRestart.png');
    this.load.spritesheet('buttonAirVacuum', 'assets/airVacuum.png', { frameWidth: 100, frameHeight: 100 });
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
    ball.setScale(.04);

    // Text
    accelerationText    = this.add.text(400, 270, `Acceleration: ${-1 * currAcceleration.toFixed(2)} meters/second^2`, { fontSize: '24px', fill: '#FFF' });
    velocityText        = this.add.text(400, 300, `    Velocity: ${-1 * currYVelocity.toFixed(2)} meters/second`, { fontSize: '24px', fill: '#FFF' });
    YPositionText       = this.add.text(400, 330, `      Height: ${((screenHeight * metersPerPixel) - currYPosition).toFixed(2)} meters`, { fontSize: '24px', fill: '#FFF' });
    timeElapsedText     = this.add.text(400, 360, `        Time: ${totalTimeElapsed.toFixed(2)} seconds`, { fontSize: '24px', fill: '#FFF' });

    // background
    sky.setScale(2);

    // buttons
    
    // set up button for play | pause | download
    this.anims.create({
        key: 'play',
        frames: [ { key: 'buttonPlayPauseDownload', frame: 0 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'pause',
        frames: [ { key: 'buttonPlayPauseDownload', frame: 1 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'download',
        frames: [ { key: 'buttonPlayPauseDownload', frame: 2 } ],
        frameRate: 0
    });
    buttonPlayPauseDownload = this.add.sprite(895, 40, 'buttonPlayPauseDownload');
    buttonPlayPauseDownload.anims.play('play', true); // initialize to play
    buttonPlayPauseDownload.setInteractive();
    // when clicked, update appearance and toggle simulation running
    buttonPlayPauseDownload.on('pointerdown', () => {
        if (simRunning) {
            buttonPlayPauseDownload.anims.play('play', true);
        } else {
            buttonPlayPauseDownload.anims.play('pause', true);
        }
        toggleSimRunning();
    });

    // restart button
    buttonRestart = this.add.sprite(960, 40, 'buttonRestart');
    buttonRestart.setInteractive();
    // when clicked, update appearance and toggle simulation running
    buttonRestart.on('pointerdown', () => {
        // reset play button
        buttonPlayPauseDownload.anims.play('play', true);
        startOver();
    });

    // air | vacuum button
    this.anims.create({
        key: 'air',
        frames: [ { key: 'buttonAirVacuum', frame: 0 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'vacuum',
        frames: [ { key: 'buttonAirVacuum', frame: 1 } ],
        frameRate: 0
    });
    buttonAirVacuum = this.add.sprite(935, 125, 'buttonAirVacuum');
    buttonAirVacuum.anims.play('vacuum', true); // initialize to play
    buttonAirVacuum.setInteractive();
    // when clicked, update appearance and toggle simulation running
    buttonAirVacuum.on('pointerdown', () => {
        
        // toggle useAirDrag
        useAirDrag = !useAirDrag;
       
        // update button
        if (useAirDrag) {
            buttonAirVacuum.anims.play('air', true);
        } else {
            buttonAirVacuum.anims.play('vacuum', true);
        }

        // reset play button
        buttonPlayPauseDownload.anims.play('play', true);
        startOver();
        
    });




}

function update ()
{
    if (simRunning) {

        // record the time and set totalTimeElapsed
        currTime = new Date().getTime()/1000;
        totalTimeElapsed += (currTime - lastTimeCheck);
        
        // get acceleration, velocity, and y position 
        if (useAirDrag) {
            /* air drag

             b is (Cd * ρ * A)/2, i.e. the constants in the drag force. 

              Acceleration = (b * v^2)/m - g
                  Velocity = sqrt(m*g/b) * tanh( ( t * sqrt(b*g/m) ) + arctanh( v(0) * sqrt(b/(m*g)) ) )
                  Position = (m/b) * ln( cosh( ( t * sqrt(b*g/m) ) + arctanh( v(0) * sqrt(b/(m*g)) ) )  ) 
                             - y(0) 
                             - (m/b) * ln( cosh( arctanh( v(0) * sqrt(b/(m*g)) ) ) )

            */
            currAcceleration = gravitationalAcceleration - ((dragConstantB * currYVelocity * currYVelocity) /mass);
            currYVelocity    = Math.sqrt(mass * gravitationalAcceleration / dragConstantB) * Math.tanh( ( totalTimeElapsed * Math.sqrt(dragConstantB * gravitationalAcceleration / mass) ) + Math.atanh( initYVelocity * Math.sqrt(dragConstantB / (mass * gravitationalAcceleration)) ) );
            currYPosition    = (mass/dragConstantB) * Math.log( Math.cosh( ( totalTimeElapsed * Math.sqrt((dragConstantB*gravitationalAcceleration)/mass) ) + Math.atanh( initYVelocity * Math.sqrt(dragConstantB/(mass*gravitationalAcceleration)) ) ) ) - initYPosition - ((mass/dragConstantB) * Math.log( Math.cosh( Math.atanh( initYVelocity * Math.sqrt(dragConstantB/(mass*gravitationalAcceleration)) ) ) ) )

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
        // set lastTimeCheck
        lastTimeCheck = currTime;
    } 

    // update ball position
    ball.y = currYPosition;

    // update text
    accelerationText.setText(`Acceleration: ${-1 * currAcceleration.toFixed(2)} meters/second^2`);  // negate due to inverted y-axis
    velocityText.setText(`    Velocity: ${-1 * currYVelocity.toFixed(2)} meters/second`);           // negate due to inverted y-axis
    YPositionText.setText(`      Height: ${((screenHeight * metersPerPixel) - currYPosition).toFixed(2)} meters`);     // subtract from screenHeigh to get height
    timeElapsedText.setText(`        Time: ${totalTimeElapsed.toFixed(2)} seconds`);


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

// start over
function startOver() {
    // reset values
    currYPosition       = initYPosition;
    currYVelocity       = initYVelocity;
    currAcceleration    = initAcceleration;
    totalTimeElapsed    = 0;

    // reset simRunning
    simRunning = false;
}
