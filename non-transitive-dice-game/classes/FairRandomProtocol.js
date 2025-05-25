import { SecureRandomGenerator } from './SecureRandomGenerator.js';
import { HMACGenerator } from './HMACGenerator.js';

export class FairRandomProtocol {
  constructor(rangeMax) {
    this.rangeMax = rangeMax;
    this.key = null;
    this.computerNumber = null;
    this.hmac = null;
  }

  initiate() {
    this.key = SecureRandomGenerator.generateKey();
    this.computerNumber = SecureRandomGenerator.generateUniformInt(0, this.rangeMax);
    this.hmac = HMACGenerator.generateHMAC(this.key, this.computerNumber);
    return this.hmac;
  }

  reveal(userNumber) {
    if (userNumber < 0 || userNumber > this.rangeMax) {
      throw new Error(`User number must be between 0 and ${this.rangeMax}`);
    }

    const valid = HMACGenerator.verifyHMAC(this.key, this.computerNumber, this.hmac);
    if (!valid) {
      throw new Error('HMAC verification failed. Computer might be cheating.');
    }

    const result = (userNumber + this.computerNumber) % (this.rangeMax + 1);

    return {
      key: this.key,
      computerNumber: this.computerNumber,
      userNumber,
      result,
    };
  }
}
