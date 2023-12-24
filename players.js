var numPlayers = 10;  // Set as desired number of players

for (var i = 1; i <= numPlayers; i++) {
    var div = document.createElement('div');
    div.id = "Player" + i;

    var input = document.createElement('input');
    input.type = 'number';
    input.id = 'score' + i;

    div.appendChild(input);

    // append the player div to the parent div
    document.getElementById('players').appendChild(div);
}


class CowPlayer {
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }


    static fromLocalStorage(key) {
        let data = localStorage.getItem(key);
        if (data === null) return null; 
        let parsedData = JSON.parse(data);
        return new CowPlayer(parsedData.name, parsedData.score);
    }
}