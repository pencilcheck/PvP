define(function () {
  'user strict';

  return function (GameStates, UserSession, Game) {
    return function (games) {
      var filtered = {}

      function visible(game) {
        var Gameinfo = new Game()
        var gamePublic = game.state >= GameStates.invitesSent && _.keys(game.participants).length < Gameinfo._limit && !_.has(game, 'invitations')
        if (UserSession.signedIn()) {
          var invited = game.state >= GameStates.invitesSent && Array.isArray(game.invitations) && game.invitations.indexOf(UserSession.currentUser().uid) != -1
          var partOfGame = game.state >= GameStates.movesPicked && game.participants[UserSession.currentUser().uid]
          var yourthehost = game.host && game.host == UserSession.currentUser().uid
          return gamePublic || invited || partOfGame || yourthehost
        } else {
          return gamePublic
        }
      }

      games.$getIndex().forEach(function (index) {
        if (visible(games[index])) {
          filtered[index] = games[index]
        }
      })

      return filtered
    }
  };
});
