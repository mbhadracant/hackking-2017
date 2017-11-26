module.exports = class MerchantCard {
  constructor(name, category) {
    this.type = 'Merchant';
    this.name = name;
    this.img = "/static/images/merchant.png";
    this.category = category;

    switch(category) {
      case 'tech':
        this.icon = 'fa-laptop';
        this.tooltip = 'Double your customers credit on your board';
      break;
      case 'food':
        this.icon = 'fa-cutlery';
        this.tooltip = 'Gain $5000';
      break;
      case 'bar':
        this.icon = 'fa-beer';
        this.tooltip = 'Half your opponents credit on their board';
      break;
      case 'dealer':
        this.icon = 'fa-cog';
        this.tooltip = "Removes an opponent's customer";
      break;
      case 'store':
        this.icon = 'fa-shopping-cart';
        this.tooltip = "Draw 2 cards";
      break;
    }
  }
};
