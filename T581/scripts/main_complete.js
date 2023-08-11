
// Once you understand how this works, do the following:
//   - create a variable that will allow you to set the maximum number the user will guess
//   - create an array that will save the wizards guesses so they don't repeat
function startWizard() {

    // create a varible to hold the user's response
    let userResponse;
    let maxGuess = 9;
    let guesses  = [];

    // the wizard introduces themself
    alert("I am an amazing mind reading wizard. I can guess the number you're thinking of.")
    
    // ask the user for a number between 1 and maxGuess
    alert("Think of a number between 1 and " + maxGuess);

    // loop while the user's response is not 'y'
    while (userResponse != 'y') {

        // pick a guess
        let nextGuess = Math.floor(Math.random() * maxGuess) + 1;
        console.log(nextGuess);

        // generate next guesses until they're not in the array
        while (guesses.indexOf(nextGuess) >= 0) {
            nextGuess = Math.floor(Math.random() * maxGuess) + 1;
        }

        // add guess to list
        guesses.push(nextGuess);
        console.log("Guesses:" + guesses);

        // pick a random number between 1 and maxGuess
        // ask the user if that's their number
        // their response y / n gets put in userResponse
        userResponse = prompt("Is your number: " + nextGuess + "? (y/n)");
    }

    // the only way to get here is if the user has input 'y', so the wizard has guessed the number
    alert("I told you I could read your mind!");
}


