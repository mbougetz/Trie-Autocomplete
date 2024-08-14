//Max number of autocomplete suggestions to retrieve
const MAX_SUGGESTIONS = 4;

//Basic node class for storing characters
class Node{
    constructor(){
        this.children = new Map();
        this.is_word_end = false;
    }
}

//Trie data structure
class Trie{
    //Constructs the trie by defining a root node
    constructor(root_node){
        this.root = root_node;
    }

    //Inserts a string into the trie starting at the indicated node
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

    //Returns an array of length <= MAX_SUGGESTIONS of dictionary suggestions based on the current prefix
    getSuggestions(prefix) {
        const results = [];
        const queue = [];

        //Track number of previously retrieved nodes
        let words_retrieved = 0;

        //Start with the node corresponding to the last character of the prefix
        let node = this.root;

        //Ensure the current prefix actually exists in the trie
        for (const char of prefix) {
            //Return an empty suggestion list if not
            if (!node.children.has(char)) return results; //!!!!!! case matching is stopping proper nouns from being retrieved!
            node = node.children.get(char); //!!!!! Also here
        }

        //Enqueue the node of the last char of the prefix
        //path: tracks the complete string from the beginning of the prefix all the way to the currently traversed node
        queue.push({ node, path: prefix });

        //BFS search for suggestions
        while (queue.length > 0 && words_retrieved < MAX_SUGGESTIONS) {
            const { node, path } = queue.shift();

            //If the current node marks the end of a word and the suggestion isn't just the prefix itself, add that word
            if (node.is_word_end && path != prefix) { //!!!! Case matching also possibly here
                //Add current word to the results array
                results.push(path);

                //Increment the counter of suggestions retrieved
                words_retrieved++;

                //Cease the search if MAX_SUGGESTIONS number of suggestions have been retrieved
                if (words_retrieved >= MAX_SUGGESTIONS) break;
            }

            //Enqueue children nodes
            node.children.forEach((child_node, char) => {
                queue.push({ node: child_node, path: path + char });
            });
        }

        //Sort results by length to prioritize words of a length closer to that of the prefix
        return results.sort((a, b) => a.length - b.length);
    }

}