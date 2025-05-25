import crypto from 'node:crypto';
import readline from 'readline/promises';

export class FairNumberGenerator {
  static async determineFirstPlayer() {
    console.log('\n--- Fair coin toss to determine who picks first ---');
    return await this.collaborativeRandom(2); // 0 or 1
  }

  static async generateRoll(die) {
    console.log(`\nRolling a fair value for a die: ${die.join(', ')}`);
    const index = await this.collaborativeRandom(die.length); // index of face
    return die[index];
  }

  static async collaborativeRandom(range) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Step 1: generate key and system number
    const key = crypto.randomBytes(32); // 256 bits
    const systemNumber = await this.secureRandomInt(range);

    const hmac = crypto.createHmac('sha3-256', key)
      .update(systemNumber.toString())
      .digest('hex');

    console.log(`HMAC: ${hmac}`);

    // Step 2: the user inputs their number
    let userNumber;
    while (true) {
      const input = await rl.question(`Enter your number (0 to ${range - 1}): `);
      userNumber = parseInt(input, 10);
      if (!isNaN(userNumber) && userNumber >= 0 && userNumber < range) break;
      console.log('Invalid input, try again.');
    }

    rl.close();

    // Step 3: verify HMAC and calculate final result
    console.log(`System number: ${systemNumber}`);
    console.log(`Secret key (hex): ${key.toString('hex')}`);

    const expectedHmac = crypto.createHmac('sha3-256', key)
      .update(systemNumber.toString())
      .digest('hex');

    if (hmac !== expectedHmac) {
      throw new Error('HMAC verification failed. Something went wrong.');
    }

    const finalResult = (systemNumber + userNumber) % range;
    console.log(`Final fair result: ${finalResult}`);

    return finalResult;
  }

  static async secureRandomInt(range) {
    // This function generates a uniform random integer in the range [0, range-1]
    const bytes = Math.ceil(Math.log2(range) / 8) + 1;
    const max = 2 ** (bytes * 8);
    const limit = max - (max % range);

    let rand;
    do {
      rand = parseInt(crypto.randomBytes(bytes).toString('hex'), 16);
    } while (rand >= limit);

    return rand % range;
  }
}
