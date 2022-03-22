
// Once you understand how this works, do the following:
//   - create a variable that will allow you to set the maximum number the user will guess
//   - create an array that will save the wizards guesses so they don't repeat

function startWizard() {

    // create a varible to hold the user's response
    let userResponse;

    // the wizard introduces themself
    alert("I am a mind reading wizard. I can guess the number you're thinking of.")
    
    // ask the user for a number between 1 and 5
    alert("Think of a number between 1 and 5");

    // loop while the user's response is not 'y'
    while (userResponse != 'y') {

        // pick a random number between 1 and 5
        // ask the user if that's their number
        // their response y / n gets put in userResponse
        userResponse = prompt("Is your number: " + (Math.floor(Math.random() * 5) + 1) + "? (y/n)");
    }

    // the only way to get here is if the user has input 'y', so the wizard has guessed the number
    alert("I told you I could read your mind!");
}


