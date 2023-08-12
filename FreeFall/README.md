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

###

# The Model

An ideal solution would be to find equations for accelleration, velocity, and position as a function of time. With this solution, you can track everything you need to know about an object simply by knowing the time that is has been falling. The math for the vacuum case, is relatively straight forward, the the math for the system with air resistance proves to be rather complex. I initially did some research (videos, papers, and AP Physics lessons) and found [someone who had managed to create equations](https://philosophicalmath.wordpress.com/2017/10/21/terminal-velocity-derivation/) for acceleration, velocity, and position (in the y direction) with air resistance.


## Movement in a vacuum

```
Acceleration: a = -g
    Velocity: v = v0 - gt 
    Position: y = y0 - (v0 * t) - (g * t^2)/2
```

## Movement with air

```
First find an equation for acceleration using the ubiquitous `F = ma`. For this system, we will assume all movement is linear in the `y` direction, so the total force is the sum of the force vectors due to gravity (down) and air resistance/drag (up). 

F(total_y) = F(drag) - F(gravity)

F(gravity) = mg
-   m: mass
-   g: gravitational acceleration (9.8 m / s^2)

F(drag) = 1/2 * Cd * ρ * A * v^2
-  Cd: drag coefficient; made up of skin friction and form drag
-   ρ: the density of the air/fluid 
-   A: the area of the surface that is facing the fluid as the object moves
- v^2: the square of the velocity

Note that as the magnitude of the drag force is proportional to the square of the speed. As the object falls faster, the drag force increases. This is why objects will approach a terminal velocity as the drag force approaches the force due to gravity, resulting in an infinitesimal net force and therefore an acceleration that approaches zero. An acceleration of zero results in a constant speed--the terminal velocity.

Solving for acceleration:

F(total_y) = ma
        ma = F(drag) - F(gravity)
        ma = (Cd * ρ * A * v^2)/2 - mg
         a = (Cd * ρ * A * v^2)/2m - g

This article: https://philosophicalmath.wordpress.com/2017/10/21/terminal-velocity-derivation/describes how to integrate the acceleration to get equations for v(t) and y(t). The equations are:

Set b to (Cd * ρ * A)/2, i.e. the constants in the drag force. 

   a = (Cd * ρ * A * v^2)/2m - g
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