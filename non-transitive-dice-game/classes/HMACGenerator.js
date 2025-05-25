import crypto from 'crypto';

export class HMACGenerator {
  static generateHMAC(keyHex, message) {
    const keyBuffer = Buffer.from(keyHex, 'hex');
    return crypto.createHmac('sha3-256', keyBuffer).update(message.toString()).digest('hex');
  }

  static verifyHMAC(keyHex, message, hmac) {
    const expected = this.generateHMAC(keyHex, message);
    return expected === hmac;
  }
}
