const Dice = require('');

class DiceParser {
  static parse(args) {
    if (!args || args.length < 3) {
      throw new Error("You must provide at least 3 dice. Example: node game.js 1,2,3,4,5,6 1,3,3,4,6,7 2,2,5,5,6,6");
    }

    const dice = args.map((arg, idx) => {
      const parts = arg.split(',');
      if (parts.length < 1) {
        throw new Error(`Dice #${idx + 1} is empty or invalid.`);
      }

      const faces = parts.map(num => {
        const parsed = parseInt(num, 10);
        if (isNaN(parsed)) {
          throw new Error(`Invalid number in dice #${idx + 1}: "${num}". Example of valid input: 2,3,4,5,6,7`);
        }
        return parsed;
      });

      return new Dice(faces);
    });

    const faceCount = dice[0].getFaceCount();
    if (!dice.every(d => d.getFaceCount() === faceCount)) {
      throw new Error("All dice must have the same number of faces.");
    }

    return dice;
  }
}

module.exports = DiceParser;
