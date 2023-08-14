/* 
  NOTES

  In phaser, the top of the screen is y == 0
  Y values are therefor inverted
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

// Screen Variables
var screenHeightPixels  = 800;
var screenWidthPixels   = 1000;

var forceArrowOriginX   = 880;
var forceArrowOriginY   = 230;
var forceArrowMaxHeight = 80;

var topOfScreenHeight = 1100;
var metersPerPixel = topOfScreenHeight/screenHeightPixels; 


// Position / Force Variables
var initXPosition       = 200;
var initYPosition       = 100;
var currYPosition;

var initYVelocity       = 0;
var currYVelocity;

var initAcceleration    = 0;
var currAcceleration;

var gravitationalForce;
var dragForce;

var useAirDrag = false;

// Time Vars (in seconds)
var lastTimeCheck;
var totalTimeElapsed = 0;

// Flags
var simRunning = false; 
var simComplete = false;


// background
var sky;
var ground;
var textBackground;
var forceBackground;

// HUD
var forcesText;
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
var gravitationalForceText;
var gravitationalForceArrow;
var dragForceText;
var dragForceArrow;

var buttonPlayPauseDownload;
var buttonRestart;
var objectsChoice;
var object;
var planetsChoice;


// config Phaser
// Note that gravity is turned off to allow us to control it
var config = {
    type: Phaser.AUTO,
    width: screenWidthPixels,
    height: screenHeightPixels,
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

/**************************************
 *               PRELOAD              *
 **************************************/
function preload ()
{
    // preload assets for the game
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('textBackground', 'assets/textBackground.png');
    this.load.image('forceBackground', 'assets/forceBackground.png');
    this.load.spritesheet('buttonPlayPauseDownload', 'assets/buttonPlayPause.png', { frameWidth: 50, frameHeight: 50 });
    this.load.image('buttonRestart', 'assets/buttonRestart.png');
    this.load.spritesheet('buttonAirVacuum', 'assets/airVacuum.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('objectsChoice', 'assets/objectsChoice.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('object', 'assets/objects.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('planetsChoice', 'assets/planetsChoice.png', { frameWidth: 100, frameHeight: 100 });
    this.load.image('arrow', 'assets/forceArrow.png');
}

/**************************************
 *               CREATE               *
 **************************************/
function create ()
{

    /**************************************
     * objectsDict
     * 
     * initialize objectsDict to contain properties for each object
     * inital object: "sphere"
     **************************************/
    objectsDict = {
        "sphere": {
            "dragCoefficient": 0.5,
            "surfaceArea": 2, 
            "mass": 40,
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
    // initialize currObject and currPlanet
    currObject = "sphere";
    
    /**************************************
     * planetsDict / currPlanet
     * 
     * initialize planetsDict to contain properties for each celestial body
     * note that gravitationalAcceleration is positive due to the inverted y axis
     * initial planet: "earth"
     **************************************/
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
    // initialize currPlanet
    currPlanet = "earth";

    // initialize the game
    startOver();


    /**************************************
     *             UI stuff               *
     **************************************/

    // Background UI
    sky             = this.add.image(screenWidthPixels/2, screenHeightPixels/2, 'sky');
    ground          = this.add.image(screenWidthPixels/2, screenHeightPixels, 'ground')
    textBackground  = this.add.image(710, 560, 'textBackground');
    forceBackground = this.add.image(710, 225, 'forceBackground');
    
    // Text
    forcesText                      = this.add.text(660, 165, `FORCES`, { fontSize: '24px', fill: '#000000' });
    dragForceText                   = this.add.text(480, 205, `         Drag Force: ${dragForce.toFixed(2)} newtons`, { fontSize: '16px', fill: '#000000' });
    gravitationalForceText          = this.add.text(480, 235, `Gravitational Force: ${gravitationalForce.toFixed(2)} newtons`, { fontSize: '16px', fill: '#000000' });

    propertiesText                  = this.add.text(600, 350, `POSITIONAL DATA`, { fontSize: '24px', fill: '#000000' });
    accelerationText                = this.add.text(550, 390, `Acceleration: ${-1 * currAcceleration.toFixed(2)} meters/second^2`, { fontSize: '16px', fill: '#000000' });
    velocityText                    = this.add.text(550, 420, `    Velocity: ${-1 * currYVelocity.toFixed(2)} meters/second`, { fontSize: '16px', fill: '#000000' });
    YPositionText                   = this.add.text(550, 450, `      Height: ${((screenHeightPixels * metersPerPixel) - currYPosition).toFixed(2)} meters`, { fontSize: '16px', fill: '#000000' });
    timeElapsedText                 = this.add.text(550, 480, `        Time: ${totalTimeElapsed.toFixed(2)} seconds`, { fontSize: '16px', fill: '#000000' });

    objectConstantsText             = this.add.text(600, 530, `OBJECT CONSTANTS`, { fontSize: '24px', fill: '#000000' });
    dragCoefficientText             = this.add.text(550, 570, `Drag Coefficient: ${dragCoefficient}`, { fontSize: '16px', fill: '#000000' });
    surfaceAreaText                 = this.add.text(550, 600, `    Surface Area: ${surfaceArea} meters^2`, { fontSize: '16px', fill: '#000000' });
    massText                        = this.add.text(550, 630, `            Mass: ${mass} kilograms`, { fontSize: '16px', fill: '#000000' });

    planetConstantsText             = this.add.text(600, 680, `'PLANET' CONSTANTS`, { fontSize: '24px', fill: '#000000' });
    gravitationalAccelerationText   = this.add.text(465, 720, `Gravitational Acceleration: ${gravitationalAcceleration} meters/second^2`, { fontSize: '16px', fill: '#000000' });
    fluidDensityText                = this.add.text(465, 750, `       Atmospheric Density: ${fluidDensity} kilograms/meter^2`, { fontSize: '16px', fill: '#000000' });

    // background
    sky.setScale(2);

    
    
    /********************************** 
     * play | pause | download button *
     **********************************/
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
        if (!simComplete) {
            if (simRunning) {
                buttonPlayPauseDownload.anims.play('play', true);
            } else {
                buttonPlayPauseDownload.anims.play('pause', true);
            }
            toggleSimRunning();
        }
    });

    /****************** 
     * restart button *
     ******************/
    buttonRestart = this.add.sprite(960, 40, 'buttonRestart');
    buttonRestart.setInteractive();
    // when clicked, update appearance and toggle simulation running
    buttonRestart.on('pointerdown', () => {
        // reset play button
        buttonPlayPauseDownload.anims.play('play', true);
        startOver();
    });

    /***********************
     * air | vacuum button *
     ***********************/
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
    buttonAirVacuum = this.add.sprite(485, 65, 'buttonAirVacuum');
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

    /***********
     * objects *
     ***********/
    this.anims.create({
        key: 'sphere',
        frames: [ { key: 'object', frame: 0 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'basketball',
        frames: [ { key: 'object', frame: 1 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'balloon',
        frames: [ { key: 'object', frame: 2 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'parachuter',
        frames: [ { key: 'object', frame: 3 } ],
        frameRate: 0
    });
    object = this.add.sprite(initXPosition, initYPosition / metersPerPixel, 'object');
    object.anims.play(currObject, true); 

    /********************
     * objects selector *
     ********************/
    this.anims.create({
        key: 'sphereChoice',
        frames: [ { key: 'objectsChoice', frame: 0 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'basketballChoice',
        frames: [ { key: 'objectsChoice', frame: 1 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'balloonChoice',
        frames: [ { key: 'objectsChoice', frame: 2 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'parachuterChoice',
        frames: [ { key: 'objectsChoice', frame: 3 } ],
        frameRate: 0
    });
    objectsChoice = this.add.sprite(600, 65, 'objectsChoice');
    objectsChoice.anims.play(`${currObject}Choice`, true); 
    objectsChoice.setInteractive();
    // when clicked, update appearance and toggle simulation running
    objectsChoice.on('pointerdown', () => {

        // set currObject to be the next item in the dictionary
        currObject = getNextDictElement(objectsDict, currObject);

        // update frame for object and objectsChoice
        objectsChoice.anims.play(`${currObject}Choice`, true);
        object.anims.play(currObject, true);

        // reset play button
        buttonPlayPauseDownload.anims.play('play', true);
        startOver();
        
    });

    /*******************
     * planet selector *
     *******************/
    this.anims.create({
        key: 'earth', 
        frames: [ { key: 'planetsChoice', frame: 0 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'moon',
        frames: [ { key: 'planetsChoice', frame: 1 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'mars',
        frames: [ { key: 'planetsChoice', frame: 2 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'venus',
        frames: [ { key: 'planetsChoice', frame: 3 } ],
        frameRate: 0
    });
    this.anims.create({
        key: 'sun',
        frames: [ { key: 'planetsChoice', frame: 4 } ],
        frameRate: 0
    });
    planetsChoice = this.add.sprite(715, 65, 'planetsChoice');
    planetsChoice.anims.play(currPlanet, true); 
    planetsChoice.setInteractive();
    // when clicked, update appearance and toggle simulation running
    planetsChoice.on('pointerdown', () => {

        // set currPlanet to be the next item in the dictionary
        currPlanet = getNextDictElement(planetsDict, currPlanet);

        // update frame for planetsChoice
        planetsChoice.anims.play(currPlanet, true);

        // reset play button
        buttonPlayPauseDownload.anims.play('play', true);
        startOver();
        
    });

    /****************
     * force arrows *
     ****************/
    gravitationalForceArrow = this.add.sprite(forceArrowOriginX, forceArrowOriginY, 'arrow');
    gravitationalForceArrow.flipY = true;
    gravitationalForceArrow.displayWidth = 15;
    gravitationalForceArrow.displayHeight = 0;
    gravitationalForceArrow.y = forceArrowOriginY + (gravitationalForceArrow.displayHeight)/2 + 2;
    dragForceArrow = this.add.sprite(forceArrowOriginX, forceArrowOriginY, 'arrow');
    dragForceArrow.displayWidth = 15;
    dragForceArrow.displayHeight = 0;
    dragForceArrow.y = forceArrowOriginY - (dragForceArrow.displayHeight)/2 - 2;

}

/**************************************
 *               UPDATE               *
 **************************************/
function update ()
{
    let timeDelta;
    let newAcceleration;
    let newYVelocity;
    let newYPosition;


    if (simRunning) {

        // record the time and set totalTimeElapsed
        currTime = new Date().getTime()/1000;
        timeDelta = currTime - lastTimeCheck;
        totalTimeElapsed += (timeDelta);
        
        // get acceleration, velocity, and y position - see README for details
        // use the trapezoid rule for a Riemann sum to approximate integration
        //   see: https://en.wikipedia.org/wiki/Riemann_sum#Trapezoidal_rule
        // moon has no atmosphere and therefore would behave like vacuum
        if (useAirDrag && (currPlanet != 'moon')) {
            /* air drag

             b is (Cd * ρ * A)/2, i.e. the constants in the drag force. 

             Because acceleration is dependent on velocity, it's not easy to do a 
             trapezoid rule. The following approach is a decent estimate:

             1. Calculate newYVelocity using currAcceleration
             2. Plug newYVelocity back into the formula for acceleration to get newAcceleration
             3. Perform a trapezoid rule to get a new newYVelocity from acceleration
             4. Perform a trapezoid rule to get newYPosition from velocity

              Acceleration = (b * v^2)/m - g
               Velocity: v = v + (a * dt) 
               Position: y = y + (v * dt) + (a * dt^2)/2
               Force(drag) = 1/2 * Cd * ρ * A * (v(t)^2) = b * (v(t)^2)

            */
            newYVelocity        = currYVelocity + (currAcceleration * timeDelta);

            newAcceleration     = gravitationalAcceleration - ((dragConstantB * newYVelocity * newYVelocity) /mass);

            newYVelocity        = currYVelocity + (0.5 * (currAcceleration + newAcceleration) * timeDelta); // use the trapezoid rule for a Riemann sum
            newYPosition        = currYPosition + (0.5 * (currYVelocity + newYVelocity) * timeDelta);       // use the trapezoid rule for a Riemann sum

            currAcceleration    = newAcceleration;
            currYVelocity       = newYVelocity;
            currYPosition       = newYPosition;

            gravitationalForce  = gravitationalAcceleration * mass;
            dragForce           = dragConstantB * currYVelocity * currYVelocity;


        } else {
            /* no air drag - see README for details

              Acceleration:      a = -g - always the same
                  Velocity: v(new) = v(curr) + (a * dt) 
                  Position: y(new) = y(curr) + (0.5 * (v(new) + v(curr)) * dt)
            */
            currAcceleration    = gravitationalAcceleration;
            
            newYVelocity        = currYVelocity + (currAcceleration * timeDelta); // don't need to estimate because constant acceleration
            newYPosition        = currYPosition + (0.5 * (currYVelocity + newYVelocity) * timeDelta); // use the trapezoid rule for a Riemann sum

            currYVelocity       = newYVelocity;
            currYPosition       = newYPosition;

            gravitationalForce  = gravitationalAcceleration * mass;
            dragForce           = 0;
        }
        // set lastTimeCheck
        lastTimeCheck = currTime;
    } 

    // update object position
    object.y = currYPosition / metersPerPixel;

    // update text fields
    accelerationText.setText(`Acceleration: ${-1 * currAcceleration.toFixed(2)} meters/second^2`);  // negate due to inverted y-axis
    velocityText.setText(`    Velocity: ${-1 * currYVelocity.toFixed(2)} meters/second`);           // negate due to inverted y-axis
    YPositionText.setText(`      Height: ${((screenHeightPixels * metersPerPixel) - currYPosition).toFixed(2)} meters`);     // subtract from screenHeigh to get height
    timeElapsedText.setText(`        Time: ${totalTimeElapsed.toFixed(2)} seconds`);
    gravitationalAccelerationText.setText(`Gravitational Acceleration: ${gravitationalAcceleration.toFixed(2)} meters/second^2`);
    fluidDensityText.setText(`       Atmospheric Density: ${fluidDensity.toFixed(2)} kilograms/meter^2`);
    dragCoefficientText.setText(`Drag Coefficient: ${dragCoefficient.toFixed(2)}`);
    surfaceAreaText.setText(`    Surface Area: ${surfaceArea.toFixed(2)} meters^2`);
    massText.setText(`            Mass: ${mass.toFixed(2)} kilograms`);
    gravitationalForceText.setText(`Gravitational Force: ${gravitationalForce.toFixed(2)} newtons`);
    dragForceText.setText(`         Drag Force: ${dragForce.toFixed(2)} newtons`);

    // update gravitational force arrow (gravitation is max size)
    // nonzero if object has acceleration
    if (currAcceleration != 0) {
        gravitationalForceArrow.displayHeight = forceArrowMaxHeight;
    } else {
        gravitationalForceArrow.displayHeight = 0;
    }
    // position because position is based on center of the sprite
    gravitationalForceArrow.y = forceArrowOriginY + (gravitationalForceArrow.displayHeight)/2 + 2;

    // drag force arrow is porportional to gravitational
    // nonzero if object has velocity
    if (currYVelocity != 0) {
        dragForceArrow.displayHeight = gravitationalForceArrow.displayHeight * dragForce / gravitationalForce;
    } else {
        dragForceArrow.displayHeight = 0;
    }
    // position because position is based on center of the sprite
    dragForceArrow.y = forceArrowOriginY - (dragForceArrow.displayHeight)/2 - 2;

    // if at (or beyond 0), pause sim
    if (((screenHeightPixels * metersPerPixel) - currYPosition) <= 0) {
        // pause sim
        buttonPlayPauseDownload.anims.play('download', true); // show download button for future imlpementation
        simRunning = false;
        simComplete = true;
    }

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
    gravitationalForce  = 0;
    dragForce           = 0;


    // reset simRunning
    simRunning = false;
    simComplete = false;
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