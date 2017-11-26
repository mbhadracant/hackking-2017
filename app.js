var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./server/Game.js');
app.use('/', express.static(__dirname + '/'));

var gameCounter = 1;

var queue = [];
var rooms = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/game/:id', function(req, res){
    var gameRoom = '/game/' + req.params.id;
    if(!(gameRoom in rooms)) {
        return res.redirect('/');
    } else {
      if(rooms[gameRoom]['playerCount'] == 2) {
        return res.redirect('/');
      }
    }
  return res.sendFile(__dirname + '/game.html');
});

io.on('connection', function(socket){
  socket.on('add client', function(name){
    queue.push([name,socket]);
    if(queue.length == 2) {
      var player1 = queue.shift();
      var player2 = queue.shift();
      var roomName = '/game/' + gameCounter++;
      rooms[roomName] = {};
      rooms[roomName]['playerCount'] = 0;
      rooms[roomName]['player1'] = { 'name': player1[0]}
      rooms[roomName]['player2'] = { 'name': player2[0]}
      player1[1].join(roomName);
      player2[1].join(roomName);
      player1[1].emit('redirect', {'roomName': roomName, 'name': player1[0]});
      player2[1].emit('redirect', {'roomName': roomName, 'name': player2[0]});
    }
  });

  socket.on('register client game', function(data){
    var roomName = data.roomName;
    var playerName = data.name;
    socket.join(roomName);
    if (rooms[roomName]['player1']['name'] === playerName) {
      rooms[roomName]['player1']['socket'] = socket;
    }

    if (rooms[roomName]['player2']['name'] === playerName) {
      rooms[roomName]['player2']['socket'] = socket;
    }

    rooms[roomName]['playerCount'] = rooms[roomName]['playerCount'] + 1;

    if(rooms[roomName]['playerCount'] == 2) {
      var player1 = rooms[roomName]['player1'];
      var player2 = rooms[roomName]['player2'];
      player1.socket.emit('set reverse');
      var game = new Game(player1,player2);
      rooms[roomName]['game'] = game;
      io.to(roomName).emit('set title', game.getState());
      io.to(roomName).emit('update board', game.board);
      player1.socket.emit('update hand', game.player1.hand);
      player2.socket.emit('update hand', game.player2.hand);
    }
  });

  socket.on('activate', function(data){
      var roomName = data.roomName;
      var game = rooms[roomName]['game'];
      if(game.checkPlayer(socket.client.id)) {
        var player = game.getPlayer(socket.client.id);
        var opponent = game.getOppponent(socket.client.id);
        var boardRow = game.getBoardRow(player);

        var emptyIndex = boardRow.indexOf(undefined);
        if(emptyIndex == -1) {
          socket.emit('notify', 'Board is full!');
        } else {
          var card = player.hand[data.handIndex];
          switch(card.type) {
            case 'Customer':
              var card = player.hand.splice(data.handIndex,1)[0];
              boardRow[emptyIndex] = card;
              io.emit('notify', player.name + " has played a new customer");
              io.to(roomName).emit('update board', game.board);
              socket.emit('update hand', player.hand);
            break;
            case 'Transfer':
            game.state = game.State['Selecting Target'];
            socket.emit('show cancel', data.handIndex);
            io.to(roomName).emit('set title', game.getState());
            break;
            case 'Merchant':
              switch(card.category){
                case 'tech':
                  var card = player.hand.splice(data.handIndex,1)[0];
                  var boardRow = game.getBoardRow(player);
                  for(var i = 0; i < boardRow.length; i++) {
                    if(boardRow[i] != undefined) {
                      boardRow[i].balance *= 2;
                    }
                  }
                  io.emit('notify', player.name + "'s customers have doubled their money!");
                  io.to(roomName).emit('update board', game.board);
                  socket.emit('update hand', player.hand);
                break;
                case 'food':
                  var card = player.hand.splice(data.handIndex,1)[0];
                  player.money += 5000;
                  player.socket.emit('update money', {'player': player.money, 'opponent': opponent.money})
                  opponent.socket.emit('update money', {'player': opponent.money, 'opponent': player.money})
                  socket.emit('update hand', player.hand);
                  io.emit('notify', player.name + ' has gained $5000!');
                break;
                case 'bar':
                var card = player.hand.splice(data.handIndex,1)[0];
                var boardRow = game.getBoardRow(opponent);
                for(var i = 0; i < boardRow.length; i++) {
                  if(boardRow[i] != undefined) {
                    boardRow[i].balance /= 2;
                  }
                }
                io.emit('notify', opponent.name + "'s customers have lost half their money!");
                io.to(roomName).emit('update board', game.board);
                socket.emit('update hand', player.hand);
                break;
                case 'dealer':
                  var boardRow = game.getBoardRow(opponent);
                  var found = false;
                  for(var i = 0; i < boardRow.length; i++) {
                    if(boardRow[i] != undefined) {
                      boardRow[i] = undefined;
                      found = true;
                      break;
                    }
                  }

                  if(found) {
                      var card = player.hand.splice(data.handIndex,1)[0];
                      io.to(roomName).emit('update board', game.board);
                      socket.emit('update hand', player.hand);
                      io.emit('notify', opponent.name + "'s customer has been removed!");
                  } else {
                    socket.emit('notify', 'Opponent does not any customers!');
                  }
                break;
                case 'store':
                  io.emit('notify', player.name + "'s has drawn 2 more cards!");
                  var card = player.hand.splice(data.handIndex,1)[0];
                  player.addCardToHand(game.deck.shift());
                  player.addCardToHand(game.deck.shift());
                  socket.emit('update hand', player.hand);
                break;
              }

            break;
          }
        }
      } else {
        socket.emit('notify', 'Not your turn!');
      }

  });

  socket.on('end turn', function(roomName){
    var roomName = roomName;
    var game = rooms[roomName]['game'];

    if(game.checkPlayer(socket.client.id)) {
      var player = game.getPlayer(socket.client.id);
      game.endTurn();
      var opponent = game.getOppponent(socket.client.id);

      var boardRow = game.getBoardRow(player);
      var losePlayer = true;
      for(var i = 0; i < boardRow.length; i++) {
        if(boardRow[i] != undefined) {
          losePlayer = false;
          break;
        }
      }

      boardRow = game.getBoardRow(opponent);

      var loseOpponent = true;
      for(var i = 0; i < boardRow.length; i++) {
        if(boardRow[i] != undefined) {
          loseOpponent = false;
          break;
        }
      }

      if (losePlayer) {
        player.money -= ((player.money / 100) * 20);
      }

      var savings = 0;
      var boardRow = game.getBoardRow(player);

      for(var i = 0; i < boardRow.length; i++) {
        if(boardRow[i] != undefined) {
          savings += boardRow[i].savings;
        }
      }

      player.money += (savings / 100) * 10;
      player.money = Math.round(player.money)
      opponent.addCardToHand(game.deck.shift());
      opponent.socket.emit('update hand', opponent.hand);
      player.socket.emit('update money', {'player': player.money, 'opponent': opponent.money})
      opponent.socket.emit('update money', {'player': opponent.money, 'opponent': player.money})

      io.to(roomName).emit('set title', game.getState());
      var finishedPlayer = game.checkFinished();
      if(finishedPlayer != undefined) {
        game.state = game.State['Finished'];
        if(finishedPlayer == null) {
          socket.emit("finish', 'it's a draw!'");
          return;
        }
        socket.emit('finish', finishedPlayer.name + ' has won!');
        return;
      }
      io.to(roomName).emit('notify', player.name + ' has ended turn!');
    } else {
      socket.emit('notify', 'Not your turn!');
    }
  });

  socket.on('cancel', function(roomName){
    var roomName = roomName;
    var game = rooms[roomName]['game'];

    if(game.checkPlayer(socket.client.id)) {
      if(game.state === game.State['Selecting Target']) {
        game.state = game.State['Player Turn'];
        io.to(roomName).emit('set title', game.getState());
        socket.emit('hide cancel');
      }
    }
  });

  socket.on('board target', function(data){
    var roomName = data.roomName;
    var i = data.i;
    var j = data.j;
    var selectedHandIndex = data.selectedHandIndex;
    var game = rooms[roomName]['game'];

    if(game.checkPlayer(socket.client.id)) {
      if(game.state === game.State['Selecting Target']) {

        var player = game.getPlayer(socket.client.id);
        var opponent = game.getOppponent(socket.client.id);
        var selectedCard = player.hand[selectedHandIndex];
        var targetCard = game.board[i][j];
        targetCard.balance -= selectedCard.money;
        if(targetCard.balance <= 0) {
          socket.emit('notify', opponent.name + "'s has been removed and loses money!");
          opponent.money -= targetCard.originalBalance;
          game.board[i][j] = undefined;
          player.socket.emit('update money', {'player': player.money, 'opponent': opponent.money})
          opponent.socket.emit('update money', {'player': opponent.money, 'opponent': player.money})
          var finishedPlayer = game.checkFinished();
          if(finishedPlayer != undefined) {
            game.state = game.State['Finished'];
            if(finishedPlayer == null) {
              socket.emit("finish', 'it's a draw!'");
              return;
            }
            socket.emit('finish', finishedPlayer.name + ' has won!');
            return;
          }
        } else {
          socket.emit('notify', opponent.name + "'s customer still has money!");
        }
        player.hand.splice(selectedHandIndex,1);
        game.state = game.State['Player Turn'];
        player.socket.emit('hide cancel');
        io.to(roomName).emit('update board', game.board);
        io.to(roomName).emit('set title', game.getState());
        player.socket.emit('update hand', player.hand);
      }
    } else {
      socket.emit('notify', 'Not your turn!');
    }
  });


});


http.listen(3000, '0.0.0.0', function() {
  console.log('listening on *:3000');
});
