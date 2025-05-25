const DiceParser = require('./classes/DiceParser');

try {
  const args = process.argv.slice(2);
  const diceList = DiceParser.parse(args);
  console.log("🎲 Dice parsed successfully!");
  diceList.forEach((die, idx) => {
    console.log(`Dice #${idx + 1}: [${die.faces.join(', ')}]`);
  });
} catch (err) {
  console.error("❌ Error:", err.message);
  console.log("💡 Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
  process.exit(1);
}
