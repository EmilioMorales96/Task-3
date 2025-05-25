import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { FairNumberGenerator } from './FairNumberGenerator.js';

export class Menu {
  constructor(dice) {
    this.dice = dice;
    this.rl = readline.createInterface({ input, output });
    this.fairGen = new FairNumberGenerator();
  }

  async run() {
    console.log('Welcome to the Non-Transitive Dice Game!');

    while (true) {
      console.log('\nMain Menu:');
      console.log('1) Play a round');
      console.log('2) Exit');

      const choice = await this.rl.question('Choose an option: ');

      if (choice === '1') {
        await this.playRound();
      } else if (choice === '2') {
        console.log('Goodbye!');
        break;
      } else {
        console.log('Invalid option. Please enter 1 or 2.');
      }
    }

    this.rl.close();
  }

 async playRound() {
  console.log('\nSelect your dice:');
  this.dice.forEach((dice, i) => {
    console.log(`${i}) ${dice.faces.join(', ')}`);
  });

  let playerIndex;
  while (true) {
    const input = await this.rl.question('Your selection: ');
    const num = parseInt(input);
    if (!Number.isInteger(num) || num < 0 || num >= this.dice.length) {
      console.log('Invalid input. Try again.');
    } else {
      playerIndex = num;
      break;
    }
  }

  // La computadora elige un dado distinto
  let computerIndex;
  do {
    computerIndex = Math.floor(Math.random() * this.dice.length);
  } while (computerIndex === playerIndex);

  console.log(`Computer selected dice #${computerIndex} (${this.dice[computerIndex].faces.join(', ')})`);

  // Ahora seguimos el protocolo justo colaborativo para la tirada del jugador
  console.log('\nPlayer roll phase:');
  this.fairGen.generateSecretNumber(this.dice[playerIndex].faces.length);
  const playerHMAC = this.fairGen.getHMAC();
  console.log(`HMAC: ${playerHMAC}`);

  let playerNumber;
  while (true) {
    const input = await this.rl.question(`Enter your number between 0 and ${this.dice[playerIndex].faces.length - 1}: `);
    if (input.toLowerCase() === 'x') {
      process.exit(0);
    }
    const num = parseInt(input);
    if (isNaN(num) || num < 0 || num >= this.dice[playerIndex].faces.length) {
      console.log('Invalid number, try again.');
    } else {
      playerNumber = num;
      break;
    }
  }

  const { secretNumber: playerSecret, key: playerKey } = this.fairGen.revealSecret();
  console.log(`Secret number: ${playerSecret}`);
  console.log(`Key: ${playerKey}`);

  // Se calcula el resultado
  const playerRoll = (playerSecret + playerNumber) % this.dice[playerIndex].faces.length;
  console.log(`Player roll result index: ${playerRoll} -> ${this.dice[playerIndex].faces[playerRoll]}`);

  // Ahora el turno de la computadora, misma lógica pero invertida

  console.log('\nComputer roll phase:');
  this.fairGen.generateSecretNumber(this.dice[computerIndex].faces.length);
  const compHMAC = this.fairGen.getHMAC();
  console.log(`HMAC: ${compHMAC}`);

  // La computadora genera su número aleatorio y se lo comunica al jugador como si fuera input
  const compUserInput = Math.floor(Math.random() * this.dice[computerIndex].faces.length);
  console.log(`(Simulated player number input for computer): ${compUserInput}`);

  const { secretNumber: compSecret, key: compKey } = this.fairGen.revealSecret();
  console.log(`Secret number: ${compSecret}`);
  console.log(`Key: ${compKey}`);

  const compRoll = (compSecret + compUserInput) % this.dice[computerIndex].faces.length;
  console.log(`Computer roll result index: ${compRoll} -> ${this.dice[computerIndex].faces[compRoll]}`);

  // Decide el ganador
  if (this.dice[playerIndex].faces[playerRoll] > this.dice[computerIndex].faces[compRoll]) {
    console.log('Player wins!');
  } else if (this.dice[playerIndex].faces[playerRoll] < this.dice[computerIndex].faces[compRoll]) {
    console.log('Computer wins!');
  } else {
    console.log('It\'s a tie!');
  }
 }}


