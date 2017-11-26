module.exports = class CustomerCard {
  constructor(name, balance, savings) {
    this.type = 'Customer';
    this.name = name;
    this.img = "/static/images/customer.jpg";
    this.tooltip = "A customer card showing the credit and savings. When credit reaches 0, the player loses money equal to the customer's credit."
    + "\nSavings gradually increases a player's turn."
    this.balance = balance;
    this.originalBalance = balance;
    this.savings = savings;
  }
};
