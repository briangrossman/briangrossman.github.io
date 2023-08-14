# Note

The folder `FreeFallAlternate/` contains an alternate version of the simulation. It was completed after the simulation in `FreeFall/` to explore the viability of using an iterative approach to calculating acceleration, velocity, and position without relying on complicated equations. It seems to do a fairly comparable job to the original version though is susceptible to issues, particularly with computers with less processing power available.

For the details about the simulation, view the [README](https://github.com/briangrossman/briangrossman.github.io/blob/main/FreeFall/README.md) in `FreeFall/`. See below for specifics related to this alternate version below.


# The Simulation
- This alternate version of the simulation can be accessed at [https://briangrossman.github.io/FreeFallAlternate/](https://briangrossman.github.io/FreeFallAlternate/)
- The original version can be accessed at [https://briangrossman.github.io/FreeFall/](https://briangrossman.github.io/FreeFall/)

# The Model - Alternate

This model uses the [Riemann sum](https://en.wikipedia.org/wiki/Riemann_sum#Trapezoidal_rule) method (specifically the trapezoidal rule) for calculating velocity from acceleration and position from velocity given that they are integrals. 


## Movement in a vacuum

This case is simpler because the acceleration is constant. It's always `-g`.
```
a = -g
```
Using that, we can calculate a new velocity by adding the little bit of change in velocity that occured during the small time interval (since the last time we updated the velocity) to the current velocity.
```
v(new) = v(curr) + (a * dt)
``` 

Calculating the position is a little tricker. When we last updated the values, our velocity was v(curr). But now, the velocity is v(new). So over the course of this time slice, the velocity has changed. In order to estimate how much the position changed, we can use an estimate somewhere between the two velocities using the trapezoid rule for the Reimann sum.
```
y(new) = y(curr) + (0.5 * (v(new) + v(curr)) * dt)
```

This approach does a fairly good job estimating. 

## Movement with air

The case where there's air ends up being more complicated, specifically because acceleration and velocity are intertwined. Unlike the vacuum case, it's not trivial to get the new acceleration because it's dependent on the new velocity, which, in turn, is dependent on the new acceleration. Fortunately, I was able to devise a method of estimating that seems to do a decent job taking things into account. 

The first thing I do, is calculate a v(new) using a(curr). This is similar to using the left rule of the Reimann sum. It is likely a slight underestimate for the acceleration.

```
v(new) = v(curr) + (a(curr) * dt)
```

Once I have the new velocity, I can plug it into the equation for acceleration to get a(new):
```
Recall: Acceleration = (b * v^2)/m - g; where b is 1/2 * Cd * ρ * A

a(new) = ((b * v(new) * v(new)) / m) - g
```

Now that I have an updated acceleration, I can then reestimate velocity using the trapezoid rule of the Riemann sum to get a slightly better estimate for v(new).

```
v(new) = v(curr) + (0.5 * (a(curr) + a(new)) * dt)
```

And then, I can use the new velocity to calculate a new position, again using the trapezoid rule.

```
y(new) = y(curr) + (0.5 * (v(curr) + v(new)) * dt)
```

Run the simulations side by side to see how they compare. 