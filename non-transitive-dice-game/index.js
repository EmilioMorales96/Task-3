import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { FairNumberGenerator } from './classes/FairNumberGenerator.js';
import { Dice } from './classes/Dice.js';
import { Menu } from './classes/Menu.js';


// Ejemplo: recibe argumentos desde consola (los dados)
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Error: You need to specify at least 2 dice as arguments.');
  process.exit(1);
}

// Parsear dados: cada argumento es una lista de caras separadas por comas
const dice = args.map(diceStr => {
  const faces = diceStr.split(',').map(x => {
    const v = Number(x);
    if (Number.isNaN(v)) {
      console.log(`Invalid dice face: ${x}`);
      process.exit(1);
    }
    return v;
  });
  return new Dice(faces);
});

const rl = readline.createInterface({ input, output });
const fairGen = new FairNumberGenerator();

async function askUser(prompt, validAnswers) {
  while (true) {
    const ans = (await rl.question(prompt)).trim().toLowerCase();
    if (validAnswers.includes(ans)) return ans;
    console.log('Invalid input, try again.');
  }
}

async function fairGenerate(max, playerName) {
  // 1) Computer generates secret key + number + HMAC
  const { secretKey, number, hmac } = fairGen.generateHmacNumber(max);

  console.log(`${playerName} selected a random value in the range 0..${max - 1} (HMAC=${hmac}).`);

  // 2) User enters their number in the range
  const userNumStr = await askUser(
    Array.from({ length: max }, (_, i) => `${i} - ${i}`).join('\n') +
    '\nX - exit\n? - help\nYour selection: ',
    [...Array(max).keys()].map(String).concat(['x', '?'])
  );

  if (userNumStr === 'x') {
    console.log('Exiting...');
    process.exit(0);
  }

  if (userNumStr === '?') {
    console.log('Select a number from the options.');
    return fairGenerate(max, playerName);
  }

  const userNum = Number(userNumStr);
  console.log(`My number is ${number} (KEY=${secretKey}).`);
  const finalNum = (number + userNum) % max;
  console.log(`The fair number generation result is ${number} + ${userNum} = ${finalNum} (mod ${max}).`);
  return finalNum;
}

async function chooseDice(excludeIndexes = []) {
  console.log('Choose your dice:');
  dice.forEach((d, i) => {
    if (!excludeIndexes.includes(i)) {
      console.log(`${i} - ${d.faces.join(', ')}`);
    }
  });
  console.log('X - exit');
  console.log('? - help');

  const validAnswers = dice
    .map((_, i) => i.toString())
    .filter(i => !excludeIndexes.includes(Number(i)))
    .concat(['x', '?']);

  while (true) {
    const answer = (await rl.question('Your selection: ')).trim().toLowerCase();
    if (answer === 'x') {
      console.log('Exiting...');
      process.exit(0);
    }
    if (answer === '?') {
      console.log('Select the dice number from the list.');
      continue;
    }
    if (validAnswers.includes(answer)) {
      const idx = Number(answer);
      if (excludeIndexes.includes(idx)) {
        console.log('You cannot select that dice.');
        continue;
      }
      return idx;
    }
    console.log('Invalid selection, try again.');
  }
}

async function main() {
  console.log("Let's determine who makes the first move.");

  // Step 1: Fair generation 0 or 1, decide who picks first
  const firstMove = await fairGenerate(2, 'I');

  if (firstMove === 1) {
    console.log('I make the first move and choose my dice.');

    // Computer picks dice randomly
    const computerDiceIndex = Math.floor(Math.random() * dice.length);
    console.log(`I choose the [${dice[computerDiceIndex].faces.join(', ')}] dice.`);

    // Player picks dice excluding computer's
    const playerDiceIndex = await chooseDice([computerDiceIndex]);
    console.log(`You choose the [${dice[playerDiceIndex].faces.join(', ')}] dice.`);

    await rolls(computerDiceIndex, playerDiceIndex);
  } else {
    console.log('You make the first move and choose your dice.');

    // Player picks dice first
    const playerDiceIndex = await chooseDice([]);
    console.log(`You choose the [${dice[playerDiceIndex].faces.join(', ')}] dice.`);

    // Computer picks dice excluding player's
    let availableIndexes = dice.map((_, i) => i).filter(i => i !== playerDiceIndex);
    const computerDiceIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    console.log(`I choose the [${dice[computerDiceIndex].faces.join(', ')}] dice.`);

    await rolls(computerDiceIndex, playerDiceIndex);
  }

  console.log('Thanks for playing!');
  rl.close();
}

async function rolls(computerDiceIndex, playerDiceIndex) {
  // Step 2: Roll for computer
  console.log("It's time for my roll.");
  const computerRollNumber = await fairGenerate(dice[computerDiceIndex].faces.length, 'I');
  const computerRollResult = dice[computerDiceIndex].faces[computerRollNumber];
  console.log(`My roll result is ${computerRollResult}.`);

  // Step 3: Roll for player
  console.log("It's time for your roll.");
  const playerRollNumber = await fairGenerate(dice[playerDiceIndex].faces.length, 'I');
  const playerRollResult = dice[playerDiceIndex].faces[playerRollNumber];
  console.log(`Your roll result is ${playerRollResult}.`);

  // Compare results
  if (playerRollResult > computerRollResult) {
    console.log(`You win (${playerRollResult} > ${computerRollResult})!`);
  } else if (playerRollResult < computerRollResult) {
    console.log(`I win (${computerRollResult} > ${playerRollResult})!`);
  } else {
    console.log("It's a tie!");
  }
}

main();
