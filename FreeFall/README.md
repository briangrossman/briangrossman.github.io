# Assessment
Build out an interactive simulation that demonstrates what happens to objects in freefall on
planet earth.
- Use earth's gravity.
- For the atmosphere, provide the following options: air, no air (vacuum).
- Provide UI elements to start and restart the simulation.
- Provide UI elements to display elapsed time and velocity.
- Graphics/animation can be basic/utilitarian -- what's most important is the math
model/simulation code.
- Bonus: provide UI element that displays some/all of the following: forces of gravity,
buoyancy, and drag.

You can house the simulation in an index.html webpage. Feel free to use any Javascript
libraries that you wish.

You can send us a zip file of the page, or host it somewhere (such as Github or
Codepen)--whatever works for you. Please submit your response before your interview.


# UI/UX

Users can do the following:

- **Play / Pause button**: Click the Play / Pause button to start / pause the simulation
- **Restart button**: Click the restart button to restart the simulation
- **Vacuum / Air button**: Toggle between a simulation with air and in a vacuum. Note that this restarts the simulation.
- **Object button**: Choose the object you want to use for the simulation. Note that this restarts the simulation.
- **Planet button**: Choose the planet you want to use for the simulation. Note that this restarts the simulation.
- **Object**: The object animates as the simulation plays
- **Forces panel**: View the magnitudes and vectors for the force(s) acting on the object
- **Data panel**: View positional data and constants for the simulation
- **Download button**: After a run of the simulation has completed, the Play / Pause button turns to a Download button. This is not implemented, but users would be able to download a .csv containing the positional data of the simulation over time. 



# The Model

An ideal solution would be to find equations for acceleration, velocity, and position as a function of time. With this solution, you can track everything you need to know about an object simply by knowing the time that is has been falling. The math for the vacuum case, is relatively straight forward, but the the math for the system with air resistance proves to be rather complex. I initially did some research (videos, papers, and AP Physics lessons) and found [someone who had managed to create equations](https://philosophicalmath.wordpress.com/2017/10/21/terminal-velocity-derivation/) for acceleration, velocity, and position (in the y direction) with air resistance.

Of note: the assessment references `buoyancy`. I found a couple of articles that referenced `buoyancy` in falling objects ([example](https://www.longdom.org/open-access/buoyancy-explains-terminal-velocity-in-skydiving-15928.html)), but most of the models just dealt with gravitation and drag forces. Hopefully I didn't miss something in the model!


## Movement in a vacuum

```
Acceleration: a = -g
    Velocity: v = v(0) - gt 
    Position: y = y(0) - (v(0) * t) - (g * t^2)/2
```

## Movement with air

First find an equation for acceleration using the ubiquitous `F = ma`. For this system, we will assume all movement is linear in the `y` direction, so the total force is the sum of the force vectors due to gravity (down) and air resistance/drag (up). 

```
F(net) = F(drag) - F(gravity)

F(gravity) = mg (newtons)
-   m: mass (kg)
-   g: gravitational acceleration (9.8 m / s^2 on Earth)

F(drag) = 1/2 * Cd * ρ * A * v^2 (newtons)
-  Cd: drag coefficient; made up of skin friction and form drag
-   ρ: the density of the air/fluid (kg / m^3)
-   A: the area of the surface that is facing the fluid as the object moves (m^2)
- v^2: the square of the velocity (m/s)
```

Note that as the magnitude of the drag force is proportional to the square of the speed. As the object falls faster, the drag force increases. This is why objects will approach a terminal velocity as the drag force approaches the force due to gravity, resulting in an infinitesimal net force and therefore an acceleration that approaches zero. An acceleration of zero results in a constant speed--the terminal velocity.

Solving for acceleration:

```
F(net) = ma
        ma = F(drag) - F(gravity)
        ma = (Cd * ρ * A * v^2)/2 - mg
         a = (Cd * ρ * A * v^2)/2m - g
```

This article: https://philosophicalmath.wordpress.com/2017/10/21/terminal-velocity-derivation/ describes how to integrate the acceleration to get equations for v(t) and y(t). The equations are:

```
Let b = (Cd * ρ * A)/2 - i.e. the constants in the drag force. 

   a = ((b * v^2)/m) - g
v(t) = sqrt(m*g/b) * tanh( ( t * sqrt(b*g/m) ) + arctanh( v(0) * sqrt(b/(m*g)) ) )
y(t) = (m/b) * ln( cosh( ( t * sqrt(b*g/m) ) + arctanh( v(0) * sqrt(b/(m*g)) ) )  ) 
       - y(0) 
       - (m/b) * ln( cosh( arctanh( v(0) * sqrt(b/(m*g)) ) ) )
```

### Terminal Velocity

You can solve for the terminal velocity when the acceleration is zero. 

```
  0 = (Cd * ρ * A * v^2)/2m - g
  g = (Cd * ρ * A * v^2)/2m
2mg = Cd * ρ * A * v^2
v^2 = (2mg)/(Cd * ρ * A)
  v = sqrt((2mg)/(Cd * ρ * A))
```



# Objects and Planets

In an effort to demonstrate how different objects fall in different gravitational environments, I added the ability to change the object and the planet for the simulation. The mathematical model is robust enough to simply update some of the constants when the objects and planets are changed. Introducing this functionality helps learners understand the impact of individual variables on the system. 

A few examples:
- The basketball and the balloon are quite similar except for their mass. They behave the same in a vacuum, but very differently when there's air.
- Earth and Venus have a similar gravitation acceleration constant, but the atmospheric density is very different. This has a significant impact on how objects fall. 
- The sun and the moon have low atmospheric densities (fluid density). Objects falling there behave very similar to how they would in a vacuum.

## Objects
Changing the object changes the drag coefficient, surface area, and mass. 

sphere
```
dragCoefficient: 0.5
surfaceArea: 2
mass: 40
```

basketball
```
dragCoefficient: 0.5
surfaceArea: Math.PI * .119 * .119
mass: .68
```

balloon
```
dragCoefficient: 0.5
surfaceArea: Math.PI * .119 * .119
mass: .04
```

parachuter
```
dragCoefficient: 1
surfaceArea: 1.06 
mass: 90
```

## Planets
Changing the planet/moon changes the gravitational acceleration and atmospheric density.

Earth
```
gravitationalAcceleration: 9.81
fluidDensity: 1.23
```

the moon
```
gravitationalAcceleration: 1.6
fluidDensity: 0
```

Mars
```
gravitationalAcceleration: 3.7
fluidDensity: 0.020
```

Venus
```
gravitationalAcceleration: 8.87
fluidDensity: 65
```

the sun
```
gravitationalAcceleration: 275
fluidDensity: 0.0001
```

[Planet images by brgfx]("https://www.freepik.com/free-vector/planets-galaxy_4228290.htm#query=solar%20system%20planets&position=14&from_view=keyword&track=ais") on Freepik


# Future Plans / Notes

## Technology
This simulation uses [Phaser](https://phaser.io/). I consider Phaser a decent option for building out HTML interactives. 

## Alternate Model
This model uses complex equations to calculate acceleration, velocity, and position over time. This solution is great for ensuring that values should be accurate and limits the possibility of compounded inaccuracies in the data. 

That being said, I would like to try another model that approximates the values for acceleration, velocity, and position based on small deltas in time and approximating integration using an iterative method. This approach could be vulnerable to inaccuracies, particularly with slower computers where the time deltas were longer between game loop updates. 

## Y Orientation
The Y orientation of Phaser being positive in the down direction and the fact that the equations for computing acceleration, velocity, and position assume the 'down' gravity direction is positive created some complexity with regard to Y orientation. I could have done a better job abstracting the Y orientation so the values were as I expected in the simulation and were only adjusted as needed for display and working with the equations.

## Height / Time Scaling and Starting Height
The model is programmed to support the ability to set the scale meters per pixel and set the initial height. This could be exposed to the user to allow them to change these values for their simulation.

Additionally, it would be nice to allow users to set the timescale to speed up and slow down slower and quicker simulation runs. 

## Download Data
After a run of the simulation has completed, the Play / Pause button turns to a Download button. This is not implemented, but users would be able to download a .csv containing the positional data of the simulation over time. 

It would record time, acceleration, velocity, and height for several instants throughout the simulation. After the simulation ends, the user would be able to click the Download button to download a .csv of the data. Users would be able to open the data in Excel, create graphs, and work with it for a class lab.

## Skydiver
It would be fun to have the skydiver open their chute as they get closer to the ground. This would affect the Drag coefficient and the Surface area and help users understand how these specific variables impact the behavior. 

