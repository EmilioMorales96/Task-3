import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { HelpTableRenderer } from './HelpTableRenderer.js';
import { FairNumberGenerator } from './FairNumberGenerator.js';

export class Menu {
  constructor(dice) {
    this.dice = dice; // array de objetos Dice
    this.rl = readline.createInterface({ input, output });
    this.fairGen = new FairNumberGenerator();
  }

  async run() {
    console.log('Welcome to the Non-Transitive Dice Game!');

    while (true) {
      console.log('\nMain Menu:');
      console.log('1) Play a round');
      console.log('2) Show help (probabilities table)');
      console.log('3) Exit');

      const choice = await this.rl.question('Choose an option: ');

      if (choice === '1') {
        await this.playRound();
      } else if (choice === '2') {
        this.showHelp();
      } else if (choice === '3') {
        console.log('Goodbye!');
        break;
      } else {
        console.log('Invalid option. Please enter 1, 2, or 3.');
      }
    }

    this.rl.close();
  }

  showHelp() {
    const renderer = new HelpTableRenderer(this.dice);
    renderer.printTable();
  }

  async playRound() {
    console.log('\nSelect your dice:');
    this.printDiceList();

    let playerIndex = await this.promptDiceSelection();

    console.log(`You selected dice #${playerIndex + 1}`);

    // Computer selects a different dice
    let computerIndex = this.getRandomDifferentDiceIndex(playerIndex);
    console.log(`Computer selected dice #${computerIndex + 1}`);

    // Fair roll for player
    const playerRoll = await this.fairGen.generateRoll(this.rl, this.dice[playerIndex].faces.length, 'Player');

    // Fair roll for computer
    const computerRoll = await this.fairGen.generateRoll(this.rl, this.dice[computerIndex].faces.length, 'Computer');

    console.log(`Player rolled: ${this.dice[playerIndex].faces[playerRoll]}`);
    console.log(`Computer rolled: ${this.dice[computerIndex].faces[computerRoll]}`);

    if (this.dice[playerIndex].faces[playerRoll] > this.dice[computerIndex].faces[computerRoll]) {
      console.log('Player wins!');
    } else if (this.dice[playerIndex].faces[playerRoll] < this.dice[computerIndex].faces[computerRoll]) {
      console.log('Computer wins!');
    } else {
      console.log('It\'s a tie!');
    }
  }

  printDiceList() {
    this.dice.forEach((dice, idx) => {
      console.log(`${idx + 1}) ${dice.faces.join(', ')}`);
    });
  }

  async promptDiceSelection() {
    while (true) {
      const answer = await this.rl.question('Enter dice number: ');
      const num = parseInt(answer);
      if (!Number.isInteger(num) || num < 1 || num > this.dice.length) {
        console.log('Invalid input. Please enter a valid dice number.');
      } else {
        return num - 1;
      }
    }
  }

  getRandomDifferentDiceIndex(excludeIndex) {
    const availableIndexes = this.dice
      .map((_, idx) => idx)
      .filter(idx => idx !== excludeIndex);

    const randomIdx = Math.floor(Math.random() * availableIndexes.length);
    return availableIndexes[randomIdx];
  }
}
