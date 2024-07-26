const oneHourInMilliseconds = 60 * 60 * 1000;


class StatusEffect {
    //Time in milliseconds
    constructor(name, totalChange, maxHours, startTime = -1) {
        this.name = name;
        this.totalChange = totalChange;
        this.maxHours = maxHours;
        if(startTime === -1) startTime = Date.now();
        this.startTime = startTime;
    }   
    getScoreReduction(currentTime) {
        //This shouldn't happen
        if (currentTime < this.startTime) return 0;
        
        //Delete the statusEffect
        if (currentTime > this.startTime + this.maxHours * oneHourInMilliseconds) {
            console.log("Status Effect: " + this.name);
            console.log("Score Reduction: " + this.totalChange);
            return this.totalChange;
        }
        const elapsedTime = currentTime - this.startTime;
        
        // Calculate the elapsed hours considering the loss rate
        const elapsedHours = elapsedTime / oneHourInMilliseconds;
        const scoreReduction = this.totalChange * elapsedHours / this.maxHours;
        // Print name of status effect
        console.log("Status Effect: " + this.name);
        console.log("Score Reduction: " + scoreReduction);
        this.startTime = currentTime;
        return scoreReduction;
    }

    isActive(currentDate) {
        if(currentDate < this.startTime + this.maxHours * oneHourInMilliseconds){
            if(currentDate >= this.startTime) return true;
        }
        return false;
    }
}

class CowPlayer {
    constructor(name, score, statusEffects = []) {  
        this.name = name;
        this.score = score;
        this.statusEffects = statusEffects;
    }

    static fromLocalStorage(key) {
        let data = localStorage.getItem(key);
        if (data === null) return null;
        let parsedData = JSON.parse(data);

        // Construct StatusEffect instances from the parsed data
        let statusEffects = parsedData.statusEffects.map(effectData => 
            new StatusEffect(effectData.name, effectData.totalChange, effectData.maxHours, effectData.time)
        );
        
        return new CowPlayer(parsedData.name, parsedData.score, statusEffects);
    }

    hasEffect(effectName) {
        return this.statusEffects.some(effect => effect.name === effectName);
    }

    addEffect(effect) {
        if (!this.hasEffect(effect.name)) {
            this.statusEffects.push(effect);
        }
    }

    removeEffect(effectName) {
        this.statusEffects = this.statusEffects.filter(effect => effect.name !== effectName);
    }

    applyEffect(effect) {
        console.log("Total Loss: " + effect.totalLoss)
        let currentDate = Date.now();
        let diffInMs = currentDate - effect.lastDate;
        let diffInHours = diffInMs / 1000 / 60 / 60;
        let activeHours = 0;
        let savedActiveHours = effect.activeHours;

        activeHours = effect.activeHours + diffInHours;

        if (activeHours > effect.maxHours) {
            diffInHours = effect.maxHours - savedActiveHours;
            this.removeEffect(effect.name);
        }

        this.score -= diffInHours/effect.maxHours * effect.totalLoss;
        if(this.score <= 1) {
            this.score = 0;
            this.removeEffect(effect.name);
        }
        else{
            effect.activeHours = activeHours;
        }
        
        savePlayer(this);
    }


    applyAllEffects(currentDate) {
            let totalScoreChangeRatio = 0;
            this.statusEffects.forEach(statusEffect => {
                totalScoreChangeRatio += statusEffect.getScoreReduction(currentDate);
                if(!statusEffect.isActive(currentDate)){
                    this.removeEffect(statusEffect.name);
                }
            });
            this.score = this.score * (1 + totalScoreChangeRatio);
            savePlayer(this);
            return totalScoreChangeRatio;
        }
    }

function getStatusEffectByName(name) {
    return PRESET_STATUS_EFFECTS.find(effect => effect.name === name);
}

const PRESET_STATUS_EFFECTS = [
    new StatusEffect('Drunk', -0.1, 0.1, 0), 
    new StatusEffect('Fire', -0.5, 0.3, 0), 
];

let players = [];

function saveInputToLocalStorage(key, id) {
    localStorage.setItem(key, document.getElementById(id).value);
}

function retrieveFromLocalStorage(key) {
    return localStorage.getItem(key);
}

function loadPlayers() {
    players = [];
    let playerTablesDiv = document.getElementById('playerTables');
    playerTablesDiv.innerHTML = '';
    let playerCount = localStorage.length;
    for (let i = 0; i < playerCount; i++) {
        let key = localStorage.key(i);
        if(key == 'LastDate') continue;
        let player = CowPlayer.fromLocalStorage(key)
        players.push(player);
        displayPlayer(player, key);
    }
}

function savePlayer(player) {
    localStorage.setItem(player.name, JSON.stringify(player));
}

function savePlayers(players) {
    players.forEach((player, index) => {
        savePlayer(player, index);
    });
}

function addPlayer(name) {
    players.push(new CowPlayer(name, 0));
    savePlayers(players);
    loadPlayers();
}

function deletePlayer(key) {
    localStorage.removeItem(key);
    loadPlayers();
}

function updateScore(key, newScore) {
    let player = CowPlayer.fromLocalStorage(key);
    player.applyAllEffects(Date.now());
    player.score = newScore;
    savePlayer(player);
    loadPlayers();
}

function addScore(key, score) {
    let player = CowPlayer.fromLocalStorage(key);
    score = parseFloat(score);
    playerScore = parseFloat(player.score);

    playerScore += score;
    player.score = playerScore;
    savePlayer(player);
    loadPlayers();
}

function updateAllTimeFields() {
    players.forEach(player => {
        player.applyAllEffects(Date.now());
    });
    console.log(players[0].statusEffects);
    savePlayers(players);
    loadPlayers();
}

function addButton(parent, name, callback) {
    let tableRow = document.createElement('tr');
    let button = document.createElement('button');
    button.classList.add('button');
    button.textContent = name;
    button.addEventListener('click', callback);
    tableRow.appendChild(button);
    parent.appendChild(tableRow);

}

//Might need to change the system so the entire set of players isn't loaded everytime something changes
//Add a modify player function not just displayPlayer, creating a whole new page.

function displayPlayer(player, key) {
    
    let baseTable = document.createElement('table');
    baseTable.classList.add('base-table');

    let playerTable = document.createElement('table');

    let nameRow = document.createElement('tr');
    let nameValue = document.createElement('td');
    nameValue.appendChild(document.createTextNode(player.name));
    nameRow.appendChild(nameValue);

    let scoreRow = document.createElement('tr');
    let scoreValue = document.createElement('td');
    scoreValue.appendChild(document.createTextNode(Math.round(player.score)));
    scoreRow.appendChild(scoreValue);

    let addInput = document.createElement('input');
    addInput.classList.add('text-input');
    addInput.id = key + '_score';
    addInput.type = "number";
    addInput.onchange = function () {
        addScore(key, addInput.value);
    }

    let addRow = document.createElement('tr');
    addRow.appendChild(addInput);

    playerTable.appendChild(nameRow);
    playerTable.appendChild(scoreRow);
    playerTable.appendChild(addRow);

    let buttonTable = document.createElement('table');
    buttonTable.classList.add('button-table');

    addButton(buttonTable, 'Church', () => {
        player.applyAllEffects(Date.now());
        updateScore(key, player.score * 2); 
        player.drunk = false; 
        player.fire = false;})
    addButton(buttonTable, 'Graveyard', () => {
        player.applyAllEffects(Date.now());
        updateScore(key, player.score / 2);
    })
    PRESET_STATUS_EFFECTS.forEach(effect => {
        addButton(buttonTable, effect.name, () => {
            if (player.hasEffect(effect.name)) {
                player.removeEffect(effect.name);
            } else if(player.score > 0) {
  
                // It's important not to directly push Effect as that would lead all players sharing same status instance.
                let clonedStatus = new StatusEffect(
                        effect.name,
                        effect.totalChange,
                        effect.maxHours,
                        Date.now(),)
                player.addEffect(clonedStatus);
            }
            updateAllTimeFields();
        });
        let effectRow = document.createElement('tr');
        let effectValue = document.createElement('td');
        if (player.hasEffect(effect.name)) {
            effectValue.appendChild(document.createTextNode(effect.name + ": " + 'Yes'));
        }
        else{
            effectValue.appendChild(document.createTextNode(effect.name + ": " + 'No'));
        }
        effectRow.appendChild(effectValue);
        
       playerTable.appendChild(effectRow); 
    });

    
    addButton(buttonTable, 'Delete', () => {
        var result = confirm("Are you sure you want to delete? " + player.name);
        if (result) deletePlayer(key);
    })



    let playerTablesDiv = document.getElementById('playerTables');
    let playerTd = document.createElement('td');
    playerTd.appendChild(playerTable);
    buttonTd = document.createElement('td');
    buttonTd.appendChild(buttonTable);
    baseTable.appendChild(playerTd);
    baseTable.appendChild(buttonTd);

    playerTablesDiv.appendChild(baseTable);

}
// const intervalId = setInterval(updateAllTimeFields, 1000);
loadPlayers();
updateAllTimeFields();


