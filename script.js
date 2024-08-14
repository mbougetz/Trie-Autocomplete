document.addEventListener('DOMContentLoaded', function() {
    //get user dictionary from localstorage if it exists

    //Instantiate trie
    let root_node = new Node();
    let trie = new Trie(root_node);

    //Set correct path to dictionary based on environment
    const repo_name = "/Trie-Autocomplete";
    const dictionary_path = "/default_dictionary.txt";
    let isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    //then read in the default and user created dictionaries

    //Retrieve the default dictionary
    fetch(isLocal ? dictionary_path : repo_name + dictionary_path)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response error!");
        }
        return response.text();
    })
    .then(text => {
        //Read the dictionary line by line into the trie
        processLines(text, trie);
    })
    .catch(error => {
        console.error("Problem fetching dictionary: ", error);
    });


    //Characters to ignore displaying suggestions after
    let null_chars = [" "];

    //Render suggestions on each keystroke
    let input = document.getElementById("input_box");
    let suggestions_box = document.getElementById("autocomplete-list");
    input.addEventListener("input", function() {
        //Casts input to all lowercase
        let prefix = getCurrPrefix(this.value.toLowerCase()); //!!!!!!! Case matching error preventing proper nouns from being retrieved
        let lastChar = this.value[this.value.length - 1];

        //Hide the box if no prefix exists or if space has been pressed, else show
        if(lastChar == " " || prefix.length == 0) suggestions_box.style.display = 'none';
        else suggestions_box.style.display = 'block';

        //Display as long as there is a prefix and space was not the last char pressed
        if(!null_chars.includes(lastChar) && prefix.length > 0){
            let suggestions = trie.getSuggestions(prefix);

            //Map each retrieved suggestion into the html of the suggestion dropdown
            suggestions_box.innerHTML = suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');

            //Display the dropdown
            suggestions_box.style.display = 'block';

            //Position the suggestions dropdown under the current prefix
            positionSuggestions(suggestions);

            //Add event listeners to suggestion items
            Array.from(suggestions_box.getElementsByClassName('suggestion-item')).forEach(item => {
                //Allow the user to click on suggestions to replace the current prefix
                item.addEventListener('click', () => {
                    //Replace prefix
                    input.value = replacePrefix(input.value, item.textContent);

                    //Hide the dropdown
                    suggestions_box.style.display = 'none';

                    //Refocus on the text box
                    input.focus();
                });
            });

        }

    });

    //Returns the text with the last word replaced
    //!!!!! This doesn't account for going back in the input box and typing in the middle of the existing string
    function replacePrefix(text, replacement){
        let words = text.split(" ");

        if(words.length > 0){
            words[words.length - 1] = replacement;
            return words.join(" ");

        } else return text;

    }

    //Positions the suggestion dropdown appropriately
    function positionSuggestions(suggestions) {
        let input = document.getElementById("input_box");

        //Gets the pixel width of the longest returned suggestion
        let max_suggestion_width = 0; //Actually have this be the width of the "add to dictionary" button text later!!!!!!
        for(let sugg of suggestions){
            let curr_width = getTextWidth(sugg);
            if(curr_width > max_suggestion_width) max_suggestion_width = curr_width;
        }

        //Align the dropdown with the start of the current prefix but one line downwards:

        //Retrieve the x,y position in pixels of the textarea's caret
        let caret_pos = getCaretPosition();

        //Set top coord to current caret y coord + the height of the current line
        suggestions_box.style.top = `${caret_pos[1] + getLineHeight()}px`;

        //Set left coord to current caret x coord - the width of the word currently being typed
        suggestions_box.style.left = `${caret_pos[0] - getTextWidth(getCurrPrefix(input.value))}px`;

        //Set width to be the maximum width of the retrieved suggestions
        suggestions_box.style.width = `${max_suggestion_width}px`;
    }
});


//Returns the pixel width of an input string
function getTextWidth(text, font = '16px Arial') {
    //Create a temporary canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    //Set the font style for the context
    context.font = font;

    //Measure the width of the text
    const width = context.measureText(text).width;


    canvas.remove();

    return width;
}

//Takes an input string and returns the last individual word
function getCurrPrefix(text){
    //Remove excess whitespace
    text = text.trim();

    //Add words split around the space character to an array
    let words = text.split(/\s+/);

    //Return the last word of the input string
    return words[words.length - 1];
}

//Loads an input string line by line into the trie
function processLines(text, trie) {
    //Store individual lines in an array
    const lines = text.split('\n');
    lines.forEach(line => {
        //Remove whitespace
        const trimmedLine = line.trim();

        //Ignore empty lines
        if (trimmedLine) trie.insert_string(trie.root, trimmedLine);

    });
}