import { ProbabilityCalculator } from './ProbabilityCalculator.js';

export class HelpTableRenderer {
  constructor(dice) {
    this.dice = dice;
  }

  render() {
    const calculator = new ProbabilityCalculator(this.dice);
    const matrix = calculator.calculateProbabilities();
    const headers = this.dice.map((_, i) => `D${i}`);
    
    // Contruction of the table
    const colWidth = 6;
    const separator = '+' + headers.map(() => '-'.repeat(colWidth)).join('+') + '+';

    // Encabezado
    console.log('\nHelp Table (Winning Probabilities):');
    console.log(' '.repeat(colWidth) + headers.map(h => h.padStart(colWidth)).join(''));
    console.log(separator);

    // Table rows
    for (let i = 0; i < matrix.length; i++) {
      const rowLabel = `D${i}`.padEnd(colWidth);
      const row = matrix[i]
        .map((p, j) => (i === j ? '---' : `${(p * 100).toFixed(0)}%`).padStart(colWidth))
        .join('');
      console.log(rowLabel + row);
    }

    console.log('');
  }
}
