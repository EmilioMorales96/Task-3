export class ProbabilityCalculator {
  constructor(dice) {
    this.dice = dice; // Array of arrays representing dice faces
    this.numDice = dice.length;
  }

  calculateProbabilities() {
    const matrix = Array.from({ length: this.numDice }, () =>
      Array(this.numDice).fill(0)
    );

    for (let i = 0; i < this.numDice; i++) {
      for (let j = 0; j < this.numDice; j++) {
        if (i === j) continue;
        matrix[i][j] = this.#calculateWinProbability(this.dice[i], this.dice[j]);
      }
    }

    return matrix;
  }

  #calculateWinProbability(dieA, dieB) {
    let wins = 0;
    let total = dieA.length * dieB.length;

    for (const a of dieA) {
      for (const b of dieB) {
        if (a > b) wins++;
      }
    }

    return +(wins / total).toFixed(2); // round to 2 decimal places
  }
}
