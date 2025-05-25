import crypto from "crypto";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

// Dice class
class Dice {
  constructor(faces) {
    this.faces = faces; // array of integers representing the faces of the dice
  }
  roll(index) {
    return this.faces[index];
  }
  size() {
    return this.faces.length;
  }
}

// Parser of dices
function parseDiceArgs(args) {
  if (args.length < 3) throw new Error("At least 3 dice are required.");
  return args.map((arg, i) => {
    const faces = arg.split(",").map(n => {
      if (!/^\d+$/.test(n)) throw new Error(`Invalid face value in dice ${i + 1}: ${n}`);
      return parseInt(n, 10);
    });
    if (faces.length < 2) throw new Error(`Dice ${i + 1} must have at least 2 faces.`);
    return new Dice(faces);
  });
}

// Generation with HMAC-SHA3
class FairNumberGenerator {
  constructor(range) {
    this.range = range;
  }
  generateHMAC() {
    this.key = crypto.randomBytes(32); // 256 bits
    this.computerNumber = this.secureRandomInt();
    this.hmac = crypto.createHmac("sha3-256", this.key).update(this.computerNumber.toString()).digest("hex");
    return this.hmac;
  }
  secureRandomInt() {
    // Generate uniform in [0, range-1] using crypto
    const max = 256 - (256 % this.range);
    let r;
    do {
      r = crypto.randomBytes(1)[0];
    } while (r >= max);
    return r % this.range;
  }
  getResult(userNumber) {
    return (userNumber + this.computerNumber) % this.range;
  }
  revealKey() {
    return this.key.toString("hex");
  }
}

// Simplified posibilities (pair of dices)
function calculateProbabilities(dices) {
  const n = dices.length;
  const matrix = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) matrix[i][j] = "-";
      else {
        let wins = 0, total = 0;
        for (const f1 of dices[i].faces) {
          for (const f2 of dices[j].faces) {
            if (f1 > f2) wins++;
            total++;
          }
        }
        matrix[i][j] = (wins / total).toFixed(2);
      }
    }
  }
  return matrix;
}

// Show all posibilities ASCII
function printProbabilityTable(dices, matrix) {
  const n = dices.length;
  let header = "Dice\\Dice | " + dices.map((_, i) => i + 1).join(" | ") + " |\n";
  let sep = "-".repeat(header.length) + "\n";
  let body = "";
  for (let i = 0; i < n; i++) {
    body += `Dice ${i + 1} | ${matrix[i].join(" | ")} |\n`;
  }
  console.log(header + sep + body);
}

// Menu 
async function main() {
  try {
    const dices = parseDiceArgs(process.argv.slice(2));
    const rl = readline.createInterface({ input, output });

    console.log("Welcome to Non-Transitive Dice Game!");

    while (true) {
      console.log("\nMenu:");
      console.log("1. Play");
      console.log("2. Help (show probabilities)");
      console.log("3. Exit");
      const choice = await rl.question("Choose option: ");

      if (choice === "1") {
        // Fair random to decide who picks dice first (0 or 1)
        const firstPickGen = new FairNumberGenerator(2);
        const hmac = firstPickGen.generateHMAC();
        console.log(`HMAC for first player choice: ${hmac}`);

        let userPick;
        while (true) {
          userPick = parseInt(await rl.question("Guess who picks dice first? (0 = computer, 1 = you): "));
          if (userPick === 0 || userPick === 1) break;
          console.log("Invalid input, enter 0 or 1.");
        }

        const firstPicker = firstPickGen.getResult(userPick);
        console.log(`First picker is: ${firstPicker === 0 ? "Computer" : "You"}`);
        console.log(`Key: ${firstPickGen.revealKey()}`);

        // Picker 1 selects dice
        let picker1Dice;
        if (firstPicker === 1) {
          while (true) {
            const idx = parseInt(await rl.question(`Choose your dice [1-${dices.length}]: `)) - 1;
            if (idx >= 0 && idx < dices.length) {
              picker1Dice = idx;
              break;
            }
            console.log("Invalid choice.");
          }
        } else {
          picker1Dice = Math.floor(Math.random() * dices.length);
          console.log(`Computer chooses dice #${picker1Dice + 1}`);
        }

        // Picker 2 selects different dice
        let picker2Dice;
        if (firstPicker === 0) {
          while (true) {
            const idx = parseInt(await rl.question(`Choose your dice (different from computer's) [1-${dices.length}]: `)) - 1;
            if (idx >= 0 && idx < dices.length && idx !== picker1Dice) {
              picker2Dice = idx;
              break;
            }
            console.log("Invalid choice.");
          }
        } else {
          // Computer chooses dice different from user's choice
          let options = [];
          for (let i = 0; i < dices.length; i++) {
            if (i !== picker1Dice) options.push(i);
          }
          picker2Dice = options[Math.floor(Math.random() * options.length)];
          console.log(`Computer chooses dice #${picker2Dice + 1}`);
        }

        // Roll dice fair random (dice face index)
        // User roll
        const userRollGen = new FairNumberGenerator(dices[picker2Dice].size());
        const hmacUser = userRollGen.generateHMAC();
        console.log(`HMAC for your roll: ${hmacUser}`);
        let userNumber;
        while (true) {
          userNumber = parseInt(await rl.question(`Choose your roll index [0-${dices[picker2Dice].size() - 1}]: `));
          if (userNumber >= 0 && userNumber < dices[picker2Dice].size()) break;
          console.log("Invalid index.");
        }
        const userRoll = userRollGen.getResult(userNumber);
        console.log(`Your roll result: face index ${userRoll}, value: ${dices[picker2Dice].roll(userRoll)}`);
        console.log(`Key: ${userRollGen.revealKey()}`);

        // Computer roll
        const compRollGen = new FairNumberGenerator(dices[picker1Dice].size());
        const hmacComp = compRollGen.generateHMAC();
        console.log(`HMAC for computer roll: ${hmacComp}`);
        const compNumber = Math.floor(Math.random() * dices[picker1Dice].size());
        console.log(`Computer chooses roll index: ${compNumber}`);
        const compRoll = compRollGen.getResult(compNumber);
        console.log(`Computer roll result: face index ${compRoll}, value: ${dices[picker1Dice].roll(compRoll)}`);
        console.log(`Key: ${compRollGen.revealKey()}`);

        // Decide winner
        const userVal = dices[picker2Dice].roll(userRoll);
        const compVal = dices[picker1Dice].roll(compRoll);

        if (userVal > compVal) console.log("You win!");
        else if (userVal < compVal) console.log("Computer wins!");
        else console.log("It's a tie!");

      } else if (choice === "2") {
        // Show probability table
        const matrix = calculateProbabilities(dices);
        printProbabilityTable(dices, matrix);

      } else if (choice === "3") {
        console.log("Goodbye!");
        rl.close();
        process.exit(0);

      } else {
        console.log("Invalid option.");
      }
    }
  } catch (e) {
    console.error("Error:", e.message);
    console.error("Usage: node index.js dice1 dice2 dice3 ...");
    console.error("Each dice is a comma-separated list of integers, e.g.: 2,2,4,4,9,9");
    process.exit(1);
  }
}

main();

