var HackChat = require("hack-chat");
var fs = require('fs');
var Users = require("./users.json")
var chat = new HackChat();
var channelName = "blackJack";
var botName = "BlackBot";
var channel = chat.join(channelName, botName);
var onlineUsers = [];
var gameInProgress = false;
var deck = [];
var players = [];
var joinedPlayers = [];
var BJDealer;

chat.on("joining", function() {
  channel.sendMessage("Game is ready to play! Type 'join' to enlist for the next game.\nStart the game by typing 'start'. Type 'help' for a list of commands.");
});

chat.on("onlineRemove", function(nick, time) {
  for (var i = 0; i < joinedPlayers.length; i++)
    if (nick === joinedPlayers[i].nick)
      joinedPlayers.splice(joinedPlayers.indexOf(nick), 1);
  for (var i = 0; i < players.length; i++)
    if (nick === players[i].nick) {
      players.splice(players.indexOf(players[i]), 1);
      channel.sendMessage("@" + user + " is removed from the game");
    }
  fs.writeFile("./users.json", JSON.stringify(Users), function() {});
  onlineUsers.splice(onlineUsers.indexOf(nick), 1);
});

chat.on("chat", function(session, nick, text, time, isAdmin, trip) {
  //console.log(nick + ": " + text);
  var cmd = text.split(" ")[0];
  var args = text.substr(1 + cmd.length).split(" ");
  if (nick == botName)
    return;
  switch (cmd) {
    case "help":
      channel.sendMessage("BlackJackBot made by $\\large\\color{Orange}{ToastyStoemp}$\nAvailble commands: help, rules, join, leave, start, bet, hand, surrender, hit, stand, split, doubleDown" + "\nThe game is a 3-2 payout soft bet and stand till 17");
      break;
    case "rules":
      channel.sendMessage("BlackJackBot made by $\\large\\color{Orange}{ToastyStoemp}$\nYou always play against " + botName + ", not against other players. At the beginning of the game each player gets two cards face up, while " + botName + " gets one card face up and one card face down. In order to win you have to get a higher hand than " + botName + "s, but not exceeding 21. Number cards count for their face value while face cards all count for 10. An ace can count as either 1 or 11. If a players total is below 21 he can choose to $\\color{cyan}{hit}$ or to $\\color{cyan}{stand}$. If a player has a total of 21 he wins, unless " + botName + " also has 21. If a player has a total of more than 21 he busts and loses, same goes for " + botName + ". After each player has finished their hand " + botName + " will turn over his face down card and either hit or stand. Additionally, if a players first two cards are a pair he can $\\color{cyan}{split}$ them and expand them to two separate hands.");
      break;
    case "debug":
      channel.sendMessage('Game in progress: ' + gameInProgress + '\nJoined Players: ' + joinedPlayers + "\nPlayers: " + JSON.stringify(players));
      break;
    case "hit":
      if (gameInProgress) {
        for (var i = 0; i < players.length; i++)
          if (nick === players[i].nick)
            if (players[i].bet[players[i].activehand] != 0)
              players[i]._hit();
            else
              channel.sendMessage("@" + nick + " you have to bet first. Use 'bet <amount>'");
      } else
        channel.sendMessage("@" + nick + " wait for the game to start. Use 'start'");
      break;
    case "doubleDown":
      if (gameInProgress) {
        for (var i = 0; i < players.length; i++)
          if (nick === players[i].nick)
            if (players[i].bet[players[i].activehand] != 0)
              players[i]._doubleDown();
            else
              channel.sendMessage("@" + nick + " you have to bet first. Use 'bet <amount>'");
      } else
        channel.sendMessage("@" + nick + " wait for the game to start. Use 'start'");
      break;
    case "stand":
      if (gameInProgress) {
        for (var i = 0; i < players.length; i++)
          if (nick === players[i].nick)
            if (players[i].bet[players[i].activehand] != 0)
              players[i]._stand();
            else
              channel.sendMessage("@" + nick + " you have to bet first. Use 'bet <amount>'");
      } else
        channel.sendMessage("@" + nick + " wait for the game to start. Use 'start'");
      break;
    case "split":
      if (gameInProgress) {
        for (var i = 0; i < players.length; i++)
          if (nick === players[i].nick)
            if (players[i].bet[players[i].activehand] != 0)
              players[i]._split();
            else
              channel.sendMessage("@" + nick + " you have to bet first. Use 'bet <amount>'");
      } else
        channel.sendMessage("@" + nick + " wait for the game to start. Use 'start'");
      break;
    case "hand":
      if (gameInProgress) {
        for (var i = 0; i < players.length; i++)
          if (nick === players[i].nick)
            if (players[i].bet[players[i].activehand] != 0)
              channel.sendMessage(BJDealer._displayHiddenHand() + "\n\n" + players[i]._displayHand());
            else
              channel.sendMessage("@" + nick + " you have to bet first. Use 'bet <amount>'");
      } else
        channel.sendMessage("@" + nick + " wait for the game to start. Use 'start'");
      break;
    case "surrender":
      if (gameInProgress) {
        for (var i = 0; i < players.length; i++)
          if (nick === players[i].nick)
            if (players[i].bet[players[i].activehand] != 0)
              players[i]._surrender();
            else
              channel.sendMessage("@" + nick + " you have to bet first. Use 'bet <amount>'");
      } else
        channel.sendMessage("@" + nick + " wait for the game to start. Use 'start'");
      break;
    case "bet":
      if (gameInProgress) {
        for (var i = 0; i < players.length; i++)
          if (nick === players[i].nick)
            players[i]._bet(args[0]);
      } else
        channel.sendMessage("@" + nick + " wait for the next game.");
      break;
    case "join":
      if (joinedPlayers.indexOf(nick) == -1) {
        var currentCredits = Users[nick];
        if (typeof currentCredits != 'undefined') {
          if (currentCredits <= 0) {
            channel.sendMessage("@" + nick + " you can not play due to insufficiant credits");
            return;
          } else {
            joinedPlayers.push(nick);
            if (gameInProgress)
              channel.sendMessage("@" + nick + " you are enlisted to join, The game is currently in progress, wait for the next one.\nYou have: " + currentCredits);
            else
              channel.sendMessage("@" + nick + " you are enlisted to join, type 'start' to start the game.\nYou have: " + currentCredits);
            return;
          }
        } else {
          currentCredits = 1000;
          Users[nick] = currentCredits;
          joinedPlayers.push(nick);
          if (gameInProgress)
            channel.sendMessage("@" + nick + " you are enlisted to join, The game is currently in progress, wait for the next one\nYou are new and have been given " + currentCredits + " credits.");
          else
            channel.sendMessage("@" + nick + " you are enlisted to join, type 'start' to start the game.\nYou are new and have been given " + currentCredits + " credits.");
        }
      } else
        channel.sendMessage("@" + nick + " you are already enlisted.");
      break;
    case "leave":
      if (joinedPlayers.indexOf(nick) != -1) {
        joinedPlayers.splice(joinedPlayers.indexOf(nick), 1);
        channel.sendMessage("@" + nick + " hope to see you soon :)!");
      }
      for (var i = 0; i < players.length; i++)
        if (nick === players[i].nick) {
          players[i]._stand();
          players.splice(players[i]);
        }
      break;
    case "start":
      startGame(true);
      break;
    case "shutDown":
      process.exit();
      break;
    default:
      //channel.sendMessage('Unknown command');
      break;
  };
});

function startGame(isNew) {
  if (!gameInProgress) {
    if (joinedPlayers.length > 0) {
      gameInProgress = true;
      players = [];
      _generateDeck();
      _shuffleDeck();

      BJDealer = new Dealer();

      if (isNew)
        channel.sendMessage("New game started with: " + joinedPlayers + ".\nAll players must bet now, use bet <amount> to do so");

      for (var i = 0; i < joinedPlayers.length; i++) {
        if (Users[joinedPlayers[i]] <= 0) {
          channel.sendMessage(joinedPlayers[i] + " was removed from the game due to insufficiant credits");
          joinedPlayers.splice(joinedPlayers.indexOf(joinedPlayers[i]), 1);
        } else
          players.push(new Player(joinedPlayers[i], Users[joinedPlayers[i]]));
      }
      gameInProgress = true;
    } else
      channel.sendMessage("No one has enlisted to play yet, type 'join' to enlist for the next game.");
  }
};

function Card(id, suit, value) {
  this.id = id;
  this.value = _getValue(value);
  this.name = _getName(value);
  this.suit = _getSuit(suit);
};
var _getValue = function(value) {
  switch (value) {
    case 0:
      return 10;
      break;
    case 1:
      return 11;
      break;
    case 11:
      return 10;
      break;
    case 12:
      return 10;
      break;
    default:
      return value;
      break;
  }
};
var _getName = function(value) {
  switch (value) {
    case 0:
      return "King";
      break;
    case 1:
      return "Ace";
      break;
    case 11:
      return "Jack";
      break;
    case 12:
      return "Queen";
      break;
    default:
      return value;
      break;
  }
};
var _getSuit = function(suit) {
  switch (suit) {
    case 0:
      return "Spades";
      break;
    case 1:
      return "Hearts";
      break;
    case 2:
      return "Clubs";
      break;
    case 3:
      return "Diamonds";
      break;
    default:
      return "ERROR IN SUIT";
      break;
  }
};

function Player(nick, credits) {
  this.nick = nick;
  this.credits = credits;
  this.bet = [];
  this.bet[0] = 0;
  this.hands = [];
  this.activehand = 0;
  this.end = false;
  this.dD = [false]; //doubleDown
  this.scores = [];
  this.surrender = false;
  this.blackJack = false;
};

Player.prototype._bet = function(amount) {
  if (typeof amount != 'undefined') {
    if (this.bet[0] == 0) {
      if (amount == 0 || isNaN(amount))
        channel.sendMessage("@" + this.nick + " you have to bet something");
      else if (amount < 0)
        channel.sendMessage("@" + this.nick + " you can not bet negative");
      else {
        if (amount > this.credits)
          channel.sendMessage("@" + this.nick + " you do not have enough credits");
        else {
          this.bet[0] = amount;
          this.credits -= amount;
          Users[this.nick] = this.credits;
          _checkStart();
        }
      }
    }
  } else
    channel.sendMessage("@" + this.nick + " syntax is bet [amount]");
};
Player.prototype._startHand = function() {
  this.hands = [];
  this.activehand = 0;
  var hand = [];
  hand.push(deck.shift());
  hand.push(deck.shift());
  this.hands.push(hand);
};
Player.prototype._split = function() {
  var succesSplit = false;
  for (var i = 0; i < this.hands.length; i++)
    if (this._checkSplit(this.hands[i]))
      if (this.credits >= this.bet[i]) {
        this.bet[i + 1] = this.bet[i];
        this.credits -= this.bet[i];
        var hand1 = [this.hands[i][0], deck.shift()];
        var hand2 = [this.hands[i][1], deck.shift()];
        this.hands[i] = hand1;
        this.hands.push(hand2);
        succesSplit = true;
        break;
      } else
        channel.sendMessage("@" + this.nick + " you do not have enough credits to split.");
  if (succesSplit)
    channel.sendMessage(this._displayHand());
  else
    channel.sendMessage("unable to split");
};
Player.prototype._checkSplit = function(hand) {
  var canSplit = false;
  if (hand[0].name === hand[1].name)
    canSplit = true;
  return canSplit;
};
Player.prototype._displayHand = function() {
  var text = "@" + this.nick + "\t betted: ";
  if (this.hands.length > 1) {
    for (var i = 0; i < this.hands.length; i++)
      text += this.bet[i] + " hand" + (i + 1) + "\t";
    text += "has: " + this.credits + "\n";
    text += " playing with hand " + this.activehand;
    text += "\n";
    for (var i = 0; i < this.hands.length; i++) {
      text += "Hand " + (i + 1) + " holds ";
      var hand = this.hands[i];
      for (var j = 0; j < hand.length; j++)
        text += hand[j].name + " of " + hand[j].suit + "\t";
      if (this.dD[this.activehand])
        text += "Double Down";
      text += "\nWith a total score: " + this._getScore(hand) + "\n\n";
    }
  } else {
    text += this.bet[0] + " has: " + this.credits + "\n";
    var hand = this.hands[0];
    for (var j = 0; j < hand.length; j++)
      text += hand[j].name + " of " + hand[j].suit + "\t";
    if (this.dD[this.activehand])
      text += "Double Down";
    text += "\nWith a total score: " + this._getScore(hand) + "\n\n";
  }
  return text;
};
Player.prototype._getScore = function(hand) {
  var sum = 0;
  for (var i = 0; i < hand.length; i++)
    sum += hand[i].value;
  return sum;
};
Player.prototype._hit = function() {
  if (!this.end) {
    this.hands[this.activehand].push(deck.shift());
    channel.sendMessage(this._displayHand() + this._checkBust());
    this._checkBust2();
  }
};
Player.prototype._doubleDown = function() {
  if (!this.end)
    if (this.credits >= this.bet[this.activehand]) {
      this.credits -= this.bet[this.activehand];
      this.bet[this.activehand] *= 2;
      this.hands[this.activehand].push(deck.shift());
      this.dD[this.activehand] = true;
      channel.sendMessage(this._displayHand() + this._checkBust());
      this._stand();
    } else
      channel.sendMessage("@" + this.nick + " you do not have enough credits to doubleDown.");
};
Player.prototype._checkBust = function() {
  var score = this._getScore(this.hands[this.activehand]);
  this.scores[this.activehand] = score;
  if (score === 21) {
    if (this.hands[this.activehand].length == 2) {
      if (this.hands.length === 1) {
        this.blackJack = true;
        return "$$@" + this.nick + " \\space has \\space a \\space BlackJack! $$";
      }
      return "";
    }
  } else if (score > 21) {
    for (var i = 0; i < this.hands[this.activehand].length; i++) {
      if (this.hands[this.activehand][i].value === 11) {
        this.hands[this.activehand][i].value = 1;
        this.scores[this.activehand] = this._getScore(this.hands[this.activehand]);
        return "\n\nAce has been swapped for a value of 1, your score is now: " + this._getScore(this.hands[this.activehand]);
      }
    }
    if (this.activehand === this.hands.length - 1) {
      return "\n\nYour hand is busted!";
    } else {
      this.activehand++;
      return "\n\nHand " + (this.activehand) + " is busted!\nNow playing hand: " + (this.activehand + 1);
    }
  }
  return "";
};
Player.prototype._checkBust2 = function() {
  if (this._getScore(this.hands[this.activehand]) > 20)
    this._stand();
};
Player.prototype._stand = function() {
  if (this.activehand == (this.hands.length - 1)) {
    this.end = true;
    _checkWin();
  } else {
    this.activehand++;
    channel.sendMessage("@" + this.nick + " Now playing hand: " + (this.activehand + 1));
  }
};
Player.prototype._surrender = function() {
  if (this.hands.length === 1 && this.hands[0].length === 2) {
    this.end = true;
    this.surrender = true;
    this.bet[0] /= 2;
    Users[this.nick] += Math.floor(this.bet[0]);
    channel.sendMessage("@" + this.nick + " surrenderd.")
    _checkWin();
  } else {
    channel.sendMessage("@" + this.nick + " you already played a move, you can not surrender at this time.")
  }
}

var _generateDeck = function() {
  deck = [];
  for (var i = 0; i < 4; i++)
    for (var j = 0; j < 13; j++) {
      var somecard = new Card((i + j), i, j);
      deck.push(somecard);
    }
};

var _checkWin = function() {
  var isEnd = true;
  for (var i = 0; i < players.length; i++)
    if (!players[i].end)
      isEnd = false;
  if (isEnd) {
    _endGame();
    gameInProgress = false;
    startGame(false);
  }
};

var _endGame = function() {
  var text = "";
  if (_checkBustedPlayers()) {
    text += "All players got busted and lose their credits, " + botName + " wins!";
    text += "\n\n" + BJDealer._displayFullHand();
    text += "\n\nNew game automatically started with: " + joinedPlayers + ".\nAll players must bet now, use bet <amount> to do so";
    channel.sendMessage(text);
    return;
  } else {
    text += BJDealer._displayFullHand() + "\n\n";
    while (BJDealer.scores < 17)
      text += BJDealer._hit() + "\n\n";
  }
  channel.sendMessage(text + _calculateWinner());
};

function _checkBustedPlayers() {
  var allplayersBusted = true;
  for (var i = 0; i < players.length; i++)
    for (var j = 0; j < players[i].hands.length; j++)
      if (players[i].scores[j] < 22)
        allplayersBusted = false;
  return allplayersBusted;
};

function _calculateWinner() {
  var text = "\n\n";
  var dealerScore = BJDealer.scores;
  if (dealerScore > 21)
    dealerScore = 0;
  for (var i = 0; i < players.length; i++) {
    for (var j = 0; j < players[i].hands.length; j++) {
      if (players[i].blackJack) {
        Users[players[i].nick] += (Math.floor(((players[i].bet[0] / 2) * 3) + players[i].bet[0]));
        text += players[i].nick + " had a $\\color{lightBlue}{BlackJack}$ and get's paid a 3:2 ratio, he wins: " + (Math.floor(((players[i].bet[0] / 2) * 3) + players[i].bet[0])) + "\nYou now have a total of: " + Users[players[i].nick] + "\n\n";
      } else if (players[i].scores[j] < 22 && players[i].scores[j] > dealerScore) { //If more then the dealerScore
        Users[players[i].nick] += (players[i].bet[j] * 2);
        text += players[i].nick + " $\\color{lightGreen}{won}$ and get's paid a 2:1 ratio, he wins: " + (players[i].bet[j] * 2) + "\nYou now have a total of: " + Users[players[i].nick] + "\n\n";
      } else if (players[i].scores[j] < 22 && players[i].scores[j] == dealerScore) {
        Users[players[i].nick] += (players[i].bet[j] * 2);
        text += players[i].nick + " has a $\\color{orange}{push}$, and gets his bet(" + players[i].bet[j] + ") back.\nYou now have a total of: " + Users[players[i].nick] + "\n\n";
      } else
        text += players[i].nick + " you $\\color{red}{lost}$ and lose your bet(" + players[i].bet[j] + ").\nYou now have a total of: " + Users[players[i].nick] + "\n\n";
    }
  }
  fs.writeFile("./users.json", JSON.stringify(Users), function() {});

  text += "New game automatically started with: " + joinedPlayers + ".\nAll players must bet now, use bet <amount> to do so";
  return text;
};

var _shuffleDeck = function() {
  var currentIndex = deck.length,
    temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = deck[currentIndex];
    deck[currentIndex] = deck[randomIndex];
    deck[randomIndex] = temporaryValue;
  }
};

var _checkStart = function() {
  var canStart = true;
  for (var i = 0; i < players.length; i++)
    if (players[i].bet == 0)
      canStart = false;
  if (canStart) {
    var text = "";
    text += BJDealer._displayHiddenHand() + "\n\n";
    for (var i = 0; i < players.length; i++) {
      players[i]._startHand();
      text += players[i]._displayHand() + "\n\n";
    }
    for (var i = 0; i < players.length; i++) {
      text += players[i]._checkBust();
    }
    channel.sendMessage(text);
  }
};

function Dealer() {
  this.hand = [];
  this.end = false;
  this.scores;
  this._startHand();
};

Dealer.prototype._startHand = function() {
  this.hand = [];
  this.hand.push(deck.shift());
  this.hand.push(deck.shift());
  this.scores = this._getScore();
};

Dealer.prototype._displayFullHand = function() {
  var text = "Dealer has: ";
  for (var i = 0; i < this.hand.length; i++) {
    text += this.hand[i].name + " of " + this.hand[i].suit + "\t";
  }
  text += "\nWith a total score: " + this._getScore() + "\n";
  return text;
};

Dealer.prototype._displayHiddenHand = function() {
  var text = "Dealer has: ";
  text += this.hand[0].name + " of " + this.hand[0].suit + "\tand one hidden card.";
  return text;
};

Dealer.prototype._getScore = function() {
  var sum = 0;
  for (var i = 0; i < this.hand.length; i++)
    sum += this.hand[i].value;
  return sum;
};

Dealer.prototype._hit = function() {
  this.hand.push(deck.shift());
  this.scores = this._getScore();
  return "Dealer hits!\n" + this._displayFullHand();
};

Dealer.prototype._checkBust = function() {
  var score = this._getScore();
  this.scores = score;
  if (score >= 21) {
    this.end = true;
    _checkWin();
  }
};

Dealer.prototype._stand = function() {
  this.end = true;
  _checkWin();
};
