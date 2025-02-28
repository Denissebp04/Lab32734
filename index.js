// Import required standard module
const readline = require("readline");
const fs = require('fs');

// Create readline interface for input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Game state
let gameState = {
  currentRoom: "start",
  inventory: [],
  gameActive: true,
  playerLevel: 1,
  experience: 0,
  health: 100,
  puzzlesSolved: 0
};

// Game map
const gameMap = {
  start: {
    description:
      "You are in a dark, cold room with two doors. One leads to the north and another to the east.",
    directions: {
      north: "library",
      east: "kitchen",
    },
  },
  library: {
    description:
      "You find yourself surrounded by shelves of ancient books. There is a door to the south.",
    directions: {
      south: "start",
    },
    item: "ancient book",
  },
  kitchen: {
    description:
"A seemingly abandoned kitchen. There's a door to the west and a strange, glowing portal that seems to lead nowhere.",
    directions: {
      west: "start",
      portal: "secretRoom",
    },
    item: "rusty key", // TODO: Implement item pickup functionality
  },
  secretRoom: {
    description:
      "You step through the portal and enter a secret room filled with treasure.",
    directions: {
      portal: "kitchen",
    },
  },
};

// Available commands
const commands = {
  help: "Shows this help message",
  look: "Look around the current room",
  inventory: "Show your inventory",
  take: "Take an item (usage: take [item])",
  examine: "Examine an item or object (usage: examine [item])",
  save: "Save your game progress",
  load: "Load your saved game",
  quit: "Exit the game"
};

// Function to show current location
function showLocation() {
  const location = gameMap[gameState.currentRoom];
  console.log(location.description);
  if (location.item) {
    console.log(`You see a ${location.item} here.`);
  }
  // TODO: Implement a way to pick up items and add them to the inventory
}

// Function to move to a new location
function moveToNewLocation(newLocation) {
  const currentLocation = gameMap[gameState.currentRoom];
  if (currentLocation.directions[newLocation]) {
    gameState.currentRoom = currentLocation.directions[newLocation];
    showLocation();
  } else {
    console.log("You can't go that way.");
  }
}

// Function to display help
function showHelp() {
  console.log("\nAvailable Commands:");
  for (const [command, description] of Object.entries(commands)) {
    console.log(`${command}: ${description}`);
  }
  console.log("\nDirections you can use when available: north, south, east, west, portal");
}

// Function to handle item pickup
function takeItem() {
  const currentLocation = gameMap[gameState.currentRoom];
  if (currentLocation.item) {
    gameState.inventory.push(currentLocation.item);
    console.log(`You picked up the ${currentLocation.item}.`);
    delete currentLocation.item;
  } else {
    console.log("There's nothing here to take.");
  }
}

// Function to show inventory
function showInventory() {
  if (gameState.inventory.length === 0) {
    console.log("Your inventory is empty.");
  } else {
    console.log("\nInventory:");
    gameState.inventory.forEach(item => console.log(`- ${item}`));
  }
}

// Function to save game
function saveGame() {
  try {
    fs.writeFileSync('savegame.json', JSON.stringify(gameState));
    console.log("Game saved successfully!");
  } catch (error) {
    console.log("Failed to save the game:", error.message);
  }
}

// Function to load game
function loadGame() {
  try {
    const savedData = fs.readFileSync('savegame.json', 'utf8');
    gameState = JSON.parse(savedData);
    console.log("Game loaded successfully!");
    showLocation();
  } catch (error) {
    console.log("No saved game found or error loading save:", error.message);
  }
}

// Function to examine items
function examineItem(item) {
  if (gameState.inventory.includes(item)) {
    // Add specific item descriptions here
    const itemDescriptions = {
      "ancient book": "A dusty tome filled with mysterious symbols and ancient knowledge. It seems to glow faintly.",
      "rusty key": "An old iron key covered in rust. Despite its age, it looks like it might still work."
    };
    console.log(itemDescriptions[item] || "You see nothing special about this item.");
  } else {
    console.log("You don't have that item in your inventory.");
  }
}

// Function to check victory condition
function checkVictory() {
  if (gameState.puzzlesSolved >= 3 && gameState.inventory.includes("ancient book")) {
    console.log("\n🎉 Congratulations! You've won the game! 🎉");
    console.log("You've solved all the puzzles and obtained the ancient knowledge!");
    gameState.gameActive = false;
    rl.close();
  }
}

// Function to start the game
function startGame() {
  console.log("Welcome to the Text Adventure Game!");
  console.log("Type 'help' to see available commands.");
  showLocation();

  rl.on("line", (input) => {
    const [command, ...args] = input.toLowerCase().trim().split(" ");
    
    if (!gameState.gameActive) return;

    switch (command) {
      case "quit":
        gameState.gameActive = false;
        rl.close();
        break;
      case "help":
        showHelp();
        break;
      case "look":
        showLocation();
        break;
      case "inventory":
        showInventory();
        break;
      case "take":
        takeItem();
        break;
      case "examine":
        if (args.length > 0) {
          examineItem(args.join(" "));
        } else {
          console.log("What would you like to examine?");
        }
        break;
      case "save":
        saveGame();
        break;
      case "load":
        loadGame();
        break;
      default:
        if (command in gameMap[gameState.currentRoom].directions) {
          moveToNewLocation(command);
          checkVictory();
        } else {
          console.log("Invalid command. Type 'help' for available commands.");
        }
    }
  });
}

// Initiate the game
startGame();

// TODO: Implement a feature to display the player's inventory.
// TODO: Implement game-saving functionality.
// TODO: Implement a combat system.
// TODO: Implement a leveling system.
// TODO: Implement a victory condition