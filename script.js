document.addEventListener('DOMContentLoaded', function() {
    //get user dictionary from localstorage if it exists

    //Instantiate trie, then read in the default and user created dictionaries


    //Get suggestions on keystroke
    let input = document.getElementById("input_box");
    input.addEventListener("input", function() {
        console.log(this.value);




    });
});