export class Dice {
  constructor(faces) {
    this.faces = faces;
  }

  roll(index) {
    return this.faces[index];
  }
}
