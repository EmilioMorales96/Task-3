import crypto from 'crypto';

export class FairNumberGenerator {
  // Genera una clave secreta aleatoria
  generateSecretKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Genera un número aleatorio y su HMAC con una clave secreta
  generateHmacNumber(max) {
    const secretKey = this.generateSecretKey();
    const number = Math.floor(Math.random() * max);
    const hmac = crypto.createHmac('sha256', secretKey).update(number.toString()).digest('hex');
    return { secretKey, number, hmac };
  }

  // Revela el número original y verifica el HMAC
  revealAndVerify(secretKey, number, hmacToCheck) {
    const hmac = crypto.createHmac('sha256', secretKey).update(number.toString()).digest('hex');
    return hmac === hmacToCheck;
  }

  // Protocolo justo con participación del jugador (por ejemplo para tirar un dado)
  async generateRoll(rl, max, label) {
    const { secretKey, number: computerNumber, hmac } = this.generateHmacNumber(max);

    console.log(`\n[${label}] HMAC: ${hmac}`);
    const userInput = await rl.question(`[${label}] Enter your number (0 to ${max - 1}): `);
    const userNumber = parseInt(userInput);

    if (isNaN(userNumber) || userNumber < 0 || userNumber >= max) {
      console.log(`[${label}] Invalid input. Defaulting to 0.`);
    }

    console.log(`[${label}] Secret key: ${secretKey}`);
    console.log(`[${label}] Computer's number: ${computerNumber}`);
    const combined = (userNumber + computerNumber) % max;
    console.log(`[${label}] Final result (combined % max): ${combined}`);

    return combined;
  }
}

