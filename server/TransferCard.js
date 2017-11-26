module.exports = class TransferCard {
  constructor(money) {
    this.type = 'Transfer';
    this.name = "Transfer";
    this.img = "/static/images/transfer.png";
    this.money = money;
  }
};
