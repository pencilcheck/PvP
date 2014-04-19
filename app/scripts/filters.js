'user strict';

angular.module('PvP')

.filter('calendar', function () {
  return function (timestamp) {
    return timestamp ? moment(timestamp).format('MMMM Do YYYY, h:mm:ss a') : ''
  }
})

.filter('emptyOrInvited', function (GameStates, UserSession) {
  return function (games) {
    var list = games.$getIndex().map(function (index) {
      return games[index]
    })
    list = list.filter(function (game) {
      var invited = game.state >= GameStates.invitesSent && Array.isArray(game.invitations) && game.invitations.indexOf(UserSession.currentUser().uid) != -1
      var gamePublic = game.state >= GameStates.invitesSent && _.keys(game.participants).length > 0 && !_.has(game, 'invitations')
      var yourthehost = game.host && game.host.uid == UserSession.currentUser().uid
      return gamePublic || invited || yourthehost
    })

    var maps = {}
    list.forEach(function (game, index) {
      maps[games.$getIndex()[index]] = game
    })

    return maps
  }
})
