var Player = require('./Player.js');
var CustomerCard = require('./CustomerCard.js');
var TransferCard = require('./TransferCard.js');
var MerchantCard = require('./MerchantCard.js');

const fs = require('fs');
var path = require('path')
fs.readFile(path.join(__dirname, 'Joined.json'), handleFile)
fs.readFile(path.join(__dirname, 'Merchant.json'), handleMerchantFile)
var customers, merchants;

function handleFile(err, data) {
    if (err) throw err
    customers = JSON.parse(data)
}

function handleMerchantFile(err, data) {
    if (err) throw err
    merchants = JSON.parse(data)
}



module.exports = class Game {
  constructor(player1, player2) {
    this.board = [
      [undefined, undefined, undefined, undefined],
      [undefined, undefined, undefined, undefined],
    ];

    this.player1 = new Player(player1.socket, player1.name);
    this.player2 = new Player(player2.socket, player2.name);
    this.State = {'Player Turn': 0, 'Selecting Target': 1, 'Finished': 2};
    this.state = this.State['Player Turn'];
    this.turn = (Math.random() > 0.5) ?
    this.player1.socket.client.id : this.player2.socket.client.id;
    this.deck = [];


    for(var i = 0; i < 3000; i++) {
      var customer = customers[i];

      if(customer.balance > 500 && customer.balance < 9999 && customer.savings > 500 && customer.savings < 9999) {
        this.deck.push(new CustomerCard(customer.first_name, customer.balance, customer.savings));
      }
    }


    for(var i = 0; i < 10; i++) {
      this.deck.push(new TransferCard(this.getRandomInt(1000,10000)))
    }
    this.shuffleDeck(merchants);
    for(var i = 0; i < 10; i++) {
      var merchant = merchants[i];

      var categories = merchant.category;
      for(var j = 0; j < categories.length; j++) {
        if(categories[j] === 'bar') {
          this.deck.push(new MerchantCard(merchant.name, 'bar'));
        }

        if(categories[j] === 'dealer') {
          this.deck.push(new MerchantCard(merchant.name, 'dealer'));
        }
        if(categories[j] === 'store') {
          this.deck.push(new MerchantCard(merchant.name, 'store'));
        }

      }
      if(categories.length == 1) {
        switch(categories[0]) {
          case 'tech':
            this.deck.push(new MerchantCard(merchant.name, 'tech'));
          break;
          case 'bar':
            this.deck.push(new MerchantCard(merchant.name, 'bar'));
          break;
          case 'food':
            this.deck.push(new MerchantCard(merchant.name, 'food'));
          break;
          case 'dealer':
            this.deck.push(new MerchantCard(merchant.name, 'dealer'));
          break;
          case 'store':
            this.deck.push(new MerchantCard(merchant.name, 'store'));
          break;
        }
      }
    }

    this.shuffleDeck(this.deck);

    for(var i = 0; i < 5; i++) {
      this.player1.addCardToHand(this.deck.shift());
      this.player2.addCardToHand(this.deck.shift());
    }

  }

   getState() {
    switch(this.state) {
      case 0:
        if(this.turn == this.player1.socket.client.id) {
          return this.player1.name + "'s turn";
        }
        if(this.turn == this.player2.socket.client.id) {
          return this.player2.name + "'s turn";
        }
        break;
      case 1:
      if(this.turn == this.player1.socket.client.id) {
        return this.player1.name + " is selecting a target";
      }
      if(this.turn == this.player2.socket.client.id) {
        return this.player2.name + " is selecting a target";
      }
      break;
    }
  }

  getPlayer(id) {
    if(this.player1.socket.client.id == id) {
      return this.player1;
    } else {
      return this.player2;
    }
  }

  getOppponent(id) {
    if(this.player1.socket.client.id == id) {
      return this.player2;
    } else {
      return this.player1;
    }
  }

  getBoardRow(player) {
    if(player == this.player1) {
      return this.board[0];
    } else {
      return this.board[1];
    }
  }

  checkPlayer(id) {
    return this.turn == id;
  }

  endTurn() {
    if(this.turn == this.player1.socket.client.id) {
      this.turn = this.player2.socket.client.id;
    } else {
      this.turn = this.player1.socket.client.id;
    }
  }

  shuffleDeck(array) {

  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  }

  checkFinished() {
    var winner = undefined;

    if(this.player1.money <= 0 && this.player2.money <= 0) {
      winner = null;
    } else if(this.player1.money <= 0) {
      winner = this.player2;
    } else if(this.player2.money <= 0) {
      winner = this.player1;
    }
    return winner;
  }

 getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
};
