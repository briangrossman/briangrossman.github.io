/* 
    TODO:
    - ability to swap objects (Change name from ball)
       - Options:
          - sphere
          - basketball
          - baloon
          - skydiver
          - ??
       - Display values   

    - Fix pixels scale
       - And how it interacts with gravity
       - Check implemented model: https://en.wikipedia.org/wiki/Free_fall#:~:text=With%20air%20resistance%20acting%20on,mph)%20for%20a%20human%20skydiver.

    - Build out different model
       - Allow switching between models
       - Make sure you believe their working

    - Build out skydiver opening chute

    - Force graphic
       - Shows force arrows
       - shows image of object, shaking a little

    - Choose planet

    - Updated parachuter?

    - What's the deal with boyancy?
       - Is this helpful: https://www.longdom.org/open-access/buoyancy-explains-terminal-velocity-in-skydiving-15928.html ? 
*/

/* 
  NOTES

  In phaser, the top of the screen is y == 0
*/


// Constants
var objectsDict;
var currObject;
var planetsDict;
var currPlanet;

// planet vars
var gravitationalAcceleration;   // g: m/s^2
var fluidDensity;                // ρ: kg / m^3

// object vars
var dragCoefficient;             // [dimensionless]
var surfaceArea;                 // A: m^2
var mass;                        // m: kg

// helper constant
var dragConstantB;               // b: is (Cd * ρ * A)/2, i.e. the constants in the drag force. 

// Initial values
var screenHeight        = 800;
var screenWidth         = 1000;

var initXPosition       = 100;
var initYPosition       = 0;
var currYPosition;

var initYVelocity       = 0;
var currYVelocity;

var initAcceleration    = 0;
var currAcceleration;


// Settings
var metersPerPixel = 1; // scale size
var useAirDrag = false;

// objects
var sky;
var ball; // adf


// HUD
var propertiesText
var accelerationText;
var velocityText;
var YPositionText;
var timeElapsedText;
var planetConstantsText;
var gravitationalAccelerationText;
var fluidDensityText;
var objectConstantsText;
var dragCoefficientText;
var surfaceAreaText;
var massText;


var buttonPlayPauseDownload;
var buttonRestart;
var objectsChoice;


// Time Vars (in seconds)
var lastTimeCheck;
var totalTimeElapsed = 0;
var simRunning = false; 



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


function preload ()
{
    // preload assets for the game
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ball', 'assets/skydiver.png'); // asdf
    this.load.spritesheet('buttonPlayPauseDownload', 'assets/buttonPlayPause.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('buttonRestart', 'assets/buttonRestart.png');
    this.load.spritesheet('buttonAirVacuum', 'assets/airVacuum.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('objectsChoice', 'assets/objectsChoice.png', { frameWidth: 100, frameHeight: 100 });
}

function create ()
{
    // initialize objectsDict to contain properties for each object
    objectsDict = {
        "sphere": {
            "dragCoefficient": 0.5,
            "surfaceArea": 2, 
            "mass": 1,
        },
        "basketball": {
            "dragCoefficient": 0.5,
            "surfaceArea": Math.PI * .119 * .119, 
            "mass": .68,
        },
        "balloon": {
            "dragCoefficient": 0.5,
            "surfaceArea": Math.PI * .119 * .119, 
            "mass": .04,
        },
        "parachuter": {
            "dragCoefficient": 1,
            "surfaceArea": 1.06, 
            "mass": 90,
        },
    };
    
    // initialize planetsDict to contain properties for each celestial body
    // note that gravitationalAcceleration is positive due to the inverted y axis
    planetsDict = {
        "earth": {
            "gravitationalAcceleration": 9.81,
            "fluidDensity": 1.23,
        },
        "moon": {
            "gravitationalAcceleration": 1.6,
            "fluidDensity": 0,
        },
        "mars": {
            "gravitationalAcceleration": 3.7,
            "fluidDensity": 0.020,
        },
        "venus": {
            "gravitationalAcceleration": 8.87,
            "fluidDensity": 65,
        },
        "sun": {
            "gravitationalAcceleration": 275,
            "fluidDensity": 0.0001,
        },
    };

    // initialize currObject and currPlanet
    currObject = "sphere";
    currPlanet = "earth";
    
    // initialize the game
    startOver();

    // update based on spacial scale
    // gravitationalAcceleration = gravitationalAcceleration / metersPerPixel;

    // Background
    sky = this.add.image(500, 500, 'sky');

    // object
    ball = this.add.sprite(initXPosition, initYPosition, 'ball'); // asdf
    ball.setScale(.04); // asdf

    // Text
    propertiesText                  = this.add.text(400, 230, `POSITIONAL DATA`, { fontSize: '24px', fill: '#FFF' });
    accelerationText                = this.add.text(400, 270, `Acceleration: ${-1 * currAcceleration.toFixed(2)} meters/second^2`, { fontSize: '16px', fill: '#FFF' });
    velocityText                    = this.add.text(400, 300, `    Velocity: ${-1 * currYVelocity.toFixed(2)} meters/second`, { fontSize: '16px', fill: '#FFF' });
    YPositionText                   = this.add.text(400, 330, `      Height: ${((screenHeight * metersPerPixel) - currYPosition).toFixed(2)} meters`, { fontSize: '16px', fill: '#FFF' });
    timeElapsedText                 = this.add.text(400, 360, `        Time: ${totalTimeElapsed.toFixed(2)} seconds`, { fontSize: '16px', fill: '#FFF' });
    planetConstantsText             = this.add.text(400, 390, `PLANET CONSTANTS`, { fontSize: '24px', fill: '#FFF' });
    gravitationalAccelerationText   = this.add.text(400, 430, `Gravitational Acceleration: ${gravitationalAcceleration} meters/second^2`, { fontSize: '16px', fill: '#FFF' });
    fluidDensityText                = this.add.text(400, 460, `       Atmospheric Density: ${fluidDensity} kilograms/meter^2`, { fontSize: '16px', fill: '#FFF' });
    objectConstantsText             = this.add.text(400, 490, `OBJECT CONSTANTS`, { fontSize: '24px', fill: '#FFF' });
    dragCoefficientText             = this.add.text(400, 520, `Drag Coefficient: ${dragCoefficient}`, { fontSize: '16px', fill: '#FFF' });
    surfaceAreaText                 = this.add.text(400, 550, `    Surface Area: ${surfaceArea} meters^2`, { fontSize: '16px', fill: '#FFF' });
    massText                        = this.add.text(400, 580, `            Mass: ${mass} kilograms`, { fontSize: '16px', fill: '#FFF' });

    // background
    sky.setScale(2);

    
    // ---------- play | pause | download button ---------- //
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

    // ---------- restart button ---------- //
    buttonRestart = this.add.sprite(960, 40, 'buttonRestart');
    buttonRestart.setInteractive();
    // when clicked, update appearance and toggle simulation running
    buttonRestart.on('pointerdown', () => {
        // reset play button
        buttonPlayPauseDownload.anims.play('play', true);
        startOver();
    });

    // ---------- air | vacuum button ---------- //
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
    buttonAirVacuum = this.add.sprite(820, 125, 'buttonAirVacuum');
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

    // ---------- objects choice button ---------- //
    this.anims.create({
        key: 'sphere',
        frames: [ { key: 'objectsChoice', frame: 0 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'basketball',
        frames: [ { key: 'objectsChoice', frame: 1 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'balloon',
        frames: [ { key: 'objectsChoice', frame: 2 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'parachuter',
        frames: [ { key: 'objectsChoice', frame: 3 } ],
        frameRate: 0
    });
    objectsChoice = this.add.sprite(935, 125, 'objectsChoice');
    objectsChoice.anims.play('sphere', true); 
    objectsChoice.setInteractive();
    // when clicked, update appearance and toggle simulation running
    objectsChoice.on('pointerdown', () => {

        // set currObject to be the next item in the dictionary
        currObject = getNextDictElement(objectsDict, currObject);

        // update objectsChoice
        objectsChoice.anims.play(currObject, true);

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
            currAcceleration = gravitationalAcceleration; // constant acceleration
            currYVelocity    = initYVelocity + (gravitationalAcceleration * totalTimeElapsed);
            currYPosition    = initYPosition + (initYVelocity * totalTimeElapsed) + (0.5 * gravitationalAcceleration * totalTimeElapsed * totalTimeElapsed);
        }
        // set lastTimeCheck
        lastTimeCheck = currTime;
    } 

    // update ball position
    ball.y = currYPosition; // asdf

    // update text fields
    accelerationText.setText(`Acceleration: ${-1 * currAcceleration.toFixed(2)} meters/second^2`);  // negate due to inverted y-axis
    velocityText.setText(`    Velocity: ${-1 * currYVelocity.toFixed(2)} meters/second`);           // negate due to inverted y-axis
    YPositionText.setText(`      Height: ${((screenHeight * metersPerPixel) - currYPosition).toFixed(2)} meters`);     // subtract from screenHeigh to get height
    timeElapsedText.setText(`        Time: ${totalTimeElapsed.toFixed(2)} seconds`);
    gravitationalAccelerationText.setText(`Gravitational Acceleration: ${gravitationalAcceleration.toFixed(2)} meters/second^2`);
    fluidDensityText.setText(`       Atmospheric Density: ${fluidDensity.toFixed(2)} kilograms/meter^2`);
    dragCoefficientText.setText(`Drag Coefficient: ${dragCoefficient.toFixed(2)}`);
    surfaceAreaText.setText(`    Surface Area: ${surfaceArea.toFixed(2)} meters^2`);
    massText.setText(`            Mass: ${mass.toFixed(2)} kilograms`);
}

// toggle if sim is running
function toggleSimRunning() {

    // if running, pause
    if (simRunning) {
        simRunning = false;
    } else {
        // if starting over (i.e. no time elapsed), set initial acceleration
        currAcceleration = gravitationalAcceleration;

        // start the sim
        simRunning = true;

        // set lastTimeCheck
        lastTimeCheck = new Date().getTime()/1000;
    }

}

// start over
function startOver() {
    // set system constants based on object / planet
    gravitationalAcceleration   = planetsDict[currPlanet]["gravitationalAcceleration"];
    fluidDensity                = planetsDict[currPlanet]["fluidDensity"];

    dragCoefficient             = objectsDict[currObject]["dragCoefficient"];
    surfaceArea                 = objectsDict[currObject]["surfaceArea"];
    mass                        = objectsDict[currObject]["mass"];

    dragConstantB               = (dragCoefficient * fluidDensity * surfaceArea)/2;


    // reset values
    currYPosition       = initYPosition;
    currYVelocity       = initYVelocity;
    currAcceleration    = initAcceleration;
    totalTimeElapsed    = 0;

    // reset simRunning
    simRunning = false;
}

// helper function to get the next element in a dictionary
function getNextDictElement(dictionary, key) {

    // loop over the elements of the dictionary, looking for the key while incrementing i
    let i = 0;
    let nextIndex;
    for (const currKey in dictionary) {
        if (currKey == key) {
            // found it, return the key for the next item

            nextIndex = (i + 1) % Object.keys(dictionary).length;
            return Object.keys(dictionary)[nextIndex];
        }
        i++;
    }
}