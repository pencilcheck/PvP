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
      var invited = (Array.isArray(game.invitations) && game.invitations.indexOf(UserSession.currentUser().uid) != -1)
      var gameInvited = game.state >= GameStates.invitesSent
      var yourthehost = game.host && game.host.uid == UserSession.currentUser().uid
      var notthehost = gameInvited || invited
      return notthehost || yourthehost
    })

    var maps = {}
    list.forEach(function (game, index) {
      maps[games.$getIndex()[index]] = game
    })

    return maps
  }
})
