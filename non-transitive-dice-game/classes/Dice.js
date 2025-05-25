class Dice {
  constructor(faces) {
    if (!Array.isArray(faces) || faces.length === 0) {
      throw new Error("Dice must be initialized with a non-empty array of integers.");
    }
    this.faces = faces;
  }

  getFaceCount() {
    return this.faces.length;
  }

  getFace(index) {
    return this.faces[index];
  }

  roll(index) {
    return this.faces[index];
  }
}

module.exports = Dice;
