'user strict';

angular.module('PvP')

.filter('calendar', function () {
  return function (timestamp) {
    return timestamp ? moment(timestamp).format('MMMM Do YYYY, h:mm:ss a') : ''
  }
})

.filter('emptyOrInvited', function (GameStates, UserSession, Game) {
  return function (games) {
    var filtered = {}

    function visible(game) {
      var Gameinfo = new Game()
      var invited = game.state >= GameStates.invitesSent && Array.isArray(game.invitations) && game.invitations.indexOf(UserSession.currentUser().uid) != -1
      var gamePublic = game.state >= GameStates.invitesSent && _.keys(game.participants).length < Gameinfo._limit && !_.has(game, 'invitations')
      var partOfGame = game.state >= GameStates.movesPicked && game.participants[UserSession.currentUser().uid]
      var yourthehost = game.host && game.host.uid == UserSession.currentUser().uid
      return gamePublic || invited || partOfGame || yourthehost
    }

    games.$getIndex().forEach(function (index) {
      if (visible(games[index])) {
        filtered[index] = games[index]
      }
    })

    return filtered
  }
})
