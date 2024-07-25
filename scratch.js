class Deque {
    constructor() {
        this.items = [];
    }

    append(item) {
        this.items.push(item);
    }

    *[Symbol.iterator]() {
        for (let item of this.items) {
            yield item;
        }
    }
}

// Structure for a health change: {time: ..., change: ...}
const health_modifications = new Deque();

function modifyHealth(time, change) {
    health_modifications.append({time: time, change: change});
}

function calculateBaseHealth(initial_health, current_time) {
    let base_health = initial_health;
    for (let modification of health_modifications) {
        if (modification.time <= current_time) {
            base_health += modification.change;
        } else {
            break;
        }
    }
    return base_health;
}

function calculateHealthAtTime(initial_health, current_time, status_list) {
    // Step 1: Calculate the current base health
    const current_base_health = calculateBaseHealth(initial_health, current_time);

    // Step 2: Calculate the total health lost due to statuses
    let total_health_lost = 0.0;

    for (let status of status_list) {
        const start_time = status.start_time;
        const end_time = status.end_time;
        const percentage_loss = status.percentage;
        const length_seconds = status.length_min * 60.0;  // Convert minutes to seconds
        if (start_time <= current_time) {
            const effective_end_time = Math.min(current_time, end_time);
            const elapsed_seconds = effective_end_time - start_time;
            if (elapsed_seconds > 0) {
                const health_lost_due_to_status = (current_base_health * (percentage_loss / 100)) * (elapsed_seconds / length_seconds);
                total_health_lost += health_lost_due_to_status;
            }
        }
    }

    // Step 3: Calculate the final health considering status effects
    const current_health = current_base_health - total_health_lost;
    return Math.max(current_health, 0);  // health can't be less than 0
}

// Usage Example:
const initial_health = 1000;  // Example starting health
const status_list = [
    {name: 'on_fire', start_time: 0, end_time: 60, percentage: 10, length_min: 1},
    {name: 'poison', start_time: 30, end_time: 90, percentage: 5, length_min: 1}
];

// Simulate health modifications
modifyHealth(10, -50);  // Health reduced by 50 at time 10
modifyHealth(20, 100);  // Health increased by 100 at time 20

const current_time = 60;  // Example current time in seconds
const current_health = calculateHealthAtTime(initial_health, current_time, status_list);

console.log(`Current Health at time ${current_time}: ${current_health}`);



class StatusEffect {
    constructor(name, lossRate, maxHours, startDate = 0, endDate = 0) {
        this.name = name;
        this.lossRate = lossRate;
        this.maxHours = maxHours;
        this.oneHourInMilliseconds = 60 * 60 * 1000;
        
        if (startDate === 0) this.startDate = Date.now();
        else this.startDate = startDate;

        if (endDate === 0) this.endDate = this.startDate + (maxHours * this.oneHourInMilliseconds);
        else this.endDate = endDate;
    }
}

function applyStatusEffect(currentScore, currentDate, statusEffect) {
    // Ensure the current date is within the duration of the status effect
    if (currentDate < statusEffect.startDate) return currentScore;
    if (currentDate > statusEffect.endDate) return currentScore;

    const elapsedTime = currentDate - statusEffect.startDate;
    
    // Calculate the elapsed hours considering the loss rate
    const elapsedHours = elapsedTime / statusEffect.oneHourInMilliseconds;
    const scoreReduction = statusEffect.lossRate * elapsedHours;

    return currentScore - scoreReduction;
}






























































