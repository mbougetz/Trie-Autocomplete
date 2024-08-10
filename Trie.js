//Max number of autocomplete suggestions to retrieve
const MAX_SUGGESTIONS = 4;

//Basic node class for storing characters
class Node{
    constructor(){
        this.children = new Map();
        this.is_word_end = false;
    }
}

//Global counter for number of suggestions retrieved in one pass
let words_retrieved = 0;
class Trie{
    constructor(root_node){
        this.root = root_node;
    }

    insert_string(curr_node, word){
        if(word.length > 0){
            let next_node;

            //Create and attach new node if it doesn't exist in the map
            if(!curr_node.children.has(word[0])){
                next_node = new Node();
                curr_node.children.set(word[0], next_node);
            
            //Else get the existing node in the map
            } else next_node = curr_node.children.get(word[0]);

            //If last char, mark corresponding node as the end of the string
            if(word.length == 1) next_node.is_word_end = true;

            //Recurse on the next node
            this.insert_string(next_node, word.slice(1));
        }
    }

    //Returns the top MAX_SUGGESTIONS number of words after the given prefix in the dictionary
    getSuggestions(prefix) {
        //Reset counter of words already retrieved
        words_retrieved = 0;

        //Ensure prefix exists in trie before searching for suggestions
        let node = this.root;
        for (let char of prefix) {
            //No suggestions if prefix is not found
            if (!node.children.get(char)) return []; 
            
            node = node.children.get(char);
        }
        return this.findWords(node, prefix);
    }

    
    //Helper method to find all words under a given node
    findWords(node, prefix) {
        const words = [];

        //Only traverse further if less than the max allowed number of suggestions have already been retrieved
        if(words_retrieved < MAX_SUGGESTIONS){
            //Add to suggestions list if current char marks the end of a word
            if (node.is_word_end) {
                //Increment counter of words already retrieved
                words_retrieved++;
                words.push(prefix);
            }
            //DFS traverse to children via recursion
            for (let char in node.children) {
                words.push(...this.findWords(node.children.get(char), prefix + char));
            }
        }

        return words;
    }
}