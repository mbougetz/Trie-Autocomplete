//Pain beyond comprehension
function getLineHeight() {
    const textarea = document.getElementById('input_box');
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = computedStyle.lineHeight;
    const fontSize = parseFloat(computedStyle.fontSize);

    //Handle the "normal" case
    if (lineHeight === 'normal') {
        //Using an approximation for "normal" line height
        return fontSize * 1.2;
    }

    //If lineHeight is given in pixels or other units, parse it
    const numericValue = Math.ceil(parseFloat(lineHeight));
    return isNaN(numericValue) ? 0 : numericValue;
}

//Creates a hidden canvas element to simulate the text wrapping of the textarea and then find the coordinates
function getCaretPosition() {
    //Get properties of textarea to apply to the cavas
    const textarea = document.getElementById('input_box');
    const caretPos = textarea.selectionStart;
    const text = textarea.value;
    const lineHeight = getLineHeight();
    const padding = parseInt(window.getComputedStyle(textarea).paddingLeft, 10);
    const borderLeftWidth = parseInt(window.getComputedStyle(textarea).borderLeftWidth, 10);
    const borderTopWidth = parseInt(window.getComputedStyle(textarea).borderTopWidth, 10);
    const font = window.getComputedStyle(textarea).font;

    //Create canvas to simulate textarea's text wrapping
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;

    //Measure textarea width (excluding padding)
    const textareaWidth = textarea.clientWidth - padding * 2;

    //Split the text into lines and handle wrapping
    let lines = [];
    let currentLine = '';
    let startIndex = 0;
    for (let i = 0; i < text.length; i++) {
        currentLine += text[i];
        const textWidth = context.measureText(currentLine).width;
        if (text[i] === '\n' || textWidth > textareaWidth) {
            // Wrap text if it exceeds textarea width
            if (textWidth > textareaWidth) {
                let spaceIndex = currentLine.lastIndexOf(' ');
                if (spaceIndex === -1) spaceIndex = currentLine.length;
                lines.push(currentLine.substring(0, spaceIndex).trim());
                currentLine = currentLine.substring(spaceIndex).trim();
            } else {
                lines.push(currentLine.trim());
                currentLine = '';
            }
        }
    }
    if (currentLine) lines.push(currentLine.trim());

    // Determine the line and position of the caret
    let lineIndex = 0;
    let charOffset = caretPos;
    let lineStartIndex = 0;
    let currentLineWidth = 0;

    for (let i = 0; i < lines.length; i++) {
        if (charOffset <= lines[i].length) {
            lineIndex = i;
            currentLineWidth = context.measureText(lines[lineIndex].substring(0, charOffset)).width;
            break;
        }
        //Account for newline character
        charOffset -= lines[i].length + 1;
        lineStartIndex += lines[i].length + 1;
    }

    //Calculate and adjust for scroll positions
    const caretXPos = currentLineWidth + padding + borderLeftWidth - textarea.scrollLeft;
    const caretYPos = lineIndex * lineHeight + padding + borderTopWidth - textarea.scrollTop;

    //Return the positions
    let results = [caretXPos, caretYPos];
    return results;
}