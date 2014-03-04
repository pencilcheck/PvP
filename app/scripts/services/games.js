'user strict';

angular.module('PvP')
  .factory('Games', function ($rootScope, $q, Channel, firebaseUrl, $firebase) {
    var games = $firebase(new Firebase(firebaseUrl + 'games'));

    //Channel.setup('games', {
      //onmessage: function (message) {
        //$rootScope.$apply(function () {
          //games.length = 0; // clears an array
          //games.push.apply(JSON.parse(message.data)); // concat to it
        //});
      //}
    //});

    return {
      g: games,
      all: function () {
        return games;
      },

      get: function (id) {
        return games[id];
      },

      join: function (id, user) {
        game = games[id];
        game.players[user.uid] = {
          uid: user.uid,
          selectedMoves: {},
          health: 10,
          name: user.firstname
        };

        if (!game.state) {
          game.state = {
            name: 'waiting_join',
            detail: ''
          }
        } else if (game.state.name == 'waiting_join' && game.state.detail != user.uid) {
          game.state = {
            name: 'waiting_pick',
            detail: 'both'
          }
        }
        games.$save(id);

        //Channel.setup('game#' + gameId, {
          //onmessage: function (message) {
            //$rootScope.$apply(function () {
              //var msgId = message.data.id;
              //switch (msgId) {
              //case 'cj':
                //// Challenger joined
                //activityLog.push('Challenger ' + message.data.player.name + ' joined');

                //// Assuming all the keys stay the same
                //for (var key in message.data.player) {
                  //challenger[key] = message.data.player[key];
                //}
                //break;
              //case 'cms':
                //// Challenger done selecting moves
                //activityLog.push('Challenger ' + message.data.player.name + ' done selecting moves,');
                //break;
              //case 'cms':
                //// Challenger done selecting his move for the round id
                //activityLog.push('Challenger ' + message.data.player.name + ' done selecting a move for this round');
                //break;
              //}
            //});
          //}
        //});

        // Notify server
        //$http.post('/game/join', {gameId: gameId, userId: userId});
      }
    };
  });
