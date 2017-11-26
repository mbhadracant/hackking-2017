module.exports = class Player {
  constructor(socket, name) {
    this.socket = socket;
    this.name = name;
    this.hand = [];
    this.money = 20000;
  }

  addCardToHand(card) {
    this.hand.push(card);
  }
};
