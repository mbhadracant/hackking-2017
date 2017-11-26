module.exports = class TransferCard {
  constructor(money) {
    this.type = 'Transfer';
    this.name = "Transfer";
    this.img = "/static/images/transfer.png";
    this.money = money;
    this.tooltip = "Take a customer of the enemy's team credit equivalent to the amount shown in this card";
  }
};
