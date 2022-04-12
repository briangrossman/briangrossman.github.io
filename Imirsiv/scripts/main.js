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
                newNotecard.classList.add("notecard");

                // add draggable class
                newNotecard.classList.add("draggable");

                // set the text to selectedText
                newNotecard.innerHTML = selectedText;

                // add handler for drag and drop
                newNotecard.addEventListener('mousedown', mouseDownDragHandler);

                // add notecard to the notecards section
                document.querySelector("#notecards").appendChild(newNotecard);

            }
        }
    }
});

// drag and drop code - used code here: https://htmldom.dev/drag-and-drop-element-in-a-list/

// The current dragging item
let draggingEle;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;
let z = 10;

const mouseDownDragHandler = function (e) {
    draggingEle = e.target;

    // Calculate the mouse position
    const rect = draggingEle.getBoundingClientRect();
    x = e.pageX - rect.left;
    y = e.pageY - rect.top;

    // set to absolute positioning
    draggingEle.style.position = 'absolute';

    // increment z and put item on top
    z++;
    draggingEle.style.zIndex = z;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveDragHandler);
    document.addEventListener('mouseup', mouseUpDragHandler);
};

const mouseMoveDragHandler = function (e) {
    // Set position for dragging element
    draggingEle.style.top = `${e.pageY - y}px`;
    draggingEle.style.left = `${e.pageX - x}px`;
};

const mouseUpDragHandler = function() {
    //clone element to remove all the event listeners
    var old_element = draggingEle;
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);

    // add mousedown listener
    new_element.addEventListener('mousedown', mouseDownDragHandler);
};
