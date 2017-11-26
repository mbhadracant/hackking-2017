module.exports = class MerchantCard {
  constructor(name, category) {
    this.type = 'Merchant';
    this.name = name;
    this.img = "/static/images/merchant.png";
    this.category = category;

    switch(category) {
      case 'tech':
        this.icon = 'fa-laptop';
      break;
      case 'food':
        this.icon = 'fa-cutlery';
      break;
      case 'bar':
        this.icon = 'fa-beer';
      break;
      case 'dealer':
        this.icon = 'fa-cog';
      break;
      case 'store':
        this.icon = 'fa-shopping-cart';
      break;
    }
  }
};
