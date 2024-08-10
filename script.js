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

    //Get suggestions on keystroke
    let input = document.getElementById("input_box");
    let suggestions_box = document.getElementById("autocomplete-list");
    input.addEventListener("input", function() {
        //Casts input to all lowercase
        let prefix = getCurrPrefix(this.value.toLowerCase());
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
            positionSuggestions();

            //Add event listeners to suggestion items
            Array.from(suggestions_box.getElementsByClassName('suggestion-item')).forEach(item => {
                //Allow the user to click on suggestions to replace the current prefix
                item.addEventListener('click', () => {
                    //Replace prefix
                    input.value = input.value.replace(new RegExp(`${prefix}\\b`), item.textContent);

                    //Hide the dropdown
                    suggestions_box.style.display = 'none';

                    //Refocus on the text box
                    input.focus();
                });
            });

        }

    });

    //Positions the suggestion dropdown appropriately
    function positionSuggestions() {
        const rect = input.getBoundingClientRect();
        const cursorPosition = input.selectionStart;

        //Splits lines around newline character
        const lines = input.value.substr(0, cursorPosition).split('\n');

        //Gets last line
        const line = lines[lines.length - 1];

        //Define the dimensions and position of the dropdown
        const lineRect = {
            //top: rect.top + input.scrollTop + (input.clientHeight / lines.length) * (lines.length - 1),
            top: input.scrollTop,
            //left: rect.left + input.scrollLeft,
            left: rect.left + cursorPosition * 8,
            width: input.clientWidth 
            //!!!!!!!!!!!!!!!!!! Have autosuggest box as wide as the widest of the suggestions according to current font
        };
    
        //Sets dropdown position within the page
        //suggestions_box.style.top = `${lineRect.top + parseInt(window.getComputedStyle(input).lineHeight, 10)}px`;
        //!!!!!!!!! Magic number bad! Need to get height of current font, multiply by the number of current lines in input, and add to top styling
        suggestions_box.style.top = `${lineRect.top + 35}px`;
        suggestions_box.style.left = `${lineRect.left}px`;
        suggestions_box.style.width = `${lineRect.width}px`;
    }


});

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