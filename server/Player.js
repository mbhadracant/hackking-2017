module.exports = class Player {
  constructor(socket, name) {
    this.socket = socket;
    this.name = name;
    this.hand = [];
    this.money = 20000;
    this.tooltip = "A customer card showing the credit and savings. When credit reaches 0, the player loses money equal to the customer's credit."
    + "\nSavings gradually increases a player's turn."
  }

  addCardToHand(card) {
    this.hand.push(card);
  }
};
