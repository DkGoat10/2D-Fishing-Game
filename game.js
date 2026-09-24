const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let boat = {
    x: 350,
    y: 100,
    width: 100,
    height: 50,
    speed: 5
};

let fish = [];
let bubbles = [];
let keys = {};

let money = 0;
let fishCaught = 0;
let rodLevel = 1;
let gameOver = false;
let message = "Move the boat and cast your line!";
let frame = 0;

let fishing = false;
let hook = {
    x: 0,
    y: 0,
    width: 12,
    height: 12,
    speed: 5
};

// Keyboard controls
document.addEventListener("keydown", function(event) {
    keys[event.key.toLowerCase()] = true;

    if (event.code === "Space") {
        if (!fishing && !gameOver) {
            castLine();
        }
    }

    if (event.key.toLowerCase() === "u" && !gameOver) {
        upgradeRod();
    }

    if (event.key.toLowerCase() === "r" && gameOver) {
        restartGame();
    }
});

document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});

// Create a fish
function createFish() {
    let rare = Math.random() < 0.15;

    fish.push({
        x: Math.random() * 700 + 50,
        y: Math.random() * 280 + 180,
        width: rare ? 35 : 25,
        height: rare ? 20 : 15,
        speed: Math.random() * 2 + 1,
        direction: Math.random() < 0.5 ? 1 : -1,
        rare: rare,
        value: rare ? 50 : 10
    });
}

// Create bubbles
function createBubble() {
    bubbles.push({
        x: Math.random() * canvas.width,
        y: canvas.height,
        size: Math.random() * 5 + 3,
        speed: Math.random() * 1 + 0.5
    });
}

// Cast the fishing line
function castLine() {
    fishing = true;

    hook.x = boat.x + boat.width / 2 - hook.width / 2;
    hook.y = boat.y + boat.height;

    message = "Move the boat so the hook touches a fish!";
}

// Upgrade fishing rod
function upgradeRod() {
    let cost = rodLevel * 50;

    if (money >= cost) {
        money -= cost;
        rodLevel++;
        message = "Your fishing rod is now level " + rodLevel + "!";
    } else {
        message = "You need $" + cost + " to upgrade your rod.";
    }
}

// Check collision
function touching(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Update the game
function update() {
    if (gameOver) {
        return;
    }

    frame++;

    // Move boat
    if (keys["a"] || keys["arrowleft"]) {
        boat.x -= boat.speed;
    }

    if (keys["d"] || keys["arrowright"]) {
        boat.x += boat.speed;
    }

    // Keep boat inside the screen
    if (boat.x < 0) {
        boat.x = 0;
    }

    if (boat.x + boat.width > canvas.width) {
        boat.x = canvas.width - boat.width;
    }

    // Create fish
    if (frame % 50 === 0 && fish.length < 12) {
        createFish();
    }

    // Create bubbles
    if (frame % 20 === 0) {
        createBubble();
    }

    // Move fish
    for (let fishItem of fish) {
        fishItem.x += fishItem.speed * fishItem.direction;

        if (fishItem.x < 0 || fishItem.x > canvas.width) {
            fishItem.direction *= -1;
        }
    }

    // Move bubbles
    for (let bubble of bubbles) {
        bubble.y -= bubble.speed;
    }

    bubbles = bubbles.filter(function(bubble) {
        return bubble.y > 0;
    });

    // Move fishing hook
    if (fishing) {
        hook.y += hook.speed + rodLevel;

        // Check if hook touches a fish
        for (let i = fish.length - 1; i >= 0; i--) {
            let fishItem = fish[i];

            let fishBox = {
                x: fishItem.x - fishItem.width,
                y: fishItem.y - fishItem.height,
                width: fishItem.width * 2,
                height: fishItem.height * 2
            };

            if (touching(hook, fishBox)) {
                money += fishItem.value;
                fishCaught++;

                if (fishItem.rare) {
                    message = "You caught a RARE fish! +$50";
                } else {
                    message = "You caught a fish! +$10";
                }

                fish.splice(i, 1);
                fishing = false;
                break;
            }
        }

        // Stop the hook at the bottom
        if (hook.y > canvas.height - 20) {
            fishing = false;
            message = "The hook came back empty!";
        }
    }
}

// Draw the game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, canvas.width, 150);

    // Water
    ctx.fillStyle = "#3498db";
    ctx.fillRect(0, 150, canvas.width, 350);

    // Water lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;

    for (let y = 180; y < canvas.height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Sun
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(700, 70, 35, 0, Math.PI * 2);
    ctx.fill();

    // Bubbles
    for (let bubble of bubbles) {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Fish
    for (let fishItem of fish) {
        ctx.fillStyle = fishItem.rare ? "gold" : "orange";

        ctx.beginPath();
        ctx.ellipse(
            fishItem.x,
            fishItem.y,
            fishItem.width,
            fishItem.height,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Fish tail
        ctx.beginPath();
        ctx.moveTo(fishItem.x - fishItem.width, fishItem.y);
        ctx.lineTo(
            fishItem.x - fishItem.width - 15,
            fishItem.y - 12
        );
        ctx.lineTo(
            fishItem.x - fishItem.width - 15,
            fishItem.y + 12
        );
        ctx.closePath();
        ctx.fill();

        // Fish eye
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(
            fishItem.x + fishItem.width / 2 - 5,
            fishItem.y - 3,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Boat
    ctx.fillStyle = "brown";
    ctx.beginPath();
    ctx.moveTo(boat.x, boat.y);
    ctx.lineTo(boat.x + boat.width, boat.y);
    ctx.lineTo(boat.x + boat.width - 20, boat.y + boat.height);
    ctx.lineTo(boat.x + 20, boat.y + boat.height);
    ctx.closePath();
    ctx.fill();

    // Boat cabin
    ctx.fillStyle = "white";
    ctx.fillRect(boat.x + 25, boat.y - 35, 50, 35);

    // Fishing line and hook
    if (fishing) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(
            boat.x + boat.width / 2,
            boat.y + boat.height
        );
        ctx.lineTo(
            hook.x + hook.width / 2,
            hook.y
        );
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
            hook.x + hook.width / 2,
            hook.y,
            6,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Information panel
    ctx.fillStyle = "black";
    ctx.font = "22px Arial";
    ctx.fillText("Money: $" + money, 20, 35);
    ctx.fillText("Fish: " + fishCaught, 20, 65);
    ctx.fillText("Rod Level: " + rodLevel, 20, 95);

    ctx.font = "17px Arial";
    ctx.fillText("A/D or Arrow Keys: Move", 520, 30);
    ctx.fillText("SPACE: Cast | U: Upgrade", 520, 55);

    // Message
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(message, 20, 475);

    // Upgrade cost
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(
        "Next rod upgrade: $" + rodLevel * 50,
        20,
        125
    );
}

// Restart the game
function restartGame() {
    boat.x = 350;
    fish = [];
    bubbles = [];
    money = 0;
    fishCaught = 0;
    rodLevel = 1;
    gameOver = false;
    message = "Move the boat and cast your line!";
    frame = 0;
    fishing = false;
    hook.y = 0;
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();