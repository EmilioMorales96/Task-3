import crypto from 'crypto';

export class SecureRandomGenerator {
  static generateKey(bits = 256) {
    const bytes = bits / 8;
    return crypto.randomBytes(bytes).toString('hex'); // key in hex
  }

  static generateUniformInt(min, max) {
    if (min > max) throw new Error("Invalid range");

    const range = max - min + 1;
    const byteSize = Math.ceil(Math.log2(range) / 8);
    const maxValidValue = Math.floor(256 ** byteSize / range) * range - 1;

    let randomValue;
    do {
      const buf = crypto.randomBytes(byteSize);
      randomValue = 0;
      for (let i = 0; i < byteSize; i++) {
        randomValue = (randomValue << 8) + buf[i];
      }
    } while (randomValue > maxValidValue);

    return min + (randomValue % range);
  }
}
