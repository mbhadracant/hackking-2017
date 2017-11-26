module.exports = class CustomerCard {
  constructor(name, balance, savings) {
    this.type = 'Customer';
    this.name = name;
    this.img = "/static/images/customer.jpg";
    this.balance = balance;
    this.originalBalance = balance;
    this.savings = savings;
  }
};
