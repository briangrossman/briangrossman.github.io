// Get the article
theArticle = document.querySelector("article#theArticle");

// set var to detect if user started dragging
isSelecting = false;

// assume user started selecting when mousedown in the article
theArticle.addEventListener('mousedown', e => {
    // started highlighting text (mousedown in the article)
    isSelecting = true;
});

// detect when any mouseup happens in the document
// note: that it's possible to start a drag in the article and end it outside
document.addEventListener('mouseup', e => {
    // check if selecting
    if (isSelecting) {
        // user had started a drag

        // reset isSeleting
        isSelecting = false;

        // check if any text has been highlighted
        if (window.getSelection()) {
            // save the selected text
            selectedText = window.getSelection().toString();

            // ensure there's text in there
            if (selectedText.trim() != '') {
                // create a new notecard with the text
                newNotecard = document.createElement("div");

                // give it a class notecard
                newNotecard.classList.add("notecard")

                // set the text to selectedText
                newNotecard.innerHTML = selectedText;

                // add notecard to the notecards section
                document.querySelector("#notecards").appendChild(newNotecard);
            }
        }
    }
});
